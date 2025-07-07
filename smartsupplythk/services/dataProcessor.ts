import * as XLSX from "xlsx"
import type { Transaction, ProductInputData, ProductCalculatedData } from "../types"
import { TRANSACTION_REQUIRED_HEADERS, TRANSACTION_NUMERIC_COLUMNS, CALCULATION_NUMERIC_COLUMNS } from "../constants"

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== "string") return null
  const parts = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (!parts) return null

  const d = Number.parseInt(parts[1], 10)
  const m = Number.parseInt(parts[2], 10)
  const y = Number.parseInt(parts[3], 10)

  if (y < 1970 || y > 3000 || m === 0 || m > 12 || d === 0 || d > 31) return null

  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d) {
    return date
  }
  return null
}

const validateAndMapHeaders = (uploadedHeaders: string[]): { headerMap: Map<string, number>; error?: string } => {
  const headerMap = new Map<string, number>()
  const trimmedUploadedHeaders = uploadedHeaders.map((h) => (h ? String(h).trim() : ""))

  const missingHeaders: string[] = []

  TRANSACTION_REQUIRED_HEADERS.forEach((requiredHeader) => {
    const index = trimmedUploadedHeaders.indexOf(requiredHeader)
    if (index === -1) {
      missingHeaders.push(requiredHeader)
    } else {
      headerMap.set(requiredHeader, index)
    }
  })

  if (missingHeaders.length > 0) {
    return {
      headerMap,
      error: `Encabezados requeridos no encontrados en el archivo: ${missingHeaders.join(", ")}.`,
    }
  }

  return { headerMap }
}

const aggregateTransactionsToProducts = (
  transactions: Transaction[],
  numPeriods: number,
): { data: ProductInputData[]; error?: string } => {
  if (transactions.length === 0) {
    return { data: [] }
  }

  const latestDate = new Date(Math.max(...transactions.map((t) => t.fechaDate.getTime())))
  latestDate.setUTCHours(23, 59, 59, 999)

  const currentMonthStart = new Date(Date.UTC(latestDate.getUTCFullYear(), latestDate.getUTCMonth(), 1))
  const currentMonthEnd = new Date(Date.UTC(latestDate.getUTCFullYear(), latestDate.getUTCMonth() + 1, 0))
  currentMonthEnd.setUTCHours(23, 59, 59, 999)

  const periodEndDates: Date[] = []
  for (let i = 0; i < numPeriods; i++) {
    const endDate = new Date(latestDate)
    endDate.setUTCDate(latestDate.getUTCDate() - i * 7)
    periodEndDates.push(endDate)
  }

  const productGroups = new Map<string, Transaction[]>()
  transactions.forEach((t) => {
    const group = productGroups.get(t["ID_Producto / SKU"])
    if (group) {
      group.push(t)
    } else {
      productGroups.set(t["ID_Producto / SKU"], [t])
    }
  })

  const aggregatedProducts: ProductInputData[] = []
  const errors: string[] = []

  productGroups.forEach((productTransactions, sku) => {
    const firstTransaction = productTransactions[0]

    const salesPeriods = Array(numPeriods).fill(0)
    let ventaTotalMesActual = 0

    productTransactions.forEach((t) => {
      for (let i = 0; i < numPeriods; i++) {
        const periodEnd = periodEndDates[i]
        const periodStart = new Date(periodEnd)
        periodStart.setUTCDate(periodEnd.getUTCDate() - 6)
        periodStart.setUTCHours(0, 0, 0, 0)

        if (t.fechaDate >= periodStart && t.fechaDate <= periodEnd) {
          salesPeriods[i] += t["Unidades_Vendidas"]
          break
        }
      }
      if (t.fechaDate >= currentMonthStart && t.fechaDate <= currentMonthEnd) {
        ventaTotalMesActual += t["Unidades_Vendidas"]
      }
    })

    const firstSaleDate = new Date(Math.min(...productTransactions.map((t) => t.fechaDate.getTime())))
    const weekInMillis = 7 * 24 * 60 * 60 * 1000
    const productAgeInMillis = latestDate.getTime() - firstSaleDate.getTime()
    const productAgeInWeeks = Math.ceil((productAgeInMillis + 1) / weekInMillis)
    const divisorForAverage = Math.max(1, Math.min(productAgeInWeeks, numPeriods))

    aggregatedProducts.push({
      "ID_Producto / SKU": sku,
      Nombre: firstTransaction["Nombre"],
      Venta_Total_Mes_Actual: ventaTotalMesActual,
      Frecuencia_Reposicion: firstTransaction["Frecuencia_Reposicion"],
      Semanas_Cobertura_Stock: firstTransaction["Semanas_Cobertura_Stock"],
      Stock_Actual: firstTransaction["Stock_Actual"],
      Lead_Time_Dias: firstTransaction["Lead_Time_Dias"],
      salesPeriods: salesPeriods,
      rowIndex: firstTransaction.rowIndex,
      Divisor_Periodos: divisorForAverage,
    })
  })

  return { data: aggregatedProducts, error: errors.length > 0 ? errors.join("\n") : undefined }
}

const calculateReplenishment = (products: ProductInputData[]): ProductCalculatedData[] => {
  return products.map((product) => {
    try {
      for (const key of CALCULATION_NUMERIC_COLUMNS) {
        if (typeof (product as any)[key] !== "number" || isNaN((product as any)[key])) {
          throw new Error(`Dato de entrada inválido para ${key}: "${(product as any)[key]}" no es un número válido.`)
        }
      }

      if (
        !Array.isArray(product.salesPeriods) ||
        product.salesPeriods.some((sale) => typeof sale !== "number" || isNaN(sale))
      ) {
        throw new Error(`Datos de ventas por período contienen valores no numéricos.`)
      }

      if (product.Divisor_Periodos <= 0) {
        throw new Error(`El divisor de períodos calculado (${product.Divisor_Periodos}) no es válido.`)
      }

      const sumOfSales = product.salesPeriods.reduce((acc, curr) => acc + curr, 0)
      const divisor = product.Divisor_Periodos
      const ventaPromedioSemanal = sumOfSales / divisor

      const stockIdeal = ventaPromedioSemanal * product["Semanas_Cobertura_Stock"]
      let unidadesAAbastecer = stockIdeal - product["Stock_Actual"]
      unidadesAAbastecer = Math.max(0, unidadesAAbastecer)

      return {
        ...product,
        Venta_Promedio_Semanal: Math.round(ventaPromedioSemanal),
        Stock_Ideal: Math.round(stockIdeal),
        Unidades_A_Abastecer: Math.round(unidadesAAbastecer),
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : "Error de cálculo desconocido"
      return {
        ...product,
        salesPeriods: product.salesPeriods || [],
        Venta_Promedio_Semanal: 0,
        Stock_Ideal: 0,
        Unidades_A_Abastecer: 0,
        Venta_Total_Mes_Actual: product.Venta_Total_Mes_Actual || 0,
        Divisor_Periodos: product.Divisor_Periodos || 1,
        error: `Error para SKU ${product["ID_Producto / SKU"] || `en fila ${product.rowIndex}`}: ${error}`,
      }
    }
  })
}

const parseTransactionsFromData = (
  data: any[][],
  headerMap: Map<string, number>,
): { transactions: Transaction[]; error?: string } => {
  const transactions: Transaction[] = []
  const errors: string[] = []

  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    if (row.every((cell) => cell === null || cell === "" || cell === undefined)) continue

    let rowHasError = false
    const transactionInput: any = { rowIndex: i + 1 }

    TRANSACTION_REQUIRED_HEADERS.forEach((header) => {
      const key = header as keyof Transaction
      const colIndex = headerMap.get(header)!
      const value = row[colIndex] !== null && row[colIndex] !== undefined ? String(row[colIndex]).trim() : ""

      if (TRANSACTION_NUMERIC_COLUMNS.includes(key as any)) {
        const numValue = Number.parseFloat(value)
        if (value === "" || isNaN(numValue)) {
          errors.push(`Fila ${i + 1}, Columna "${header}": Valor "${value}" no es un número válido.`)
          rowHasError = true
        } else {
          transactionInput[key] = numValue
        }
      } else {
        transactionInput[key] = value
      }
    })

    if (!transactionInput["ID_Producto / SKU"]) {
      errors.push(`Fila ${i + 1}: "ID_Producto / SKU" no puede estar vacío.`)
      rowHasError = true
    }

    const fechaDate = parseDate(transactionInput["Fecha"]!)
    if (!fechaDate) {
      errors.push(
        `Fila ${i + 1}: Formato de fecha inválido para "${transactionInput["Fecha"] || ""}". Se esperaba DD/MM/AAAA.`,
      )
      rowHasError = true
    }

    if (!rowHasError) {
      transactions.push({ ...transactionInput, fechaDate: fechaDate! })
    }
  }

  const errorString = errors.length > 0 ? `Problemas al analizar datos:\n- ${errors.join("\n- ")}` : undefined
  return { transactions, error: errorString }
}

export const processAndCalculate = async (
  file: File,
  numPeriods: number,
): Promise<{ results: ProductCalculatedData[]; error?: string }> => {
  try {
    let rawData: any[][] = []
    let headerRow: any[] = []

    if (file.name.toLowerCase().endsWith(".csv")) {
      const csvString = await file.text()
      const rows = csvString
        .trim()
        .split("\n")
        .map((row) => row.split(","))
      if (rows.length < 2)
        return { results: [], error: "El archivo CSV debe contener al menos una fila de encabezado y una de datos." }
      headerRow = rows[0]
      rawData = rows
    } else if (file.name.toLowerCase().endsWith(".xlsx")) {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "buffer", cellDates: true })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!worksheet) return { results: [], error: "El archivo Excel no contiene hojas." }
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1, raw: false, defval: "" })
      if (jsonData.length < 2)
        return { results: [], error: "El archivo Excel debe contener al menos una fila de encabezado y una de datos." }
      headerRow = jsonData[0]
      rawData = jsonData
    } else {
      return { results: [], error: "Tipo de archivo no compatible. Por favor, sube un archivo .csv o .xlsx." }
    }

    const { headerMap, error: headerError } = validateAndMapHeaders(headerRow)
    if (headerError) {
      return { results: [], error: headerError }
    }

    const { transactions, error: parseError } = parseTransactionsFromData(rawData, headerMap)

    if (transactions.length === 0) {
      return { results: [], error: parseError || "No se encontraron transacciones válidas en el archivo." }
    }

    const { data: aggregatedData, error: aggregationError } = aggregateTransactionsToProducts(transactions, numPeriods)

    const finalResults = calculateReplenishment(aggregatedData)

    const allErrors = [parseError, aggregationError].filter(Boolean).join("\n\n")

    return { results: finalResults, error: allErrors || undefined }
  } catch (e) {
    const error = e instanceof Error ? e.message : "Ocurrió un error desconocido al procesar el archivo."
    return { results: [], error: `Error Crítico: ${error}` }
  }
}

export const exportResultsToExcel = (results: ProductCalculatedData[]): void => {
  if (!results || results.length === 0) return

  const numPeriods = results[0]?.salesPeriods.length || 0

  const dataToExport = results.map((product) => {
    const productData: { [key: string]: any } = {
      SKU: product["ID_Producto / SKU"],
      Nombre: product.Nombre,
      "Venta Mes Actual": product.Venta_Total_Mes_Actual,
    }

    for (let i = 0; i < numPeriods; i++) {
      const headerIndex = numPeriods - i
      const dataIndex = numPeriods - 1 - i
      productData[`Venta S${headerIndex}`] = product.salesPeriods[dataIndex]
    }

    Object.assign(productData, {
      "Venta Promedio Semanal": product.Venta_Promedio_Semanal,
      "Semanas Cobertura Stock": product.Semanas_Cobertura_Stock,
      "Stock Actual": product.Stock_Actual,
      "Stock Ideal": product.Stock_Ideal,
      "Unidades a Abastecer": product.Unidades_A_Abastecer,
      "Frecuencia Reposicion": product.Frecuencia_Reposicion,
      "Lead Time (Dias)": product.Lead_Time_Dias,
      Estado: product.error
        ? product.error.replace(`Error para SKU ${product["ID_Producto / SKU"] || `en fila ${product.rowIndex}`}: `, "")
        : "OK",
    })
    return productData
  })

  const worksheet = XLSX.utils.json_to_sheet(dataToExport)

  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "FFE0E0E0" } },
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"]!)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C })
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = headerStyle
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Abastecimiento")
  XLSX.writeFile(workbook, "Smart_Supply_Abastecimiento_Report.xlsx")
}

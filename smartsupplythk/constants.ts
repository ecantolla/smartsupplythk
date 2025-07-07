export const TRANSACTION_REQUIRED_HEADERS: string[] = [
  "ID_Producto / SKU",
  "Nombre",
  "Fecha",
  "Unidades_Vendidas",
  "Semanas_Cobertura_Stock",
  "Stock_Actual",
  "Lead_Time_Dias",
  "Frecuencia_Reposicion",
]

export const TRANSACTION_NUMERIC_COLUMNS: (keyof import("./types").TransactionInputData)[] = [
  "Unidades_Vendidas",
  "Semanas_Cobertura_Stock",
  "Stock_Actual",
  "Lead_Time_Dias",
]

export const CALCULATION_NUMERIC_COLUMNS: (keyof Omit<
  import("./types").ProductInputData,
  "salesPeriods" | "ID_Producto / SKU" | "Nombre" | "Frecuencia_Reposicion" | "rowIndex"
>)[] = ["Semanas_Cobertura_Stock", "Stock_Actual", "Lead_Time_Dias", "Divisor_Periodos"]

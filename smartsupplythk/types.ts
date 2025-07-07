export interface TransactionInputData {
  rowIndex: number
  "ID_Producto / SKU": string
  Nombre: string
  Fecha: string
  Unidades_Vendidas: number
  Semanas_Cobertura_Stock: number
  Stock_Actual: number
  Lead_Time_Dias: number
  Frecuencia_Reposicion: string
}

export interface Transaction extends Omit<TransactionInputData, "Fecha"> {
  fechaDate: Date
}

export interface ProductInputData {
  rowIndex: number
  "ID_Producto / SKU": string
  Nombre: string
  Venta_Total_Mes_Actual: number
  Frecuencia_Reposicion: string
  salesPeriods: number[]
  Semanas_Cobertura_Stock: number
  Stock_Actual: number
  Lead_Time_Dias: number
  Divisor_Periodos: number
}

export interface ProductCalculatedData extends ProductInputData {
  Venta_Promedio_Semanal: number
  Stock_Ideal: number
  Unidades_A_Abastecer: number
  error?: string
}

export type AppView = "upload" | "results"

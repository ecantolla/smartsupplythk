import type React from "react"
import type { ProductCalculatedData } from "../types"

interface ResultsTableProps {
  results: ProductCalculatedData[]
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  if (!results || results.length === 0) {
    return <p className="text-center text-slate-600 my-8">No results to display.</p>
  }

  const numPeriods = results[0]?.salesPeriods?.length || 0
  const periodHeaders = Array.from({ length: numPeriods }, (_, i) => `Venta S${numPeriods - i}`)

  const staticHeaders = [
    "Venta Prom. Semanal",
    "Semanas Cobertura",
    "Stock Actual",
    "Stock Ideal",
    "Unidades a Abastecer",
    "Frec. Reposición",
    "Lead Time (Días)",
    "Estado",
  ]

  const headers = ["SKU", "Nombre", "Venta Mes Actual", ...periodHeaders, ...staticHeaders]

  const getAlignmentClass = (header: string): string => {
    const numericHeaders = new Set([
      "Venta Mes Actual",
      ...periodHeaders,
      "Venta Prom. Semanal",
      "Semanas Cobertura",
      "Stock Actual",
      "Stock Ideal",
      "Unidades a Abastecer",
      "Lead Time (Días)",
    ])
    if (header === "Estado" || header === "Frec. Reposición") {
      return "text-center"
    }
    if (numericHeaders.has(header)) {
      return "text-right"
    }
    return "text-left"
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className={`sticky top-0 z-10 bg-slate-100 px-2 py-3 text-sm font-bold text-slate-600 uppercase tracking-wider align-middle break-words text-center`}
                  style={{ maxWidth: "120px" }}
                  title={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {results.map((product, pIndex) => {
              const productName = product.Nombre || ""

              return (
                <tr
                  key={product["ID_Producto / SKU"] + pIndex}
                  className={product.error ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50"}
                >
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 align-top ${getAlignmentClass("SKU")}`}
                  >
                    {product["ID_Producto / SKU"]}
                  </td>

                  <td className={`px-4 py-3 text-sm text-slate-800 align-top ${getAlignmentClass("Nombre")}`}>
                    <div
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={productName}
                    >
                      {productName}
                    </div>
                  </td>

                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-medium align-top ${getAlignmentClass("Venta Mes Actual")}`}
                  >
                    {product.Venta_Total_Mes_Actual}
                  </td>

                  {[...(product.salesPeriods || [])].reverse().map((sale, sIndex) => (
                    <td
                      key={sIndex}
                      className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 align-top ${getAlignmentClass(periodHeaders[sIndex])}`}
                    >
                      {sale}
                    </td>
                  ))}

                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-medium align-top ${getAlignmentClass("Venta Prom. Semanal")}`}
                  >
                    {product.Venta_Promedio_Semanal}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 align-top ${getAlignmentClass("Semanas Cobertura")}`}
                  >
                    {product.Semanas_Cobertura_Stock}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 align-top ${getAlignmentClass("Stock Actual")}`}
                  >
                    {product.Stock_Actual}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-medium align-top ${getAlignmentClass("Stock Ideal")}`}
                  >
                    {product.Stock_Ideal}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-bold align-top ${getAlignmentClass("Unidades a Abastecer")}`}
                  >
                    {product.Unidades_A_Abastecer}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 align-top ${getAlignmentClass("Frec. Reposición")}`}
                  >
                    {product.Frecuencia_Reposicion}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm text-slate-800 align-top ${getAlignmentClass("Lead Time (Días)")}`}
                  >
                    {product.Lead_Time_Dias}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm align-top ${getAlignmentClass("Estado")}`}>
                    {product.error ? (
                      <span className="text-red-600 font-medium">
                        {product.error.replace(`Error para SKU ${product["ID_Producto / SKU"] || "Unknown"}: `, "")}
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">OK</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ResultsTable

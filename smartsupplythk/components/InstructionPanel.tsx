import type React from "react"
import { TRANSACTION_REQUIRED_HEADERS } from "../constants"

const InstructionPanel: React.FC = () => {
  return (
    <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b-2 border-slate-200 pb-3">
        Cómo Empezar con Smart Supply
      </h2>

      <div className="space-y-4 text-slate-700">
        <p>
          <strong className="text-blue-700">Paso 1: Configura tu Análisis</strong>
          <br />
          Define cuántas semanas de historial de ventas deseas analizar usando el selector de períodos a continuación.
        </p>

        <p>
          <strong className="text-blue-700">Paso 2: Prepara tus Datos</strong>
          <br />
          Tu archivo CSV o Excel debe ser un reporte de ventas transaccional. La aplicación requiere las siguientes
          columnas. ¡El orden no importa y puedes incluir columnas adicionales que serán ignoradas!
        </p>
        <ul className="list-disc list-inside bg-slate-50 p-4 rounded-md text-sm space-y-1">
          {TRANSACTION_REQUIRED_HEADERS.map((header) => (
            <li key={header}>
              <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800">{header}</code>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          Nota: La columna <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800">Fecha</code> debe estar en
          formato <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800">DD/MM/AAAA</code>. La aplicación
          calculará automáticamente los períodos de ventas semanales basándose en el número que selecciones y las fechas
          de tus transacciones.
        </p>

        <p>
          <strong className="text-blue-700">Paso 3: Sube tu Archivo</strong>
          <br />
          Utiliza el cargador de archivos para seleccionar tu reporte de ventas.
        </p>

        <p>
          <strong className="text-blue-700">Paso 4: Revisa y Exporta los Resultados</strong>
          <br />
          Los resultados del cálculo de abastecimiento se mostrarán instantáneamente, listos para ser exportados a
          Excel.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-3">Beneficios Clave:</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>
            <strong className="text-blue-700">Flexibilidad:</strong> Analiza el historial de ventas que necesites, desde
            2 a 20 semanas.
          </li>
          <li>
            <strong className="text-blue-700">Automatización:</strong> No más cálculos manuales de ventas por período.
          </li>
          <li>
            <strong className="text-blue-700">Optimización:</strong> Reduce quiebres y excesos de stock.
          </li>
          <li>
            <strong className="text-blue-700">Eficiencia:</strong> Usa tus reportes de venta directamente.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default InstructionPanel

"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface PeriodSelectorProps {
  numPeriods: number
  setNumPeriods: (periods: number) => void
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ numPeriods, setNumPeriods }) => {
  const [inputValue, setInputValue] = useState<string>(String(numPeriods))

  useEffect(() => {
    if (Number.parseInt(inputValue, 10) !== numPeriods) {
      setInputValue(String(numPeriods))
    }
  }, [numPeriods])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = Number.parseInt(e.target.value, 10)

    if (isNaN(value) || value < 2) {
      value = 2
    } else if (value > 20) {
      value = 20
    }

    setNumPeriods(value)
    setInputValue(String(value))
  }

  return (
    <div className="w-full lg:w-1/3 flex flex-col p-4 sm:p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-md">
      <div className="flex-grow flex flex-col justify-center">
        <label htmlFor="period-selector" className="block text-base font-semibold text-slate-800 mb-1 text-center">
          Semanas a Analizar
        </label>
        <p className="text-xs text-slate-500 mb-3 text-center">(mín. 2, máx. 20)</p>
        <input
          type="number"
          id="period-selector"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min="2"
          max="20"
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-bold"
          aria-label="Número de períodos de venta a analizar"
          placeholder="8"
        />
      </div>
    </div>
  )
}

export default PeriodSelector

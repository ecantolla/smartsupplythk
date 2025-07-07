"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import type { ProductCalculatedData, AppView } from "../types"
import { processAndCalculate, exportResultsToExcel } from "../services/dataProcessor"
import Header from "../components/Header"
import Footer from "../components/Footer"
import FileUpload from "../components/FileUpload"
import ResultsTable from "../components/ResultsTable"
import LoadingSpinner from "../components/LoadingSpinner"
import InstructionPanel from "../components/InstructionPanel"
import PeriodSelector from "../components/PeriodSelector"
import SearchFilters from "../components/SearchFilters"

const SmartSupplyApp: React.FC = () => {
  const [calculationResults, setCalculationResults] = useState<ProductCalculatedData[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<AppView>("upload")
  const [currentFileName, setCurrentFileName] = useState<string | null>(null)
  const [numPeriods, setNumPeriods] = useState<number>(8)
  const [skuSearch, setSkuSearch] = useState<string>("")
  const [nameSearch, setNameSearch] = useState<string>("")

  const handleFileUploaded = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      setCalculationResults(null)
      setCurrentFileName(file.name)

      const { results, error: processingError } = await processAndCalculate(file, numPeriods)

      if (processingError) {
        setError(processingError)
      }

      if (results && results.length > 0) {
        setCalculationResults(results)
        setView("results")
      } else {
        setView("upload")
      }

      setIsLoading(false)
    },
    [numPeriods],
  )

  const filteredResults = useMemo(() => {
    if (!calculationResults) return []

    const skuSearchTerms = skuSearch
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter((term) => term.length > 0)

    const nameSearchTerms = nameSearch
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter((term) => term.length > 0)

    return calculationResults.filter((product) => {
      const skuMatch =
        skuSearchTerms.length === 0
          ? true
          : skuSearchTerms.some((term) => product["ID_Producto / SKU"].toLowerCase().includes(term))

      const nameMatch =
        nameSearchTerms.length === 0
          ? true
          : nameSearchTerms.some((term) => product.Nombre.toLowerCase().includes(term))

      return skuMatch && nameMatch
    })
  }, [calculationResults, skuSearch, nameSearch])

  const handleExportResults = () => {
    if (filteredResults) {
      exportResultsToExcel(filteredResults)
    }
  }

  const handleStartOver = () => {
    setCalculationResults(null)
    setError(null)
    setIsLoading(false)
    setView("upload")
    setCurrentFileName(null)
    setSkuSearch("")
    setNameSearch("")
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handleClearFilters = () => {
    setSkuSearch("")
    setNameSearch("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {view === "upload" && (
          <div className="flex flex-col items-center gap-8">
            <InstructionPanel />

            <div className="w-full max-w-3xl mx-auto flex flex-col lg:flex-row items-stretch gap-8">
              <PeriodSelector numPeriods={numPeriods} setNumPeriods={setNumPeriods} />
              <FileUpload onFileUploaded={handleFileUploaded} isLoading={isLoading} />
            </div>

            {isLoading && <LoadingSpinner />}
            {error && (
              <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md w-full max-w-3xl whitespace-pre-wrap">
                <h3 className="font-bold text-lg mb-2">
                  Error{currentFileName ? ` (Archivo: ${currentFileName})` : ""}:
                </h3>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {view === "results" && calculationResults && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-700 mb-4 sm:mb-0">
                Resultados del Cálculo de Abastecimiento
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleStartOver}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                  Empezar de Nuevo
                </button>
                <button
                  onClick={handleExportResults}
                  disabled={!filteredResults || filteredResults.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50"
                  aria-label="Exportar resultados a Excel"
                >
                  Exportar a Excel (.xlsx)
                </button>
              </div>
            </div>

            <div className="mb-6 flex justify-end">
              <div className="w-full lg:w-2/3 xl:w-1/2">
                <SearchFilters
                  skuSearch={skuSearch}
                  onSkuChange={setSkuSearch}
                  nameSearch={nameSearch}
                  onNameChange={setNameSearch}
                  totalCount={calculationResults.length}
                  filteredCount={filteredResults.length}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            {currentFileName && (
              <p className="text-sm text-slate-600 mb-4">
                Mostrando resultados para el archivo: <strong>{currentFileName}</strong> (Análisis de {numPeriods}{" "}
                semanas)
              </p>
            )}
            {error && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md w-full whitespace-pre-wrap">
                <h3 className="font-bold text-lg mb-2">Notificaciones del Procesamiento:</h3>
                <p>{error}</p>
              </div>
            )}
            {isLoading ? <LoadingSpinner /> : <ResultsTable results={filteredResults} />}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default SmartSupplyApp

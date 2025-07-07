"use client"

import type React from "react"
import { useCallback, useState } from "react"

interface FileUploadProps {
  onFileUploaded: (file: File) => void
  isLoading: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, isLoading }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false)

  const processFile = (file: File) => {
    const supportedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    const isSupported =
      supportedTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith(".csv") ||
      file.name.toLowerCase().endsWith(".xlsx")

    if (file && isSupported) {
      setFileName(file.name)
      onFileUploaded(file)
    } else {
      setFileName(null)
      alert("Por favor, sube un archivo CSV o XLSX válido.")
    }
  }

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        processFile(file)
      } else {
        setFileName(null)
      }
    },
    [onFileUploaded],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDraggingOver(false)
      if (isLoading) return

      const file = event.dataTransfer.files?.[0]
      if (file) {
        processFile(file)
      } else {
        setFileName(null)
      }
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    },
    [isLoading, onFileUploaded],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      event.stopPropagation()
      if (isLoading) return
      setIsDraggingOver(true)
    },
    [isLoading],
  )

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  return (
    <div className="w-full lg:w-2/3 flex flex-col p-4 sm:p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-md">
      <label
        htmlFor="file-upload"
        className={`flex-grow flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${isLoading ? "cursor-not-allowed bg-slate-100" : "bg-white hover:bg-slate-50"}
                    ${isDraggingOver ? "border-blue-500 bg-blue-50" : "border-slate-300"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-disabled={isLoading}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className={`w-10 h-10 mb-3 ${isDraggingOver ? "text-blue-600" : "text-blue-500"}`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-slate-600">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">CSV or XLSX file with product data</p>
          {fileName && !isLoading && <p className="mt-2 text-xs text-green-600 font-medium">Selected: {fileName}</p>}
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
      {isLoading && <p className="text-sm text-blue-600 mt-4 text-center">Processing file...</p>}
    </div>
  )
}

export default FileUpload

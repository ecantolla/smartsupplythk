"use client"

import type React from "react"

interface SearchFiltersProps {
  skuSearch: string
  onSkuChange: (value: string) => void
  nameSearch: string
  onNameChange: (value: string) => void
  totalCount: number
  filteredCount: number
  onClearFilters: () => void
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  skuSearch,
  onSkuChange,
  nameSearch,
  onNameChange,
  totalCount,
  filteredCount,
  onClearFilters,
}) => {
  const isFilterActive = !!(skuSearch || nameSearch)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="sku-search" className="block text-sm font-medium text-slate-700">
            Buscar por SKU
          </label>
          <input
            type="text"
            id="sku-search"
            placeholder="SKU1, SKU2,..."
            value={skuSearch}
            onChange={(e) => onSkuChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex-grow w-full sm:w-auto">
          <label htmlFor="name-search" className="block text-sm font-medium text-slate-700">
            Buscar por Nombre
          </label>
          <input
            type="text"
            id="name-search"
            placeholder="Nombre1, Nombre2,..."
            value={nameSearch}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                     focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-auto flex-shrink-0">
          <button
            onClick={onClearFilters}
            disabled={!isFilterActive}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       bg-slate-200 hover:bg-slate-300 text-slate-700
                       disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            title="Limpiar filtros de búsqueda"
          >
            Limpiar
          </button>
        </div>
      </div>
      <div className="mt-3 text-right text-sm text-slate-600">
        Mostrando <strong>{filteredCount}</strong> de <strong>{totalCount}</strong> productos
      </div>
    </div>
  )
}

export default SearchFilters

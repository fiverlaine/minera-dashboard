import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) {
    return null
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    // Scroll suave para o topo ao trocar de página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getVisiblePages = () => {
    const delta = 2 // Quantas páginas mostrar de cada lado da atual
    const range = []
    const rangeWithDots = []

    // Sempre mostrar primeira página
    range.push(1)

    // Calcular páginas ao redor da atual
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    // Sempre mostrar última página se não for a primeira
    if (totalPages > 1) {
      range.push(totalPages)
    }

    let l
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      {/* Botão Anterior */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-secondary border border-dark-border hover:bg-dark-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4 text-text-muted" />
      </button>

      {/* Números das páginas */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${index}`}
              className="flex items-center justify-center w-10 h-10 text-text-muted"
            >
              ...
            </span>
          )
        }

        const pageNumber = page as number
        const isActive = pageNumber === currentPage

        return (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors
              ${isActive
                ? 'bg-accent-blue text-white border border-accent-blue'
                : 'bg-dark-secondary border border-dark-border text-text-secondary hover:bg-dark-hover hover:text-text-primary'
              }
            `}
          >
            {pageNumber}
          </button>
        )
      })}

      {/* Botão Próximo */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-secondary border border-dark-border hover:bg-dark-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4 text-text-muted" />
      </button>
    </div>
  )
} 
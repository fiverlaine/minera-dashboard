import React from 'react'
import { AdCard } from './AdCard'
import { Pagination } from './Pagination'
import { Loader2, AlertCircle, Package } from 'lucide-react'
import type { Database } from '../config/supabase'

type Ad = Database['public']['Tables']['ads']['Row']

interface AdGridProps {
  ads: Ad[]
  loading: boolean
  error: string | null
  totalAds: number
  // Paginação
  currentPage: number
  totalPages: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  // Mensagem personalizada para quando não há anúncios
  emptyMessage?: string
  // Controle de favoritos
  showRemoveFavorite?: boolean
  onRemoveFavorite?: (adId: number) => void
}

export const AdGrid: React.FC<AdGridProps> = ({ 
  ads, 
  loading, 
  error, 
  totalAds,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  emptyMessage,
  showRemoveFavorite,
  onRemoveFavorite
}) => {
  if (loading && ads.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card-modern p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-dark-hover rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-dark-hover rounded w-3/4"></div>
                <div className="h-3 bg-dark-hover rounded w-1/2"></div>
              </div>
            </div>
            <div className="aspect-video bg-dark-hover rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-dark-hover rounded w-full"></div>
              <div className="h-4 bg-dark-hover rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-dark-hover rounded w-16"></div>
                <div className="h-6 bg-dark-hover rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-accent-red" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Erro ao carregar anúncios
        </h3>
        <p className="text-text-muted text-center max-w-md mb-6">
          Ocorreu um erro ao tentar carregar os anúncios. Verifique sua conexão e tente novamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="button-primary"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-accent-blue" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Nenhum anúncio encontrado
        </h3>
        <p className="text-text-muted text-center max-w-md mb-6">
          {emptyMessage || "Ainda não há anúncios minerados ou os filtros aplicados não retornaram resultados. Use a extensão para começar a minerar anúncios do Facebook."}
        </p>
        <div className="flex gap-3">
          <button className="button-primary">
            Instalar Extensão
          </button>
          <button className="button-secondary">
            Ver Tutorial
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Grid de Anúncios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ads.map((ad, index) => (
          <div
            key={ad.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <AdCard 
              ad={ad}
              showRemoveFavorite={showRemoveFavorite}
              onRemoveFavorite={onRemoveFavorite}
            />
          </div>
        ))}
      </div>

      {/* Loading durante navegação */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Carregando anúncios...</span>
          </div>
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {/* Estatísticas do rodapé */}
      <div className="mt-8 pt-8 border-t border-dark-border">
        <div className="text-center text-text-muted">
          <p className="text-sm">
            Exibindo{' '}
            <span className="font-semibold text-text-primary">
              {((currentPage - 1) * itemsPerPage) + 1}
            </span>
            {' '}a{' '}
            <span className="font-semibold text-text-primary">
              {Math.min(currentPage * itemsPerPage, totalAds)}
            </span>
            {' '}de{' '}
            <span className="font-semibold text-text-primary">{totalAds.toLocaleString()}</span> anúncios minerados
          </p>
          <p className="text-xs mt-1">
            Página {currentPage} de {totalPages} • Última atualização: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
} 
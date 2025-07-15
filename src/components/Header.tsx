import React, { useState } from 'react'
import { 
  Search, 
  MoreHorizontal, 
  Zap,
  TrendingUp,
  Eye,
  Bell,
  Moon,
  Sun,
  X
} from 'lucide-react'

interface HeaderProps {
  pageTitle: string
  showSearch?: boolean
  showStats?: boolean
  showDescription?: boolean
  totalAds?: number
  hotAds?: number
  recentAds?: number
  onSearch?: (query: string) => void
  onClearSearch?: () => void
  searchQuery?: string
}

export const Header: React.FC<HeaderProps> = ({ 
  pageTitle, 
  showSearch = false, 
  showStats = true,
  showDescription = true,
  totalAds = 0,
  hotAds = 0,
  recentAds = 0,
  onSearch,
  onClearSearch,
  searchQuery = ''
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearch?.(value)
  }

  const handleClearSearch = () => {
    onClearSearch?.()
  }

  const stats = [
    {
      label: 'Total de Ofertas',
      value: totalAds.toLocaleString(),
      icon: Zap,
      color: 'text-accent-blue',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Mais quentes',
      value: hotAds.toLocaleString(),
      icon: TrendingUp,
      color: 'text-accent-orange',
      bgColor: 'bg-orange-500/10'
    },
    {
      label: 'Mais recentes',
      value: recentAds.toLocaleString(),
      icon: Eye,
      color: 'text-accent-green',
      bgColor: 'bg-green-500/10'
    }
  ]

  return (
    <header className="border-b border-dark-border">
      <div className="px-6 py-4">
        {/* Linha superior - Título e ações */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-display">
                {pageTitle}
              </h1>
              {showDescription && (
                <p className="text-sm text-text-muted mt-1">
                  {searchQuery ? `Resultados para "${searchQuery}"` : 'Gerencie e analise seus anúncios minerados'}
                </p>
              )}
            </div>
          </div>

          {/* Ações do header */}
          <div className="flex items-center gap-3">
            {/* Notificações */}
            <button className="relative p-2 text-text-muted hover:text-text-primary hover:bg-dark-hover rounded-lg transition-all duration-200 group">
              <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full text-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </button>

            {/* Toggle tema */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-dark-hover rounded-lg transition-all duration-200 group"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 transition-transform group-hover:scale-110" />
              ) : (
                <Moon className="w-5 h-5 transition-transform group-hover:scale-110" />
              )}
            </button>

            {/* Menu adicional */}
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-dark-hover rounded-lg transition-all duration-200 group">
              <MoreHorizontal className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        {showStats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="card-modern p-4 card-hover">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-xl font-bold text-text-primary">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Barra de pesquisa */}
        {showSearch && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Pesquisar anúncios, anunciantes ou palavras-chave..."
              className="w-full pl-10 pr-12 py-3 bg-dark-tertiary border border-dark-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all duration-200"
            />
            {searchQuery && onClearSearch && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary hover:bg-red-500/10 hover:text-red-400 rounded-r-xl transition-all duration-200"
                title="Limpar pesquisa"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
} 
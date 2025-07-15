import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Clock, 
  Calendar,
  Filter,
  X,
  Languages,
  Monitor,
  Share2,
  BarChart3,
  Search,
  SlidersHorizontal
} from 'lucide-react'
import type { AdFilters } from '../hooks/useAds'

interface FilterBarProps {
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  hotAdsCount: number
  recentAdsCount: number
  weeklyBestAdsCount: number
  updateFilters: (filters: Partial<AdFilters>) => void
}

export default function FilterBar({ 
  activeFilter, 
  onFilterChange, 
  hotAdsCount, 
  recentAdsCount, 
  weeklyBestAdsCount,
  updateFilters
}: FilterBarProps) {
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('todos')
  const [selectedMediaType, setSelectedMediaType] = useState('todos')
  const [selectedPlatform, setSelectedPlatform] = useState('todos')
  const [adCountRange, setAdCountRange] = useState(0)

  // Bloquear scroll quando popup está aberto
  useEffect(() => {
    if (showFilterPopup) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showFilterPopup])

  const mainFilters = [
    {
      id: 'trending',
      label: 'Mais escalados',
      icon: TrendingUp,
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20',
      count: hotAdsCount
    },
    {
      id: 'weekly',
      label: 'Escalados da semana',
      icon: Calendar,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
      count: weeklyBestAdsCount
    },
    {
      id: 'recent',
      label: 'Recentes',
      icon: Clock,
      color: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20',
      count: recentAdsCount
    }
  ]

  const advancedFilters = [
    { 
      id: 'language', 
      label: 'Idioma', 
      icon: Languages,
      options: ['Todos', 'Português', 'Inglês', 'Espanhol'],
      description: 'Filtrar por idioma do anúncio'
    },
    { 
      id: 'mediaType', 
      label: 'Tipo de Mídia', 
      icon: Monitor,
      options: ['Todos', 'Imagem', 'Vídeo'],
      description: 'Filtrar por tipo de conteúdo'
    },
    { 
      id: 'platform', 
      label: 'Plataforma', 
      icon: Share2,
      options: ['Todos', 'Facebook', 'Instagram', 'Messenger'],
      description: 'Filtrar por plataforma de origem'
    }
  ]

  const handleFilterClick = (filterId: string) => {
    const newFilter = activeFilter === filterId ? null : filterId
    onFilterChange(newFilter)
  }

  const clearAllFilters = () => {
    setSelectedLanguage('todos')
    setSelectedMediaType('todos')
    setSelectedPlatform('todos')
    setAdCountRange(0)
    
    updateFilters({
      language: '',
      mediaType: '',
      platform: '',
      minUses: 0
    })
  }

  const applyFilters = () => {
    const mapMediaType = (type: string) => {
      const mapping: { [key: string]: string } = {
        'imagem': 'image',
        'vídeo': 'video'
      }
      return mapping[type.toLowerCase()] || type.toLowerCase()
    }

    const newFilters: Partial<AdFilters> = {
      language: selectedLanguage === 'todos' ? '' : mapLanguageToCode(selectedLanguage),
      mediaType: selectedMediaType === 'todos' ? '' : mapMediaType(selectedMediaType),
      platform: selectedPlatform === 'todos' ? '' : selectedPlatform.toLowerCase(),
      minUses: adCountRange
    }

    updateFilters(newFilters)
    setShowFilterPopup(false)
  }

  const mapLanguageToCode = (language: string) => {
    const mapping: { [key: string]: string } = {
      'português': 'pt',
      'inglês': 'en', 
      'espanhol': 'es'
    }
    return mapping[language.toLowerCase()] || language
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedLanguage !== 'todos') count++
    if (selectedMediaType !== 'todos') count++
    if (selectedPlatform !== 'todos') count++
    if (adCountRange > 0) count++
    return count
  }

  return (
    <>
      {/* Barra de filtros principais */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {mainFilters.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id
          
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`
                group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300
                ${isActive 
                  ? `${filter.color} border-current shadow-lg scale-105` 
                  : 'bg-gray-800/50 text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:text-white hover:border-gray-500/50'
                }
              `}
            >
              <Icon size={16} className="transition-transform group-hover:scale-110" />
              <span className="font-medium">{filter.label}</span>
              <span className="text-xs opacity-75 bg-black/20 px-2 py-0.5 rounded-full">
                {(filter.count || 0).toLocaleString()}
              </span>
            </button>
          )
        })}

        {/* Separador visual */}
        <div className="w-px h-8 bg-gray-600/50"></div>

        {/* Botão filtros avançados */}
        <button
          onClick={() => setShowFilterPopup(true)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30 hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-400/50 hover:shadow-lg hover:scale-105"
        >
          <SlidersHorizontal size={16} className="transition-transform group-hover:scale-110" />
          <span>Filtros Avançados</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Popup de filtros avançados */}
      {showFilterPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop com blur */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowFilterPopup(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
            {/* Header do modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Filtros Avançados</h2>
                  <p className="text-sm text-gray-400">Configure os filtros para refinar sua busca</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilterPopup(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Seção de filtros categóricos */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    Filtros de Categoria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {advancedFilters.map((filter) => {
                      const Icon = filter.icon
                      const currentValue = 
                        filter.id === 'language' ? selectedLanguage :
                        filter.id === 'mediaType' ? selectedMediaType :
                        filter.id === 'platform' ? selectedPlatform : 'todos'
                      
                      return (
                        <div key={filter.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-blue-400" />
                            <label className="text-sm font-medium text-white">{filter.label}</label>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{filter.description}</p>
                          <select 
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            value={currentValue}
                            onChange={(e) => {
                              if (filter.id === 'language') setSelectedLanguage(e.target.value)
                              else if (filter.id === 'mediaType') setSelectedMediaType(e.target.value)
                              else if (filter.id === 'platform') setSelectedPlatform(e.target.value)
                            }}
                          >
                            {filter.options.map((option) => (
                              <option key={option} value={option.toLowerCase()}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Separador */}
                <div className="border-t border-gray-700/50"></div>

                {/* Seção de contagem de anúncios */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Popularidade dos Anúncios
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-white">
                          Contagem Mínima de Anúncios
                        </label>
                        <p className="text-xs text-gray-400">
                          Filtrar anúncios com pelo menos {adCountRange}+ usos
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-400">{adCountRange}+</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="250"
                        step="25"
                        value={adCountRange}
                        onChange={(e) => setAdCountRange(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 slider-modern"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        {[0, 50, 100, 150, 200, 250].map(val => (
                          <span key={val} className="text-center">
                            {val}+
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do modal */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <button 
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFilterPopup(false)}
                  className="px-6 py-2.5 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500/50 rounded-xl transition-all duration-200"
                >
                  Cancelar
                </button>
                <button 
                  onClick={applyFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </>
  )
} 
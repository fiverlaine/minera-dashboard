import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../config/supabase'

type Ad = Database['public']['Tables']['ads']['Row']
type AdInsert = Database['public']['Tables']['ads']['Insert']

interface UseAdsReturn {
  ads: Ad[]
  loading: boolean
  error: string | null
  addAd: (ad: AdInsert) => Promise<void>
  updateAd: (id: number, updates: Partial<Ad>) => Promise<void>
  deleteAd: (id: number) => Promise<void>
  refreshAds: () => Promise<void>
  totalAds: number
  filteredAds: Ad[]
  updateFilters: (filters: Partial<AdFilters>) => void
  filters: AdFilters
  // Paginação
  currentPage: number
  totalPages: number
  itemsPerPage: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  // Estatísticas
  hotAds: number
  recentAds: number
  weeklyBestAds: number
  activeFilter: string | null
  setActiveFilter: (filter: string | null) => void
  handleSearch: (searchQuery: string) => void
  clearSearch: () => void
}

export interface AdFilters {
  search: string
  category: string
  minUses: number
  sortBy: 'created_at' | 'uses_count' | 'title'
  sortOrder: 'asc' | 'desc'
  language: string
  mediaType: string
  platform: string
}

const ITEMS_PER_PAGE = 28

export function useAds(): UseAdsReturn {
  const { user } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalAds, setTotalAds] = useState(0)
  const [hotAds, setHotAds] = useState(0)
  const [recentAds, setRecentAds] = useState(0)
  const [weeklyBestAds, setWeeklyBestAds] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filters, _setFilters] = useState<AdFilters>({
    search: '',
    category: '',
    minUses: 0,
    sortBy: 'created_at',
    sortOrder: 'desc',
    language: '',
    mediaType: '',
    platform: ''
  })

  // Calcular total de páginas
  const totalPages = Math.ceil(totalAds / ITEMS_PER_PAGE)

  const fetchTotalAdsCount = useCallback(async (filterType: string | null = null, currentFilters: AdFilters) => {
    if (!user?.id) return

    try {
      let baseQuery = supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })

      // Filtros principais
      if (filterType === 'trending') {
        baseQuery = baseQuery.gte('uses_count', 50)
      } else if (filterType === 'weekly') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        baseQuery = baseQuery.gte('created_at', sevenDaysAgo.toISOString())
      } else if (filterType === 'recent') {
        const fiveDaysAgo = new Date()
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
        baseQuery = baseQuery.gte('created_at', fiveDaysAgo.toISOString())
      } else if (filterType === 'favorites') {
        // Apenas para favoritos, filtrar por usuário
        baseQuery = baseQuery.eq('user_id', user.id).eq('is_favorite', true)
      }

      // Filtros avançados
      if (currentFilters.language) {
        baseQuery = baseQuery.eq('language', currentFilters.language)
      }
      if (currentFilters.mediaType) {
        baseQuery = baseQuery.filter('media_type', 'eq', currentFilters.mediaType)
      }
      if (currentFilters.platform) {
        baseQuery = baseQuery.filter('platform', 'eq', currentFilters.platform)
      }
      if (currentFilters.minUses > 0) {
        baseQuery = baseQuery.gte('uses_count', currentFilters.minUses)
      }

      const { count, error } = await baseQuery
      if (error) throw error

      setTotalAds(count || 0)
    } catch (error) {
      console.error('Erro ao buscar contagem de anúncios:', error)
      setTotalAds(0)
    }
  }, [user?.id])

  const fetchHotAdsCount = useCallback(async () => {
    if (!user?.id) return

    const { count, error } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .gte('uses_count', 50)

    if (error) {
      console.error('Erro ao buscar contagem de anúncios quentes:', error)
    } else {
      setHotAds(count || 0)
    }
  }, [user?.id])

  const fetchRecentAdsCount = useCallback(async () => {
    if (!user?.id) return

    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const { count, error } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', fiveDaysAgo.toISOString())

    if (error) {
      console.error('Erro ao buscar contagem de anúncios recentes:', error)
    } else {
      setRecentAds(count || 0)
    }
  }, [user?.id])

  const fetchWeeklyBestAdsCount = useCallback(async () => {
    if (!user?.id) return

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count, error } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    if (error) {
      console.error('Erro ao buscar contagem de melhores da semana:', error)
    } else {
      setWeeklyBestAds(count || 0)
    }
  }, [user?.id])

  const fetchAds = useCallback(async (page: number, filterType: string | null = null, currentFilters: AdFilters) => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    const offset = (page - 1) * ITEMS_PER_PAGE

    try {
      let query = supabase
        .from('ads')
        .select('*')

      // Filtros principais
      if (filterType === 'trending') {
        query = query.gte('uses_count', 50)
      } else if (filterType === 'weekly') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        query = query.gte('created_at', sevenDaysAgo.toISOString())
      } else if (filterType === 'recent') {
        const fiveDaysAgo = new Date()
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
        query = query.gte('created_at', fiveDaysAgo.toISOString())
      } else if (filterType === 'favorites') {
        // Apenas para favoritos, filtrar por usuário
        query = query.eq('user_id', user.id).eq('is_favorite', true)
      }

      // Filtros avançados
      if (currentFilters.language) {
        query = query.eq('language', currentFilters.language)
      }
      if (currentFilters.mediaType) {
        query = query.filter('media_type', 'eq', currentFilters.mediaType)
      }
      if (currentFilters.platform) {
        query = query.filter('platform', 'eq', currentFilters.platform)
      }
      if (currentFilters.minUses > 0) {
        query = query.gte('uses_count', currentFilters.minUses)
      }

      // Ordenação: para trending/weekly priorizar uses_count, depois data; demais somente data
      if (filterType === 'trending' || filterType === 'weekly') {
        query = query.order('uses_count', { ascending: false })
                    .order('created_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      query = query.range(offset, offset + ITEMS_PER_PAGE - 1)

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      setAds(data || [])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const addAd = async (adData: AdInsert) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { data, error } = await supabase
        .from('ads')
        .insert([{ ...adData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      // Atualizar lista se estamos na primeira página
      if (currentPage === 1) {
        setAds(prev => [data, ...prev.slice(0, ITEMS_PER_PAGE - 1)])
      }

      // Atualizar contagens
      await fetchTotalAdsCount(activeFilter, filters)
      await fetchHotAdsCount()
      await fetchRecentAdsCount()
      await fetchWeeklyBestAdsCount()

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar anúncio')
    }
  }

  const updateAd = async (id: number, updates: Partial<Ad>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { data, error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setAds(prev => prev.map(ad => ad.id === id ? data : ad))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar anúncio')
    }
  }

  const deleteAd = async (id: number) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setAds(prev => prev.filter(ad => ad.id !== id))
      
      // Atualizar contagens
      await fetchTotalAdsCount(activeFilter, filters)
      await fetchHotAdsCount()
      await fetchRecentAdsCount()
      await fetchWeeklyBestAdsCount()

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar anúncio')
    }
  }

  const refreshAds = async () => {
    await fetchTotalAdsCount(activeFilter, filters)
    await fetchAds(currentPage, activeFilter, filters)
  }

  // Funções de paginação
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }, [currentPage, totalPages])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  // Effects
  useEffect(() => {
    if (user?.id) {
      fetchAds(currentPage, activeFilter, filters)
      
      // Scroll para o topo quando a página mudar (exceto carregamento inicial)
      if (currentPage > 1 || activeFilter) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [user?.id, currentPage, activeFilter, filters, fetchAds])

  useEffect(() => {
    if (user?.id) {
      fetchTotalAdsCount(activeFilter, filters)
      fetchHotAdsCount()
      fetchRecentAdsCount()
      fetchWeeklyBestAdsCount()
    }
  }, [user?.id, activeFilter, filters, fetchTotalAdsCount, fetchHotAdsCount, fetchRecentAdsCount, fetchWeeklyBestAdsCount])

  // Novo filteredAds apenas para busca textual
  const filteredAds = useMemo(() => {
    if (!filters.search) return ads

    const searchLower = filters.search.toLowerCase()
    return ads.filter(ad =>
      ad.title.toLowerCase().includes(searchLower) ||
      ad.advertiser_name.toLowerCase().includes(searchLower) ||
      (ad.description && ad.description.toLowerCase().includes(searchLower))
    )
  }, [ads, filters.search])

  const handleSetActiveFilter = (filter: string | null) => {
    const newFilter = activeFilter === filter ? null : filter
    
    setAds([])
    setActiveFilter(newFilter)
    setCurrentPage(1) // Voltar para primeira página
    
    // Scroll para o topo ao trocar filtro
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateFilters = (newFilters: Partial<AdFilters>) => {
    _setFilters(prev => ({ ...prev, ...newFilters }))
    // Reiniciar paginação sempre que os filtros mudarem
    setCurrentPage(1)
    // NÃO alteramos mais o activeFilter para permitir combinação de filtros
  }

  const handleSearch = (searchQuery: string) => {
    updateFilters({ search: searchQuery })
  }

  const clearSearch = () => {
    updateFilters({ search: '' })
  }

  return {
    ads,
    loading,
    error,
    addAd,
    updateAd,
    deleteAd,
    refreshAds,
    totalAds,
    filteredAds,
    updateFilters,
    filters,
    // Paginação
    currentPage,
    totalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    goToPage,
    nextPage,
    prevPage,
    // Estatísticas
    hotAds,
    recentAds,
    weeklyBestAds,
    activeFilter,
    setActiveFilter: handleSetActiveFilter,
    handleSearch,
    clearSearch
  }
} 
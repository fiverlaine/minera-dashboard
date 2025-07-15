import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { Auth } from './components/Auth'
import LandingPage from './components/LandingPage'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { AdGrid } from './components/AdGrid'
import FilterBar from './components/FilterBar'
import { useAds } from './hooks/useAds'
import { TokenPage } from './components/TokenPage'
import { supabase } from './config/supabase'
import './App.css'

const Dashboard: React.FC = () => {
  const [activePage, setActivePage] = useState('ads')
  const { session } = useAuth()
  const { 
    totalAds, 
    hotAds, 
    recentAds, 
    weeklyBestAds, 
    activeFilter, 
    setActiveFilter,
    filteredAds,
    loading,
    error,
    handleSearch,
    clearSearch,
    filters,
    // Paginação
    currentPage,
    totalPages,
    itemsPerPage,
    goToPage,
    updateFilters,
    refreshAds
  } = useAds()

  const handleRemoveFavorite = async (adId: number) => {
    try {
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase.functions.invoke('toggle-favorite-test', {
        body: { ad_id: adId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw error
      }

      // Atualizar a lista local removendo o anúncio
      await refreshAds()
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      alert('Erro ao remover favorito. Tente novamente.')
    }
  }

  // Sincronizar page -> filter para favoritos
  useEffect(() => {
    if (activePage === 'favorites') {
      // Aplicar filtro de favoritos ao trocar para a página
      if (activeFilter !== 'favorites') {
        setActiveFilter('favorites')
      }
    } else {
      // Remover filtro quando sair da página de favoritos
      if (activeFilter === 'favorites') {
        setActiveFilter(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage])

  const renderContent = () => {
    switch (activePage) {
      case 'token':
        return <TokenPage />
      case 'favorites':
        return (
          <div className="space-y-6">
            <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Anúncios Favoritos</h2>
                  <p className="text-text-muted">Seus anúncios salvos para referência</p>
                </div>
              </div>
            </div>
            <AdGrid 
              ads={filteredAds.filter(ad => ad.is_favorite)}
              loading={loading}
              error={error}
              totalAds={filteredAds.filter(ad => ad.is_favorite).length}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredAds.filter(ad => ad.is_favorite).length / itemsPerPage)}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
              emptyMessage="Nenhum anúncio favoritado ainda. Use o botão 'Salvar' nos cards para adicionar favoritos!"
              showRemoveFavorite={true}
              onRemoveFavorite={handleRemoveFavorite}
            />
          </div>
        )
      case 'ads':
      default:
        return (
          <div className="space-y-6">
            <FilterBar 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              hotAdsCount={hotAds}
              recentAdsCount={recentAds}
              weeklyBestAdsCount={weeklyBestAds}
              updateFilters={updateFilters}
            />
            <AdGrid 
              ads={filteredAds}
              loading={loading}
              error={error}
              totalAds={totalAds}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
            />
          </div>
        )
    }
  }

  const getPageTitle = () => {
    switch (activePage) {
      case 'token':
        return 'Token de Acesso'
      case 'favorites':
        return 'Anúncios Favoritos'
      case 'ads':
      default:
        return 'Minera Offers'
    }
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Sidebar */}
      <Sidebar 
        currentPage={activePage}
        onPageChange={setActivePage}
      />
      
      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header - não exibir na página do token */}
        {activePage !== 'token' && (
          <Header 
            pageTitle={getPageTitle()}
            showSearch={activePage === 'ads'}
            showStats={activePage !== 'token'}
            showDescription={activePage !== 'token'}
            totalAds={totalAds}
            hotAds={hotAds}
            recentAds={recentAds}
            onSearch={handleSearch}
            onClearSearch={clearSearch}
            searchQuery={filters.search}
          />
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-text-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente para redirecionar usuários logados
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-text-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Landing Page - acessível para todos */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Página de login - apenas para usuários não logados */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      
      {/* Dashboard - apenas para usuários logados */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirecionamento de rotas não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App

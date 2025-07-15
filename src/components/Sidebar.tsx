import React from 'react'
import { 
  Search, 
  Zap, 
  Key, 
  Heart, 
  Settings, 
  HelpCircle, 
  LogOut,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo';

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, signOut } = useAuth()

  const navigationItems = [
    {
      id: 'ads',
      label: 'Anúncios',
      icon: Search,
      count: null,
      active: currentPage === 'ads'
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart,
      count: null,
      active: currentPage === 'favorites'
    },
    {
      id: 'token',
      label: 'Tokens',
      icon: Key,
      count: null,
      active: currentPage === 'token'
    },
    {
      id: 'extension',
      label: 'Extensão',
      icon: Zap,
      count: null,
      active: currentPage === 'extension',
      badge: 'Beta'
    }
  ]

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="fixed top-0 left-0 w-64 h-screen border-r border-dark-border flex flex-col z-40 overflow-y-auto">
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-dark-border flex-shrink-0">
        <Logo className="w-40 h-auto" />
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Mineração
          </h2>
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => !(item as any).disabled && onPageChange(item.id)}
                disabled={(item as any).disabled || false}
                className={`
                  sidebar-nav-item w-full group relative
                  ${item.active ? 'active' : ''}
                  ${'disabled' in item && item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
                
                {/* Badge */}
                {item.badge && (
                  <span className="badge badge-purple ml-auto">
                    {item.badge}
                  </span>
                )}
                
                {/* Count */}
                {item.count && (
                  <span className="ml-auto bg-dark-hover text-text-secondary text-xs px-2 py-1 rounded-full font-semibold">
                    {item.count}
                  </span>
                )}
                
                {/* Indicador ativo */}
                {item.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-primary rounded-r-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Seção de Configurações */}
        <div className="mt-auto">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Sistema
          </h2>
          <button
            className="sidebar-nav-item w-full group"
            onClick={() => onPageChange('settings')}
          >
            <Settings className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span className="font-medium">Configurações</span>
          </button>
          
          <button
            className="sidebar-nav-item w-full group"
            onClick={() => onPageChange('help')}
          >
            <HelpCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">Ajuda</span>
          </button>
        </div>
      </nav>

      {/* Footer da Sidebar - Perfil do Usuário */}
      <div className="p-4 border-t border-dark-border flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-tertiary border border-dark-border">
          <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-text-muted hover:text-accent-red hover:bg-red-500/10 rounded-md transition-all duration-200 group"
            title="Sair"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </div>

        {/* Status da Conexão */}
        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
          <span>Conectado</span>
        </div>
      </div>
    </div>
  )
} 
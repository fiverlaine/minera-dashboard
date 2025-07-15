# Sistema de Paginação v3.11

## 📋 Requisito

O usuário solicitou implementação de **paginação com 28 anúncios por página**, substituindo o sistema de scroll infinito anterior.

**Referência**: Interface similar à mostrada na imagem com numeração de páginas (1, 2, 3, 4, 5... 1532).

## 🎯 Solução Implementada

### 1. Modificação do Hook useAds

**Arquivo**: `src/hooks/useAds.ts`

#### ✅ Substituição de Scroll Infinito por Paginação
```typescript
// ❌ REMOVIDO - Sistema antigo
const [page, setPage] = useState(0)
const [hasMore, setHasMore] = useState(true)
const loadMore = () => {...}

// ✅ ADICIONADO - Sistema de paginação
const [currentPage, setCurrentPage] = useState(1)
const totalPages = Math.ceil(totalAds / ITEMS_PER_PAGE)

// Funções de navegação
const goToPage = (page: number) => {...}
const nextPage = () => {...}
const prevPage = () => {...}
```

#### ✅ Interface Atualizada
```typescript
interface UseAdsReturn {
  // ... props existentes
  // Paginação
  currentPage: number
  totalPages: number
  itemsPerPage: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
}
```

#### ✅ Lógica de Busca Otimizada
```typescript
const fetchAds = useCallback(async (page: number, filterType: string | null = null) => {
  const offset = (page - 1) * ITEMS_PER_PAGE
  
  // Para filtros especiais (trending, weekly)
  if (filterType === 'trending' || filterType === 'weekly') {
    query = supabase.rpc('get_ordered_ads', {
      p_user_id: user.id,
      p_filter_type: filterType,
      p_limit: ITEMS_PER_PAGE,
      p_offset: offset
    })
  } else {
    // Para anúncios normais
    query = baseQuery.range(offset, offset + ITEMS_PER_PAGE - 1)
  }
  
  setAds(data || []) // Substituir ao invés de concatenar
}, [user?.id])
```

#### ✅ Contagem Dinâmica por Filtro
```typescript
const fetchTotalAdsCount = useCallback(async (filterType: string | null = null) => {
  let count = 0

  if (filterType === 'trending' || filterType === 'weekly') {
    // Usar RPC para filtros especiais
    const { data, error } = await supabase
      .rpc('get_weekly_ads_count', { p_user_id: user.id })
    count = data || 0
  } else if (filterType === 'recent') {
    // Filtrar últimos 5 dias
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
    
    const { count: recentCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', fiveDaysAgo.toISOString())
    
    count = recentCount || 0
  } else {
    // Todos os anúncios
    const { count: allCount } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    count = allCount || 0
  }

  setTotalAds(count)
}, [user?.id])
```

### 2. Componente de Paginação

**Arquivo**: `src/components/Pagination.tsx`

#### ✅ Interface Moderna
```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
```

#### ✅ Algoritmo de Páginas Visíveis
```typescript
const getVisiblePages = () => {
  const delta = 2 // Páginas de cada lado da atual
  const range = []
  const rangeWithDots = []

  // Sempre mostrar primeira página
  range.push(1)

  // Páginas ao redor da atual
  for (let i = Math.max(2, currentPage - delta); 
       i <= Math.min(totalPages - 1, currentPage + delta); 
       i++) {
    range.push(i)
  }

  // Sempre mostrar última página
  if (totalPages > 1) {
    range.push(totalPages)
  }

  // Adicionar "..." quando necessário
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
```

#### ✅ Scroll Automático Implementado
```typescript
// No componente Pagination
const handlePageChange = (page: number) => {
  onPageChange(page)
  // Scroll suave para o topo ao trocar de página
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// No hook useAds - Effect para mudança de página
useEffect(() => {
  if (user?.id) {
    fetchAds(currentPage, activeFilter)
    
    // Scroll para o topo quando a página mudar (exceto carregamento inicial)
    if (currentPage > 1 || activeFilter) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}, [user?.id, currentPage, activeFilter, fetchAds])

// Em funções de filtro e pesquisa
const handleSetActiveFilter = (filter: string | null) => {
  // ... lógica do filtro ...
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSearch = (searchQuery: string) => {
  // ... lógica da pesquisa ...
  if (searchQuery.trim()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
```

#### ✅ Design Responsivo
```tsx
return (
  <div className="flex items-center justify-center space-x-2 py-8">
    {/* Botão Anterior */}
    <button
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-secondary border border-dark-border hover:bg-dark-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <ChevronLeft className="w-4 h-4 text-text-muted" />
    </button>

    {/* Números das páginas */}
    {visiblePages.map((page, index) => {
      if (page === '...') {
        return <span key={`dots-${index}`}>...</span>
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
    >
      <ChevronRight className="w-4 h-4 text-text-muted" />
    </button>
  </div>
)
```

### 3. Atualização do AdGrid

**Arquivo**: `src/components/AdGrid.tsx`

#### ✅ Props de Paginação
```typescript
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
}
```

#### ✅ Integração da Paginação
```tsx
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
```

### 4. Atualização do App.tsx

**Arquivo**: `src/App.tsx`

#### ✅ Correção de Conflito de Nomes
```typescript
// ❌ CONFLITO - currentPage usado para duas coisas
const [currentPage, setCurrentPage] = useState('ads') // página da interface
const { currentPage } = useAds() // página da paginação

// ✅ CORRIGIDO - nomes distintos  
const [activePage, setActivePage] = useState('ads') // página da interface
const { currentPage, totalPages, itemsPerPage, goToPage } = useAds() // paginação
```

#### ✅ Props Passadas para AdGrid
```tsx
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
```

## 📊 Funcionalidades

### ✅ Navegação de Páginas
- **Primeira página**: Sempre visível
- **Última página**: Sempre visível  
- **Páginas adjacentes**: 2 de cada lado da atual
- **Ellipsis (...)**: Quando há gap entre páginas
- **Botões prev/next**: Com desabilitação apropriada

### ✅ Informações de Status
```
Exibindo 1 a 28 de 1.532 anúncios minerados
Página 1 de 55 • Última atualização: 14:30:15
```

### ✅ Performance Otimizada
- **LIMIT/OFFSET**: Busca apenas 28 anúncios por vez
- **Contagem dinâmica**: Total atualiza conforme filtros
- **Cache de estado**: Não recarrega desnecessariamente

### ✅ Integração com Filtros
- **Reset para página 1**: Ao trocar filtros ou pesquisar
- **Contagem específica**: Total considera filtro ativo
- **Navegação mantida**: Entre páginas do mesmo filtro

### ✅ Scroll Automático para Topo
- **Troca de página**: Scroll suave ao clicar em qualquer página
- **Mudança de filtro**: Scroll ao ativar/desativar filtros
- **Pesquisa**: Scroll ao pesquisar ou limpar pesquisa
- **Behavior smooth**: Animação suave de scroll
- **Exceção**: Não rola no carregamento inicial da página

## 🔍 Exemplos de Uso

### Navegação Normal
```
[<] [1] [2] [3] [4] [5] ... [55] [>]
     ^atual
```

### Página Intermediária
```
[<] [1] ... [10] [11] [12] [13] [14] ... [55] [>]
                      ^atual
```

### Última Página
```
[<] [1] ... [51] [52] [53] [54] [55] [>]
                                ^atual
```

## 🎨 Design System

### Cores
- **Página ativa**: `bg-accent-blue text-white`
- **Páginas normais**: `bg-dark-secondary text-text-secondary`
- **Hover**: `hover:bg-dark-hover hover:text-text-primary`
- **Desabilitado**: `disabled:opacity-50`

### Tamanhos
- **Botões**: `w-10 h-10` (40x40px)
- **Espaçamento**: `space-x-2` (8px entre botões)
- **Border radius**: `rounded-lg` (8px)

## ✅ Status

**Problema**: Sem paginação, scroll infinito ❌  
**Solução**: Paginação com 28 itens por página ✅  
**Resultado**: Interface igual à imagem de referência ✅

**Arquivos Modificados**:
- ✅ `src/hooks/useAds.ts` - Sistema de paginação
- ✅ `src/components/Pagination.tsx` - Componente novo
- ✅ `src/components/AdGrid.tsx` - Integração da paginação  
- ✅ `src/App.tsx` - Props e correção de conflitos

**Funcionalidades**:
- ✅ 28 anúncios por página
- ✅ Navegação com números de páginas
- ✅ Botões anterior/próximo
- ✅ Ellipsis para muitas páginas
- ✅ Integração com filtros existentes
- ✅ Estatísticas detalhadas no rodapé
- ✅ Scroll automático para topo ao trocar páginas

**Versão**: v3.11  
**Data**: Dezembro 2024  
**Status**: 🟢 Paginação Implementada

## 🎉 Resultado

O sistema agora possui **paginação completa** com 28 anúncios por página, exatamente como solicitado! A navegação é intuitiva, performance otimizada e totalmente integrada com o sistema de filtros existente. 🚀 
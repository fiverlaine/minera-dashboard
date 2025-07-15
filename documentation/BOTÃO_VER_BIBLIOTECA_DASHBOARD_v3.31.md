# 📚 BOTÃO "VER BIBLIOTECA" DASHBOARD v3.31

## 📋 Resumo
Substituído o botão "Visitar Página" por "Ver Biblioteca" no dashboard, que agora abre a biblioteca de anúncios do Facebook para o anunciante específico, seguindo a mesma funcionalidade implementada na extensão.

## 🎯 Motivação
- **Funcionalidade Mais Útil**: Ver biblioteca de anúncios é mais valioso que visitar a página
- **Consistência**: Mesma funcionalidade da extensão agora no dashboard
- **Experiência do Usuário**: Acesso direto aos anúncios do concorrente
- **Pesquisa Competitiva**: Facilita análise de estratégias dos anunciantes

## 🔧 Modificações Realizadas

### 1. **AdCard.tsx - Função**
```typescript
❌ ANTES: visitPage()
const visitPage = () => {
  if (ad.page_url) {
    window.open(ad.page_url, '_blank', 'noopener,noreferrer')
  } else {
    alert('Link da página não disponível para este anúncio')
  }
}

✅ DEPOIS: visitLibrary() com extração de page_id
const visitLibrary = () => {
  // Tentar extrair page_id da URL da página
  if (ad.page_url) {
    try {
      const pageId = extractPageIdFromUrl(ad.page_url)
      
      if (pageId) {
        // Construir URL da biblioteca usando page_id
        const libraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&source=page-transparency-widget&view_all_page_id=${pageId}`
        window.open(libraryUrl, '_blank', 'noopener,noreferrer')
        return
      }
    } catch (error) {
      console.warn('Erro ao extrair page_id da URL:', error)
    }
  }
  
  // Fallback: pesquisar por nome do anunciante
  const advertiserName = ad.advertiser_name || ad.page_name
  
  if (advertiserName) {
    const encodedName = encodeURIComponent(advertiserName)
    const libraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodedName}`
    window.open(libraryUrl, '_blank', 'noopener,noreferrer')
  } else {
    alert('Informações do anunciante não disponíveis para este anúncio')
  }
}

const extractPageIdFromUrl = (url: string): string | null => {
  try {
    // Padrões de URL do Facebook para extrair page_id
    const patterns = [
      /facebook\.com\/people\/[^\/]+\/(\d+)/,
      /facebook\.com\/profile\.php\?id=(\d+)/,
      /facebook\.com\/pages\/[^\/]+\/(\d+)/,
      /facebook\.com\/(\d+)$/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  } catch (error) {
    console.error('Erro ao extrair page_id:', error)
    return null
  }
}
```

### 2. **AdCard.tsx - Botão**
```typescript
❌ ANTES:
<button
  onClick={() => visitPage()}
  className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
>
  <ExternalLink className="w-4 h-4" />
  Visitar Página
</button>

✅ DEPOIS:
<button
  onClick={() => visitLibrary()}
  className="bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
>
  <BookOpen className="w-4 h-4" />
  Ver Biblioteca
</button>
```

### 3. **AdCard.tsx - Import**
```typescript
✅ ADICIONADO:
import { 
  // ... outros imports
  BookOpen // Para biblioteca
} from 'lucide-react'
```

## 🎨 Mudanças Visuais

### Cores
- **Antes**: `bg-blue-600 hover:bg-blue-700` (azul)
- **Depois**: `bg-purple-600 hover:bg-purple-700` (roxo)

### Ícones
- **Antes**: `<ExternalLink />` (link externo)
- **Depois**: `<BookOpen />` (biblioteca)

### Texto
- **Antes**: "Visitar Página"
- **Depois**: "Ver Biblioteca"

## 🔍 Funcionalidade

### URL Construída (Prioridade)
```javascript
// Método 1: Usando page_id extraído da URL da página
const libraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&source=page-transparency-widget&view_all_page_id=${pageId}`

// Método 2: Fallback - Pesquisa por nome
const libraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodedName}`
```

### Parâmetros (Método 1 - Direto)
- `active_status=active` - Apenas anúncios ativos
- `ad_type=all` - Todos os tipos de anúncio
- `country=ALL` - Todos os países
- `search_type=page` - Busca por página específica
- `view_all_page_id=${pageId}` - ID da página extraído da URL

### Parâmetros (Método 2 - Fallback)
- `active_status=all` - Todos os anúncios (ativos e inativos)
- `ad_type=all` - Todos os tipos de anúncio
- `country=BR` - Filtro para Brasil
- `q=${encodedName}` - Nome do anunciante codificado

### Validação e Extração
- **Prioridade**: Extrai page_id da `ad.page_url` usando regex patterns
- **Padrões suportados**:
  - `facebook.com/people/Nome/123456789/`
  - `facebook.com/profile.php?id=123456789`
  - `facebook.com/pages/Nome/123456789`
  - `facebook.com/123456789`
- **Fallback**: Usa `ad.advertiser_name` ou `ad.page_name` para pesquisa
- **Erro**: Mostra alerta se nenhuma informação estiver disponível

## 📊 Impacto

### ✅ Benefícios
- **Pesquisa Competitiva**: Acesso direto aos anúncios do concorrente
- **Análise de Estratégias**: Ver todos os criativos do anunciante
- **Inspiração**: Descobrir novas abordagens criativas
- **Consistência**: Mesma funcionalidade da extensão
- **UX Melhorada**: Funcionalidade mais útil e relevante

### 🎯 Casos de Uso
1. **Análise de Concorrência**: Ver todos os anúncios de um competidor
2. **Pesquisa de Tendências**: Identificar padrões nos criativos
3. **Inspiração Criativa**: Descobrir novas abordagens
4. **Validação de Estratégias**: Comparar com anúncios similares

## 🔧 Detalhes Técnicos

### Arquivo Modificado
- `minera-dashboard/src/components/AdCard.tsx`

### Mudanças de Código
- Função `visitPage()` → `visitLibrary()`
- Import adicionado: `BookOpen`
- Cor do botão: azul → roxo
- Ícone: `ExternalLink` → `BookOpen`
- Texto: "Visitar Página" → "Ver Biblioteca"

### Lógica de Validação
```typescript
const advertiserName = ad.advertiser_name || ad.page_name

if (advertiserName) {
  // Construir URL e abrir
} else {
  // Mostrar alerta de erro
}
```

## 🎨 Interface Atualizada

### Layout do Card
```
┌─────────────────────────────────────┐
│  [Foto]  Nome do Anunciante         │
│          X anúncios                 │
├─────────────────────────────────────┤
│                                     │
│         [Mídia do Anúncio]         │
│                                     │
├─────────────────────────────────────┤
│  Descrição do anúncio...           │
│                                     │
│  [    Baixar Anúncio    ]          │
│                                     │
│  [Ver Biblioteca] [Visitar Site]   │
│     (roxo)           (dinâmico)     │
└─────────────────────────────────────┘
```

### Cores dos Botões
- **Baixar Anúncio**: Cinza escuro
- **Ver Biblioteca**: Roxo (`bg-purple-600`)
- **Visitar Site**: Verde/Azul/Laranja (baseado no tipo)

## 🚀 Próximos Passos
1. ✅ Funcionalidade implementada
2. ✅ Ícone e cor atualizados
3. ✅ Documentação criada
4. 🔄 Teste da funcionalidade
5. 🔄 Validação com usuários
6. 🔄 Monitoramento de uso

## 📝 Notas Técnicas
- Funcionalidade idêntica à implementada na extensão
- Usa `encodeURIComponent()` para caracteres especiais
- Abre em nova aba com `target="_blank"`
- Segurança: `noopener,noreferrer`
- Fallback robusto para nomes de anunciantes

## 🔗 Relação com Extensão
Esta implementação mantém consistência com a funcionalidade "Analisar Biblioteca" da extensão (v3.27), oferecendo a mesma experiência no dashboard.

---
**Versão**: 3.31  
**Data**: Janeiro 2025  
**Status**: ✅ Implementado  
**Impacto**: 🟢 Positivo - Funcionalidade mais útil 
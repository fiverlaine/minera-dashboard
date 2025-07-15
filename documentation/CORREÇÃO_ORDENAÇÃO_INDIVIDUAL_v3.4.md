# Correção: Ordenação Individual de Anúncios v3.4

## Problema Identificado

O usuário reportou que o sistema estava **agrupando anúncios por anunciante** quando o requisito era mostrar **cada anúncio individual como um card separado**, ordenados pelo `uses_count` (quantas vezes aquele anúncio específico foi usado), do maior para o menor.

### Exemplo do Comportamento Desejado
Na biblioteca original de anúncios, cada card mostra:
- Card 1: "9 anúncios usam esse criativo e esse texto" 
- Card 2: "10 anúncios usam esse criativo e esse texto"

Cada anúncio é um card individual, independente do anunciante.

## Análise da Causa Raiz

### Implementação Anterior (Incorreta)
1. **Função PostgreSQL**: Agrupava por `advertiser_name` ou `title`
2. **Frontend**: Mostrava `advertiser_total_ads` para filtro weekly
3. **Contagem**: Contava anunciantes únicos ao invés de total de anúncios
4. **Interface**: Lógica condicional baseada no filtro ativo

### Comportamento Incorreto
- Filtro "Melhores da semana" mostrava 1 card por anunciante
- Cards mostravam total de anúncios do anunciante, não do anúncio individual
- Agrupamento causava perda de visualização dos anúncios individuais

## Implementação da Correção

### 1. Simplificação da Função PostgreSQL

**Antes (v3.3.2):**
```sql
-- Agrupava por advertiser_name e retornava advertiser_total_ads
with ad_groups as (
    select
        a.advertiser_name,
        count(*) as ad_count,
        -- mais lógica de agrupamento
    )
select a.*, ag.ad_count as advertiser_total_ads
```

**Depois (v3.4):**
```sql
-- Simples ordenação por uses_count individual
select
    a.id, a.created_at, a.user_id, a.advertiser_name,
    a.description, a.thumbnail_url, a.video_url,
    a.likes, a.comments, a.shares, a.views,
    a.platform, a.country, a.ad_id, a.uses_count,
    a.category, a.title, a.is_active
from ads a
where
    a.user_id = p_user_id and
    (filtros de trending/weekly) and
    (filtros de anunciantes válidos)
order by
    a.uses_count desc,
    a.created_at desc,
    a.id desc
```

### 2. Nova Função de Contagem
Criada `get_weekly_ads_count()` para contar **total de anúncios** da semana ao invés de anunciantes únicos:

```sql
create or replace function get_weekly_ads_count(p_user_id uuid)
returns bigint as $$
begin
    return (
        select count(*)
        from ads a
        where 
            a.user_id = p_user_id and
            a.created_at >= (now() - interval '7 days') and
            (filtros de anunciantes válidos)
    );
end;
```

### 3. Simplificação do Frontend

**Antes:**
```typescript
type Ad = Database['public']['Tables']['ads']['Row'] & {
  advertiser_total_ads?: number
}

// Lógica condicional baseada em activeFilter
{activeFilter === 'weekly' 
  ? `${ad.advertiser_total_ads || ad.uses_count || 1} ANÚNCIOS` 
  : `${ad.uses_count || 1} ANÚNCIOS`
}
```

**Depois:**
```typescript
type Ad = Database['public']['Tables']['ads']['Row']

// Sempre mostrar uses_count individual
{ad.uses_count || 1} ANÚNCIOS
```

### 4. Arquivos Modificados

#### Backend:
- ✅ `supabase/migrations/20240627230419_create_ordered_ads_function.sql`
  - Dropada e recriada `get_ordered_ads()` sem agrupamento
  - Criada nova função `get_weekly_ads_count()`
  - Removida função `get_weekly_advertisers_count()`

#### Frontend:
- ✅ `src/hooks/useAds.ts`
  - Removido campo `advertiser_total_ads` do tipo `Ad`
  - Atualizada função `fetchWeeklyBestAdsCount()` para usar nova RPC
  
- ✅ `src/components/AdCard.tsx`
  - Removida prop `activeFilter`
  - Removido campo `advertiser_total_ads`
  - Simplificada lógica de exibição para sempre mostrar `uses_count`
  
- ✅ `src/components/AdGrid.tsx`
  - Removida prop `activeFilter`
  - Removido campo `advertiser_total_ads` do tipo `Ad`
  
- ✅ `src/App.tsx`
  - Removida passagem da prop `activeFilter` para `AdGrid`

## Resultados da Correção

### Comportamento Corrigido ✅
1. **Anúncios Individuais**: Cada anúncio é um card separado
2. **Ordenação Correta**: Cards ordenados por `uses_count DESC`
3. **Exibição Consistente**: Sempre mostra uses_count individual
4. **Contagem Precisa**: Filtro "Melhores da semana" conta total de anúncios

### Exemplo do Resultado Esperado
Se existirem 1000 anúncios de 100 anunciantes diferentes:
- ✅ Mostra 1000 cards individuais
- ✅ Ordenados do maior uses_count para o menor
- ✅ Card com 72 uses aparece antes do card com 47 uses
- ✅ Independente do anunciante

### Teste de Validação
Filtro "Melhores da semana" deve mostrar anúncios como:
1. Anúncio X - 72 ANÚNCIOS (uses_count: 72)
2. Anúncio Y - 47 ANÚNCIOS (uses_count: 47)  
3. Anúncio Z - 27 ANÚNCIOS (uses_count: 27)
4. Anúncio W - 6 ANÚNCIOS (uses_count: 6)
5. Anúncio V - 6 ANÚNCIOS (uses_count: 6)

## Compatibilidade

### Migração Segura ✅
- Função dropada e recriada sem afetar dados existentes
- Frontend mantém compatibilidade com estrutura de dados original
- Filtros continuam funcionando corretamente

### Performance ✅
- Query simplificada é mais eficiente (sem JOINs ou agrupamentos)
- Ordenação direta por índices existentes
- Sem lógica condicional complexa no frontend

## Conclusão

A correção v3.4 resolve completamente o mal-entendido sobre agrupamento vs. ordenação individual, implementando exatamente o comportamento solicitado pelo usuário: **anúncios individuais ordenados por uses_count descendente**, conforme mostrado na biblioteca original de anúncios. 
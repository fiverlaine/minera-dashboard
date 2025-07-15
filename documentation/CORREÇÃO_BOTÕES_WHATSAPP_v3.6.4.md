# Correção de Botões WhatsApp - v3.6.4

## Problema Identificado
Após a implementação da detecção avançada de links (v3.6.3), os links do WhatsApp ainda apareciam como "Sem Link" no dashboard em vez do botão verde "WhatsApp".

## Diagnóstico
O problema foi identificado em duas camadas:

### 1. Extensão - Detecção Incorreta
A extensão estava detectando o tipo de link baseado no URL completo do redirecionador do Facebook (`l.facebook.com/l.php?u=...`) ao invés do URL real decodificado.

### 2. Dashboard - Campo Ausente na Consulta
A função PostgreSQL `get_ordered_ads` não incluía o campo `link_type` no retorno, fazendo com que filtros como "trending" e "weekly" não exibissem os tipos de link corretamente.

## Correções Implementadas

### Extensão (content_script.js)
```javascript
// ANTES: Analisava URL do redirecionador
if (adUrl.includes('whatsapp.com')) {
    linkType = 'whatsapp';
}

// DEPOIS: Decodifica URL antes de analisar
let realUrl = adUrl;

// Se for um link de redirecionamento do Facebook, extrair o URL real
if (adUrl.includes('l.facebook.com/l.php')) {
    try {
        const url = new URL(adUrl);
        const decodedUrl = url.searchParams.get('u');
        if (decodedUrl) {
            realUrl = decodeURIComponent(decodedUrl);
        }
    } catch (error) {
        console.warn('Erro ao decodificar URL para detecção de tipo:', error);
    }
}

// Detectar tipo baseado no URL real
if (realUrl.includes('api.whatsapp.com')) {
    linkType = 'whatsapp_api';
} else if (realUrl.includes('whatsapp.com') || realUrl.includes('wa.me')) {
    linkType = 'whatsapp';
}
```

### Banco de Dados
1. **Função PostgreSQL Corrigida**: Adicionado campo `link_type` no retorno da função `get_ordered_ads`
2. **Dados Atualizados**: Corrigidos registros existentes com links do WhatsApp que tinham `link_type = null`

#### Migração: `recreate_get_ordered_ads_with_link_type`
```sql
-- Função corrigida incluindo link_type no retorno
CREATE OR REPLACE FUNCTION public.get_ordered_ads(...)
 RETURNS TABLE(..., link_type text, ...)
```

#### Atualização de Dados Existentes
```sql
UPDATE ads 
SET link_type = CASE 
    WHEN ad_url LIKE '%api.whatsapp.com%' THEN 'whatsapp_api'
    WHEN ad_url LIKE '%whatsapp.com%' OR ad_url LIKE '%wa.me%' THEN 'whatsapp'
    WHEN ad_url LIKE '%instagram.com%' THEN 'instagram'
    WHEN ad_url LIKE '%telegram.me%' OR ad_url LIKE '%t.me%' THEN 'telegram'
    WHEN ad_url LIKE '%shopify.com%' OR ad_url LIKE '%shopee.com%' OR ad_url LIKE '%mercadolivre.com%' THEN 'ecommerce'
    WHEN ad_url IS NOT NULL THEN 'website'
    ELSE 'unknown'
END
WHERE link_type IS NULL AND ad_url IS NOT NULL;
```

## Resultados da Correção

### Dados Atualizados no Banco
- **23 links** classificados como `whatsapp_api` 
- **2 links** classificados como `whatsapp`
- **10 links** do Instagram
- **27 links** de outros websites

### Interface do Dashboard
- ✅ Links do WhatsApp agora aparecem como botão verde "WhatsApp" 
- ✅ Ícone MessageCircle adequado
- ✅ Funciona em todos os filtros (recent, trending, weekly)
- ✅ Extensão detecta corretamente novos links do WhatsApp

## Componente AdCard
O componente já tratava corretamente ambos os tipos:
```javascript
case 'whatsapp':
case 'whatsapp_api':
  return {
    icon: MessageCircle,
    text: 'WhatsApp',
    color: 'bg-green-600 hover:bg-green-700'
  }
```

## Arquivos Modificados
1. `minera-extension/content_script.js` - Decodificação de URLs para detecção
2. **Banco Supabase** - Função `get_ordered_ads` e dados existentes atualizados

## Status
- ✅ **RESOLVIDO**: Links do WhatsApp aparecem corretamente como botão verde
- ✅ **TESTADO**: Função e dados funcionando perfeitamente
- ✅ **COMPATÍVEL**: Funciona com todos os filtros do dashboard

---
*Correção implementada em 28/06/2025* 
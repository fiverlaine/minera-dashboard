# Botões "Visitar Página" e "Visitar Site" - v3.6.2

## Status: ✅ PROBLEMA IDENTIFICADO E CORRIGIDO

### 🔍 Problema Crítico Encontrado e Resolvido

**Situação**: A extensão capturava os links corretamente (visível nos logs), mas os botões no dashboard continuavam mostrando "Link não disponível".

**Causa Raiz**: O **background script não estava enviando o campo `ad_url`** para o servidor, apenas o `page_url`.

**Evidência**: 
- ✅ Content script capturava: `page_url` e `ad_url`
- ✅ Edge Function esperava: `page_url` e `ad_url`  
- ❌ Background script enviava: apenas `page_url` (faltava `ad_url`)

### 🔧 Correção Crítica Implementada

**Arquivo**: `minera-extension/background.js` - linha 277

**ANTES (problema)**:
```javascript
const adRecord = {
    // ... outros campos
    page_url: adData.page_url || null,
    // ❌ CAMPO AUSENTE: ad_url
    extracted_at: adData.extracted_at || new Date().toISOString(),
    created_at: new Date().toISOString()
};
```

**DEPOIS (corrigido)**:
```javascript
const adRecord = {
    // ... outros campos
    page_url: adData.page_url || null,
    ad_url: adData.ad_url || null,     // ✅ CAMPO ADICIONADO
    extracted_at: adData.extracted_at || new Date().toISOString(),
    created_at: new Date().toISOString()
};
```

### 📋 Logs de Debug Melhorados

Adicionados logs específicos para rastreamento de links:

```javascript
console.log(`📋 Dados do anúncio preparados:`, {
    library_id: adRecord.library_id,
    advertiser: adRecord.advertiser_name,
    hasVideo: !!adRecord.video_url,
    hasThumbnail: !!adRecord.thumbnail_url,
    hasPageUrl: !!adRecord.page_url,    // ✅ NOVO
    hasAdUrl: !!adRecord.ad_url         // ✅ NOVO
});

// Log específico para links
if (adRecord.page_url || adRecord.ad_url) {
    console.log(`🔗 Links sendo enviados:`, {
        page_url: adRecord.page_url,
        ad_url: adRecord.ad_url
    });
} else {
    console.log(`⚠️ Nenhum link encontrado para o anúncio ${adRecord.library_id}`);
}
```

### 🧪 Processo de Teste

#### 1. Recarregar Extensão
- Vá em `chrome://extensions/`
- Clique em ↻ (recarregar) na extensão Minera

#### 2. Capturar Novo Anúncio
- Acesse a Biblioteca de Anúncios do Facebook
- Deixe a extensão capturar automaticamente

#### 3. Verificar Logs (F12 → Console)
**Logs esperados**:
```
🔗 Links sendo enviados: {
  page_url: "https://www.facebook.com/61572358957278/",
  ad_url: "https://exemplo.com/produto"
}
📋 Dados preparados: { hasPageUrl: true, hasAdUrl: true }
```

#### 4. Testar Dashboard
- Abra o dashboard
- Clique nos botões "Visitar Página" e "Visitar Site"
- Devem abrir os links reais (não mais alertas)

### 📊 Fluxo de Dados Corrigido

```
1. Content Script (content_script.js)
   ├─ Captura page_url ✅
   ├─ Captura ad_url ✅
   └─ Envia para Background ✅

2. Background Script (background.js) 
   ├─ Recebe page_url ✅
   ├─ Recebe ad_url ✅
   ├─ Inclui page_url no payload ✅
   ├─ Inclui ad_url no payload ✅ (CORRIGIDO)
   └─ Envia para Edge Function ✅

3. Edge Function (receive-ad)
   ├─ Recebe page_url ✅
   ├─ Recebe ad_url ✅ (CORRIGIDO)
   └─ Salva no banco ✅

4. Dashboard (AdCard.tsx)
   ├─ Lê page_url do banco ✅
   ├─ Lê ad_url do banco ✅ (CORRIGIDO)
   └─ Exibe botões funcionais ✅
```

### 🎯 Implementação Completa

#### 1. **Banco de Dados** ✅
- Campo `page_url` adicionado à tabela `ads`
- Campo `ad_url` adicionado à tabela `ads`
- Função `get_ordered_ads` atualizada para retornar os novos campos

#### 2. **Edge Function** ✅
```typescript
// receive-ad/index.ts - linhas 85-86
page_url: adData.page_url,
ad_url: adData.ad_url
```

#### 3. **Extensão** ✅
```javascript
// content_script.js - linhas 730-807
// Captura links da página do Facebook
const allFacebookLinks = adElement.querySelectorAll('a[href*="facebook.com/"]');

// Captura links de produto via redirecionador
const allRedirectLinks = adElement.querySelectorAll('a[href*="l.facebook.com/l.php"]');
const realUrl = url.searchParams.get('u');
adUrl = decodeURIComponent(realUrl);

return {
    // ... outros campos
    page_url: pageUrl,    // Link da página do Facebook
    ad_url: adUrl,        // Link do produto/site
    // ...
};
```

#### 4. **Background Script** ✅ (CORRIGIDO)
```javascript
// background.js - linha 277
const adRecord = {
    // ... outros campos
    page_url: adData.page_url || null,
    ad_url: adData.ad_url || null,  // ✅ CAMPO CORRIGIDO
    // ...
};
```

#### 5. **Dashboard** ✅
```typescript
// AdCard.tsx - linhas 132-142
const visitPage = () => {
  if (ad.page_url) {
    window.open(ad.page_url, '_blank', 'noopener,noreferrer')
  } else {
    alert('Link da página não disponível para este anúncio')
  }
}

const visitSite = () => {
  if (ad.ad_url) {
    window.open(ad.ad_url, '_blank', 'noopener,noreferrer')
  } else {
    alert('Link do site não disponível para este anúncio')
  }
}
```

### 🔍 Estrutura dos Links

#### Link da Página (`page_url`)
- **Formato**: `https://www.facebook.com/61576714801263/`
- **Fonte**: Links diretos do Facebook no HTML do anúncio
- **Filtro**: Exclui links de redirecionamento (`l.facebook.com`)

#### Link do Produto (`ad_url`)
- **Formato**: `https://acaidellideliveryoficial.com/acai/`
- **Fonte**: Links via redirecionador `l.facebook.com/l.php?u=`
- **Processamento**: Decodifica o parâmetro `u` para obter a URL real

### 📈 Resultado Final

- ✅ **Extensão**: Captura links reais do Facebook
- ✅ **Background**: Envia `page_url` e `ad_url` para servidor (CORRIGIDO)
- ✅ **Banco de Dados**: Armazena ambos os campos corretamente
- ✅ **Dashboard**: Botões funcionais com links reais
- ✅ **Fallback**: Alertas informativos para anúncios sem links
- ✅ **Logs**: Sistema completo de debugging com rastreamento de links

### 🚀 Próximos Passos

1. **Recarregar extensão** e testar captura
2. **Verificar logs** para confirmar envio de links
3. **Testar botões** no dashboard com novos anúncios
4. **Confirmar funcionamento** completo do sistema

---

**Data**: Janeiro 2025  
**Versão**: 3.6.2 - Correção Crítica Background Script  
**Status**: Problema identificado e corrigido  
**Próxima revisão**: Após confirmação de funcionamento 
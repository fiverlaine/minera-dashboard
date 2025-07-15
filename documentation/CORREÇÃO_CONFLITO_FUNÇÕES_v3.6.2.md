# Correção de Conflito de Funções - v3.6.2

## 🚨 Problema Identificado

**Situação:** Após a correção dos links (v3.6.1), nenhum anúncio estava sendo enviado para o banco de dados. Os logs da extensão mostravam erros HTTP 300 com mensagem de conflito de funções.

## 🔍 Diagnóstico do Erro

### Erro HTTP 300 nos Logs:
```
❌ Falha ao enviar anúncio 73643448977839: HTTP 300:
{
  "code": "PGST203",
  "details": null,
  "hint": "Try renaming the parameters of the function itself in the database so function overloading can be resolved",
  "message": "Could not choose the best candidate function between: 
    public.insert_ad_with_token(input_token => text, ad_data => json), 
    public.insert_ad_with_token(input_token => text, ad_data => json)"
}
```

### Causa Raiz:
- Existiam **duas versões** da função `insert_ad_with_token` no banco
- Função antiga: `insert_ad_with_token(text, jsonb)` - sem page_url e ad_url
- Função nova: `insert_ad_with_token(text, json)` - com page_url e ad_url
- PostgreSQL não conseguia decidir qual função usar

## 🔧 Investigação Técnica

### 1. Verificação das Funções Duplicadas:
```sql
SELECT 
    p.oid,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as args,
    p.oid::regprocedure as full_signature
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'insert_ad_with_token' 
AND n.nspname = 'public';

-- Resultado:
-- OID 21579: insert_ad_with_token(text,json) - NOVA
-- OID 17649: insert_ad_with_token(text,jsonb) - ANTIGA
```

### 2. Diferenças Entre as Funções:

**Função Antiga (jsonb) - SEM page_url e ad_url:**
```sql
INSERT INTO ads (
    library_id, title, description, advertiser_name, page_name,
    video_url, thumbnail_url, uses_count, start_date, end_date,
    is_active, category, country, language, user_id, created_at, updated_at
    -- ❌ FALTAVAM: page_url, ad_url
) VALUES (...)
```

**Função Nova (json) - COM page_url e ad_url:**
```sql
INSERT INTO ads (
    library_id, title, description, advertiser_name, page_name,
    video_url, thumbnail_url, uses_count, start_date, end_date,
    is_active, category, country, language,
    page_url, ad_url,  -- ✅ INCLUÍDOS
    user_id, created_at, updated_at
) VALUES (...)
```

## ✅ Solução Implementada

### 1. Migração: `remove_old_jsonb_function`
```sql
-- Remover especificamente a função antiga que aceita jsonb
DROP FUNCTION IF EXISTS insert_ad_with_token(text, jsonb);
```

### 2. Verificação da Resolução:
```sql
-- Confirmar que existe apenas uma função
SELECT COUNT(*) FROM information_schema.routines 
WHERE routine_name = 'insert_ad_with_token' 
AND routine_schema = 'public';

-- Resultado: 1 função (apenas a correta)
```

### 3. Teste de Funcionamento:
```sql
-- Testar inserção com links
SELECT insert_ad_with_token(
    (SELECT token FROM user_tokens WHERE is_active = true LIMIT 1),
    '{
        "library_id": "test_function_fix_456",
        "title": "Teste após correção de conflito",
        "page_url": "https://facebook.com/empresa-teste-fix",
        "ad_url": "https://site-empresa-teste-fix.com/produto"
    }'::json
);

-- Resultado: {"success": true, "ad_id": 5386} ✅
```

## 🎯 Resultado Final

### Antes da Correção:
- ❌ HTTP 300 - Conflito de funções
- ❌ Nenhum anúncio sendo salvo
- ❌ Extensão falhando em todos os envios

### Após a Correção:
- ✅ Função única e sem conflitos
- ✅ Anúncios sendo salvos corretamente
- ✅ Links (page_url e ad_url) incluídos
- ✅ Extensão funcionando normalmente

## 📊 Fluxo Corrigido

1. **Extensão captura** anúncio com links
2. **Background script** envia dados via JSON
3. **Função PostgreSQL única** processa corretamente
4. **Banco salva** com todos os campos incluindo URLs
5. **Dashboard exibe** anúncios com botões funcionais

## 🔍 Lições Aprendidas

### Problema de Versionamento:
- Quando se usa `CREATE OR REPLACE FUNCTION`, pode haver conflitos se a assinatura mudar
- PostgreSQL trata `json` e `jsonb` como tipos diferentes
- Sempre verificar funções existentes antes de criar novas

### Estratégia de Correção:
1. Identificar todas as versões da função
2. Remover especificamente as versões antigas
3. Manter apenas a versão correta
4. Testar funcionamento completo

## 🔄 Monitoramento

Para prevenir problemas futuros:
```sql
-- Query para monitorar funções duplicadas
SELECT 
    proname, 
    COUNT(*) as versions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
GROUP BY proname
HAVING COUNT(*) > 1;
```

---

**Data da Correção:** 28 de Junho de 2025  
**Versão:** v3.6.2  
**Tipo:** Correção Crítica - Hotfix  
**Status:** ✅ Resolvido e Testado  
**Dependência:** v3.6.1 (Correção de Links) 
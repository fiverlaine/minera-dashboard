-- Migração v3.8.1 - Processamento automático de campanhas WhatsApp
-- Data: Janeiro 2025  
-- Objetivo: Detectar e criar links WhatsApp para anúncios existentes que são campanhas WhatsApp mas não têm links

-- PROBLEMA:
-- Muitos anúncios são campanhas WhatsApp ("Send WhatsApp Message", "Faça um orçamento", etc.)
-- mas aparecem como "Sem Link" porque não têm ad_url preenchido.

-- SOLUÇÃO:
-- Detectar automaticamente campanhas WhatsApp baseado no texto
-- Criar links wa.me ou api.whatsapp.com automaticamente
-- Classificar como link_type = 'whatsapp'

-- FUNÇÃO TEMPORÁRIA: Detectar campanhas WhatsApp
CREATE OR REPLACE FUNCTION detect_whatsapp_campaign(ad_text text, ad_title text)
RETURNS TABLE (
    is_whatsapp_campaign boolean,
    whatsapp_url text,
    phone_found text
) AS $$
DECLARE
    full_text text;
    phone_pattern text;
    extracted_phone text;
    whatsapp_indicators text[] := ARRAY[
        'send whatsapp message',
        'enviar mensagem whatsapp',
        'whatsapp',
        'chame no zap',
        'fale conosco',
        'entre em contato',
        'faça um orçamento',
        'solicite orçamento',
        'peça já pelo whatsapp',
        'chama no whats',
        'whats',
        'zap',
        'direct message',
        'dm para mais info',
        'solicitar informações',
        'entre em contato conosco',
        'contato via whatsapp'
    ];
    indicator text;
    has_indicator boolean := false;
BEGIN
    -- Combinar título e descrição
    full_text := LOWER(COALESCE(ad_title, '') || ' ' || COALESCE(ad_text, ''));
    
    -- Verificar se contém indicadores WhatsApp
    FOREACH indicator IN ARRAY whatsapp_indicators
    LOOP
        IF full_text LIKE '%' || indicator || '%' THEN
            has_indicator := true;
            EXIT;
        END IF;
    END LOOP;
    
    -- Se não é campanha WhatsApp, retornar falso
    IF NOT has_indicator THEN
        RETURN QUERY SELECT false, null::text, null::text;
        RETURN;
    END IF;
    
    -- Tentar extrair número de telefone (padrões brasileiros)
    -- Padrão: (xx) xxxxx-xxxx ou (xx) xxxx-xxxx ou xxxxxxxxxx
    SELECT substring(full_text FROM '\(?(\d{2})\)?\s*\d{4,5}[-\s]?\d{4}') INTO extracted_phone;
    
    -- Se não encontrou com parênteses, tentar sem
    IF extracted_phone IS NULL THEN
        SELECT substring(full_text FROM '(\d{10,11})') INTO extracted_phone;
    END IF;
    
    -- Criar URL WhatsApp baseado no resultado
    IF extracted_phone IS NOT NULL AND length(extracted_phone) >= 10 THEN
        -- Formatar número para WhatsApp
        extracted_phone := regexp_replace(extracted_phone, '\D', '', 'g'); -- Remove não-dígitos
        
        -- Adicionar código do país se necessário
        IF length(extracted_phone) = 11 AND substring(extracted_phone FROM 1 FOR 2) ~ '^[1-9][1-9]$' THEN
            -- Número brasileiro com DDD
            extracted_phone := '55' || extracted_phone;
        END IF;
        
        RETURN QUERY SELECT true, 'https://wa.me/' || extracted_phone, extracted_phone;
    ELSE
        -- Criar link genérico
        RETURN QUERY SELECT true, 'https://api.whatsapp.com/send'::text, null::text;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- PROCESSAMENTO: Atualizar anúncios existentes sem links que são campanhas WhatsApp
DO $$
DECLARE
    ad_record RECORD;
    whatsapp_data RECORD;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando processamento de campanhas WhatsApp sem links...';
    
    -- Buscar anúncios sem ad_url que podem ser campanhas WhatsApp
    FOR ad_record IN 
        SELECT id, title, description, advertiser_name
        FROM ads 
        WHERE ad_url IS NULL 
          AND (
              LOWER(title || ' ' || COALESCE(description, '')) LIKE '%whatsapp%' OR
              LOWER(title || ' ' || COALESCE(description, '')) LIKE '%zap%' OR
              LOWER(title || ' ' || COALESCE(description, '')) LIKE '%contato%' OR
              LOWER(title || ' ' || COALESCE(description, '')) LIKE '%orçamento%' OR
              LOWER(title || ' ' || COALESCE(description, '')) LIKE '%send whatsapp%' OR
              LOWER(title || ' ' || COALESCE(description, '')) LIKE '%fale conosco%'
          )
        ORDER BY id
    LOOP
        -- Detectar se é campanha WhatsApp
        SELECT * INTO whatsapp_data 
        FROM detect_whatsapp_campaign(ad_record.description, ad_record.title);
        
        -- Se é campanha WhatsApp, atualizar
        IF whatsapp_data.is_whatsapp_campaign THEN
            UPDATE ads 
            SET 
                ad_url = whatsapp_data.whatsapp_url,
                link_type = 'whatsapp',
                updated_at = NOW()
            WHERE id = ad_record.id;
            
            updated_count := updated_count + 1;
            
            RAISE NOTICE 'Anúncio % atualizado: % -> %', 
                ad_record.id, 
                ad_record.advertiser_name, 
                whatsapp_data.whatsapp_url;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Processamento concluído. % anúncios atualizados com links WhatsApp.', updated_count;
END $$;

-- LIMPEZA: Remover função temporária
DROP FUNCTION detect_whatsapp_campaign(text, text);

-- Comentário da migração
COMMENT ON TABLE ads IS 
'v3.8.1 - Processamento automático aplicado para detectar campanhas WhatsApp em anúncios existentes sem links. Anúncios com termos como "Send WhatsApp Message", "Faça um orçamento" agora têm links WhatsApp automáticos.';

-- RELATÓRIO FINAL: Mostrar estatísticas
DO $$
DECLARE
    total_ads INTEGER;
    ads_with_links INTEGER;
    whatsapp_ads INTEGER;
    no_link_ads INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_ads FROM ads;
    SELECT COUNT(*) INTO ads_with_links FROM ads WHERE ad_url IS NOT NULL;
    SELECT COUNT(*) INTO whatsapp_ads FROM ads WHERE link_type = 'whatsapp';
    SELECT COUNT(*) INTO no_link_ads FROM ads WHERE ad_url IS NULL;
    
    RAISE NOTICE '=== RELATÓRIO DE LINKS v3.8.1 ===';
    RAISE NOTICE 'Total de anúncios: %', total_ads;
    RAISE NOTICE 'Anúncios com links: %', ads_with_links;
    RAISE NOTICE 'Anúncios WhatsApp: %', whatsapp_ads;
    RAISE NOTICE 'Anúncios sem link: %', no_link_ads;
    RAISE NOTICE 'Cobertura de links: %%%', ROUND((ads_with_links::numeric / total_ads::numeric) * 100, 1);
END $$; 
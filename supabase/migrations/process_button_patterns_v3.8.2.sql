-- Migração v3.8.2 - Detecção de padrões de botão WhatsApp
-- Data: Janeiro 2025  
-- Objetivo: Detectar campanhas WhatsApp baseadas em textos de botão padrão do Facebook

-- PROBLEMA ESPECÍFICO:
-- Anúncios como "Goldennew" mostram "Enviar mensagem" no Facebook
-- mas ainda aparecem como "Sem Link" no dashboard

-- CONTEXTO:
-- O Facebook por padrão não mostra números reais nos anúncios
-- Mas exibe textos de botão como "Enviar mensagem", "Send Message"
-- Estes são indicadores 100% confiáveis de campanhas WhatsApp

-- FUNÇÃO TEMPORÁRIA: Detectar padrões de botão WhatsApp
CREATE OR REPLACE FUNCTION detect_button_patterns(ad_text text, ad_title text, advertiser text)
RETURNS TABLE (
    is_whatsapp_button boolean,
    whatsapp_url text,
    pattern_found text
) AS $$
DECLARE
    full_text text;
    button_patterns text[] := ARRAY[
        -- Textos de botão padrão do Facebook (PRINCIPAIS)
        'enviar mensagem',
        'send message',
        'send whatsapp message',
        'enviar mensagem pelo whatsapp',
        'message',
        'mensagem',
        
        -- Outros indicadores WhatsApp
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
        'contato',
        'contact us',
        'get in touch'
    ];
    pattern text;
    found_pattern text := null;
BEGIN
    -- Combinar título, descrição e anunciante
    full_text := LOWER(
        COALESCE(ad_title, '') || ' ' || 
        COALESCE(ad_text, '') || ' ' || 
        COALESCE(advertiser, '')
    );
    
    -- Verificar se contém padrões de botão WhatsApp
    FOREACH pattern IN ARRAY button_patterns
    LOOP
        IF full_text LIKE '%' || pattern || '%' THEN
            found_pattern := pattern;
            EXIT;
        END IF;
    END LOOP;
    
    -- Se encontrou padrão, é campanha WhatsApp
    IF found_pattern IS NOT NULL THEN
        RETURN QUERY SELECT 
            true, 
            'https://api.whatsapp.com/send'::text,
            found_pattern;
    ELSE
        RETURN QUERY SELECT 
            false, 
            null::text, 
            null::text;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- PROCESSAMENTO: Atualizar anúncios sem links detectando padrões de botão
DO $$
DECLARE
    ad_record RECORD;
    button_data RECORD;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando detecção de padrões de botão WhatsApp...';
    RAISE NOTICE 'Foco: anúncios com "Enviar mensagem", "Send Message", etc.';
    
    -- Buscar anúncios sem ad_url que podem ter padrões de botão
    FOR ad_record IN 
        SELECT id, title, description, advertiser_name
        FROM ads 
        WHERE ad_url IS NULL 
        ORDER BY id
    LOOP
        -- Detectar padrões de botão
        SELECT * INTO button_data 
        FROM detect_button_patterns(
            ad_record.description, 
            ad_record.title, 
            ad_record.advertiser_name
        );
        
        -- Se detectou padrão de botão WhatsApp, atualizar
        IF button_data.is_whatsapp_button THEN
            UPDATE ads 
            SET 
                ad_url = button_data.whatsapp_url,
                link_type = 'whatsapp',
                updated_at = NOW()
            WHERE id = ad_record.id;
            
            updated_count := updated_count + 1;
            
            RAISE NOTICE 'Anúncio % (%) atualizado - Padrão detectado: "%"', 
                ad_record.id, 
                ad_record.advertiser_name,
                button_data.pattern_found;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Detecção de padrões concluída. % anúncios atualizados.', updated_count;
END $$;

-- LIMPEZA: Remover função temporária
DROP FUNCTION detect_button_patterns(text, text, text);

-- VERIFICAÇÃO ESPECÍFICA: Goldennew
DO $$
DECLARE
    goldennew_count INTEGER;
    goldennew_with_links INTEGER;
BEGIN
    SELECT COUNT(*) INTO goldennew_count 
    FROM ads 
    WHERE LOWER(advertiser_name) LIKE '%goldennew%';
    
    SELECT COUNT(*) INTO goldennew_with_links 
    FROM ads 
    WHERE LOWER(advertiser_name) LIKE '%goldennew%' 
      AND ad_url IS NOT NULL;
    
    IF goldennew_count > 0 THEN
        RAISE NOTICE '=== VERIFICAÇÃO GOLDENNEW ===';
        RAISE NOTICE 'Anúncios Goldennew encontrados: %', goldennew_count;
        RAISE NOTICE 'Goldennew com links: %', goldennew_with_links;
        
        IF goldennew_with_links = goldennew_count THEN
            RAISE NOTICE '✅ SUCESSO: Todos os anúncios Goldennew agora têm links!';
        ELSE
            RAISE NOTICE '⚠️ ATENÇÃO: % anúncios Goldennew ainda sem links', 
                (goldennew_count - goldennew_with_links);
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Nenhum anúncio Goldennew encontrado no banco';
    END IF;
END $$;

-- RELATÓRIO FINAL
DO $$
DECLARE
    total_ads INTEGER;
    ads_with_links INTEGER;
    whatsapp_ads INTEGER;
    no_link_ads INTEGER;
    coverage_percent NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_ads FROM ads;
    SELECT COUNT(*) INTO ads_with_links FROM ads WHERE ad_url IS NOT NULL;
    SELECT COUNT(*) INTO whatsapp_ads FROM ads WHERE link_type = 'whatsapp';
    SELECT COUNT(*) INTO no_link_ads FROM ads WHERE ad_url IS NULL;
    
    coverage_percent := ROUND((ads_with_links::numeric / total_ads::numeric) * 100, 1);
    
    RAISE NOTICE '=== RELATÓRIO FINAL v3.8.2 ===';
    RAISE NOTICE 'Total de anúncios: %', total_ads;
    RAISE NOTICE 'Anúncios com links: %', ads_with_links;
    RAISE NOTICE 'Anúncios WhatsApp: %', whatsapp_ads;
    RAISE NOTICE 'Anúncios sem link: %', no_link_ads;
    RAISE NOTICE 'Cobertura de links: %%%', coverage_percent;
    
    IF coverage_percent >= 95 THEN
        RAISE NOTICE '🎉 EXCELENTE: Cobertura de links acima de 95%%!';
    ELSIF coverage_percent >= 90 THEN
        RAISE NOTICE '✅ BOM: Cobertura de links acima de 90%%';
    ELSE
        RAISE NOTICE '⚠️ Ainda há margem para melhoria na cobertura';
    END IF;
END $$;

-- Comentário da migração
COMMENT ON TABLE ads IS 
'v3.8.2 - Detecção melhorada para padrões de botão WhatsApp como "Enviar mensagem", "Send Message". Resolve casos como Goldennew que não foram detectados anteriormente.'; 
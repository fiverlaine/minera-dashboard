-- Migração v3.7 - Sistema de Detecção de Similaridade de Anúncios
-- Data: 2024-12-19
-- Objetivo: Prevenir anúncios similares/duplicados mesmo com library_ids diferentes

-- 1. Habilitar extensão fuzzystrmatch para cálculos de similaridade
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- 2. Função auxiliar para calcular similaridade de texto
CREATE OR REPLACE FUNCTION calculate_text_similarity(text1 text, text2 text)
RETURNS integer AS $$
DECLARE
    clean_text1 text;
    clean_text2 text;
    max_length integer;
    distance integer;
    similarity_percent integer;
BEGIN
    -- Normalizar textos (lowercase, trim, remover caracteres especiais)
    clean_text1 := lower(trim(regexp_replace(text1, '[^a-zA-Z0-9\s]', '', 'g')));
    clean_text2 := lower(trim(regexp_replace(text2, '[^a-zA-Z0-9\s]', '', 'g')));
    
    -- Se algum texto for muito curto, considerar baixa similaridade
    IF length(clean_text1) < 5 OR length(clean_text2) < 5 THEN
        RETURN 0;
    END IF;
    
    -- Calcular distância Levenshtein
    distance := levenshtein(clean_text1, clean_text2);
    
    -- Calcular similaridade como porcentagem
    max_length := greatest(length(clean_text1), length(clean_text2));
    
    -- Evitar divisão por zero
    IF max_length = 0 THEN
        RETURN 100;
    END IF;
    
    -- Calcular similaridade (0-100%)
    similarity_percent := (100 - (distance * 100 / max_length));
    
    RETURN greatest(0, similarity_percent);
END;
$$ LANGUAGE plpgsql;

-- 3. Função para detectar anúncios similares
CREATE OR REPLACE FUNCTION check_similar_ads(
    p_user_id uuid,
    p_advertiser_name text,
    p_title text,
    p_hours_lookback integer DEFAULT 24
) RETURNS json AS $$
DECLARE
    similar_ad record;
    title_similarity integer;
    advertiser_similarity integer;
BEGIN
    -- Buscar anúncios do mesmo usuário nas últimas X horas
    FOR similar_ad IN
        SELECT id, library_id, advertiser_name, title, created_at
        FROM ads
        WHERE user_id = p_user_id
            AND created_at >= (NOW() - (p_hours_lookback || ' hours')::interval)
            AND advertiser_name IS NOT NULL
            AND title IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 50 -- Limitar busca para performance
    LOOP
        -- Calcular similaridade do anunciante
        advertiser_similarity := calculate_text_similarity(p_advertiser_name, similar_ad.advertiser_name);
        
        -- Se anunciante é muito similar (>85%), verificar título
        IF advertiser_similarity >= 85 THEN
            title_similarity := calculate_text_similarity(p_title, similar_ad.title);
            
            -- Se título também é similar (>80%), considerar duplicata
            IF title_similarity >= 80 THEN
                RETURN json_build_object(
                    'is_similar', true,
                    'similar_ad_id', similar_ad.id,
                    'similar_library_id', similar_ad.library_id,
                    'advertiser_similarity', advertiser_similarity,
                    'title_similarity', title_similarity,
                    'existing_ad_date', similar_ad.created_at
                );
            END IF;
        END IF;
    END LOOP;
    
    -- Nenhum anúncio similar encontrado
    RETURN json_build_object('is_similar', false);
END;
$$ LANGUAGE plpgsql;

-- 4. Atualizar função insert_ad_with_token para incluir verificação de similaridade
CREATE OR REPLACE FUNCTION insert_ad_with_token(
    input_token text,
    ad_data json
) RETURNS json AS $$
DECLARE
    token_row user_tokens%ROWTYPE;
    ad_id bigint;
    similarity_check json;
    advertiser_name text;
    title text;
    link_type text;
    result json;
BEGIN
    -- Validar token ativo
    SELECT * INTO token_row 
    FROM user_tokens 
    WHERE token = input_token AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN '{"success": false, "error": "Token inválido ou expirado"}'::json;
    END IF;
    
    -- Extrair dados para verificação
    advertiser_name := COALESCE(ad_data->>'advertiser_name', 'Anunciante desconhecido');
    title := COALESCE(ad_data->>'title', 'Anúncio sem título');
    
    -- 1. VERIFICAÇÃO DUPLICATA EXATA (library_id)
    IF EXISTS (
        SELECT 1 FROM ads 
        WHERE library_id = COALESCE(ad_data->>'library_id', 'ext_' || extract(epoch from now())::text)
        AND user_id = token_row.user_id
    ) THEN
        RETURN '{"success": false, "error": "Anúncio já existe (duplicata exata)"}'::json;
    END IF;
    
    -- 2. VERIFICAÇÃO SIMILARIDADE (novo sistema)
    -- Só verificar se anunciante não for "desconhecido"
    IF lower(advertiser_name) NOT IN ('anunciante desconhecido', 'unknown advertiser', 'patrocinado', 'sponsored') THEN
        similarity_check := check_similar_ads(token_row.user_id, advertiser_name, title, 24);
        
        IF (similarity_check->>'is_similar')::boolean = true THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Anúncio similar já existe',
                'similarity_info', similarity_check
            );
        END IF;
    END IF;
    
    -- 3. DETERMINAR TIPO DE LINK
    link_type := 'website'; -- padrão
    
    IF ad_data->>'ad_url' IS NOT NULL THEN
        CASE 
            WHEN ad_data->>'ad_url' ILIKE '%api.whatsapp.com%' THEN
                link_type := 'whatsapp_api';
            WHEN ad_data->>'ad_url' ILIKE '%wa.me%' OR ad_data->>'ad_url' ILIKE '%whatsapp.com%' THEN
                link_type := 'whatsapp';
            WHEN ad_data->>'ad_url' ILIKE '%instagram.com%' THEN
                link_type := 'instagram';
            WHEN ad_data->>'ad_url' ILIKE '%t.me%' OR ad_data->>'ad_url' ILIKE '%telegram%' THEN
                link_type := 'telegram';
            WHEN ad_data->>'ad_url' ILIKE '%shopee%' OR ad_data->>'ad_url' ILIKE '%mercadolivre%' 
                 OR ad_data->>'ad_url' ILIKE '%amazon%' OR ad_data->>'ad_url' ILIKE '%aliexpress%' THEN
                link_type := 'ecommerce';
            ELSE
                link_type := 'website';
        END CASE;
    ELSE
        link_type := 'no_link';
    END IF;
    
    -- 4. INSERIR ANÚNCIO
    INSERT INTO ads (
        library_id,
        title,
        description,
        advertiser_name,
        page_name,
        video_url,
        thumbnail_url,
        uses_count,
        start_date,
        end_date,
        is_active,
        category,
        country,
        language,
        page_url,
        ad_url,
        link_type,
        user_id,
        created_at,
        updated_at
    ) VALUES (
        COALESCE(ad_data->>'library_id', 'ext_' || extract(epoch from now())::text),
        title,
        COALESCE(ad_data->>'description', ''),
        advertiser_name,
        ad_data->>'page_name',
        ad_data->>'video_url',
        ad_data->>'thumbnail_url',
        CASE WHEN ad_data->>'uses_count' IS NOT NULL THEN (ad_data->>'uses_count')::integer ELSE NULL END,
        CASE WHEN ad_data->>'start_date' IS NOT NULL THEN (ad_data->>'start_date')::date ELSE NULL END,
        CASE WHEN ad_data->>'end_date' IS NOT NULL THEN (ad_data->>'end_date')::date ELSE NULL END,
        true,
        ad_data->>'category',
        ad_data->>'country',
        ad_data->>'language',
        ad_data->>'page_url',
        ad_data->>'ad_url',
        link_type,
        token_row.user_id,
        COALESCE((ad_data->>'created_at')::timestamptz, NOW()),
        NOW()
    ) RETURNING id INTO ad_id;
    
    -- Construir resposta de sucesso
    result := json_build_object(
        'success', true,
        'ad_id', ad_id,
        'message', 'Anúncio inserido com sucesso'
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Comentários de documentação
COMMENT ON FUNCTION calculate_text_similarity(text, text) IS 
'Calcula similaridade entre dois textos usando distância Levenshtein. Retorna porcentagem (0-100%)';

COMMENT ON FUNCTION check_similar_ads(uuid, text, text, integer) IS 
'Verifica se existem anúncios similares nas últimas X horas baseado em anunciante e título';

COMMENT ON FUNCTION insert_ad_with_token(text, json) IS 
'Insere anúncio com verificação de duplicata exata E similaridade. Versão 3.7 com detecção inteligente'; 
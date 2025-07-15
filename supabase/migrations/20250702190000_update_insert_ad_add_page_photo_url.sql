-- Migração: Adicionar suporte a page_photo_url na função insert_ad_with_token
-- Data: 2025-07-02

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
    
    -- Verificação duplicata exata
    IF EXISTS (
        SELECT 1 FROM ads 
        WHERE library_id = COALESCE(ad_data->>'library_id', 'ext_' || extract(epoch from now())::text)
          AND user_id = token_row.user_id
    ) THEN
        RETURN '{"success": false, "error": "Anúncio já existe (duplicata exata)"}'::json;
    END IF;
    
    -- Determinar tipo de link (simplificado)
    link_type := CASE
        WHEN ad_data->>'ad_url' ILIKE '%api.whatsapp.com%' THEN 'whatsapp_api'
        WHEN ad_data->>'ad_url' ILIKE '%wa.me%' OR ad_data->>'ad_url' ILIKE '%whatsapp.com%' THEN 'whatsapp'
        WHEN ad_data->>'ad_url' ILIKE '%instagram.com%' THEN 'instagram'
        WHEN ad_data->>'ad_url' ILIKE '%t.me%' OR ad_data->>'ad_url' ILIKE '%telegram%' THEN 'telegram'
        WHEN ad_data->>'ad_url' ILIKE '%shopee%' OR ad_data->>'ad_url' ILIKE '%mercadolivre%' OR ad_data->>'ad_url' ILIKE '%amazon%' OR ad_data->>'ad_url' ILIKE '%aliexpress%' THEN 'ecommerce'
        WHEN ad_data->>'ad_url' IS NULL THEN 'no_link'
        ELSE 'website'
    END;
    
    -- Inserir anúncio com novo campo page_photo_url
    INSERT INTO ads (
        library_id,
        title,
        description,
        advertiser_name,
        page_name,
        page_photo_url,
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
        ad_data->>'page_photo_url',
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
    
    -- Resposta
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
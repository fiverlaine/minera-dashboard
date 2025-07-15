-- Migração: Atualizar função insert_ad_with_token para realizar UPSERT em duplicatas
-- Data: 2025-07-04 v3.8.0
-- Objetivo: Quando um anúncio com o mesmo library_id já existir para o mesmo usuário, atualizar seus campos
--           (title, description, advertiser_name, etc.) ao invés de falhar com erro de "duplicata exata".
--           Mantém a detecção de similaridade apenas para inserções novas.

CREATE OR REPLACE FUNCTION insert_ad_with_token(
    input_token text,
    ad_data json
) RETURNS json AS $$
DECLARE
    token_row user_tokens%ROWTYPE;
    ad_id bigint;
    similarity_check json;
    new_advertiser_name text;
    new_title text;
    link_type text;
    result json;
BEGIN
    -- 1. Validar token ativo
    SELECT * INTO token_row 
    FROM user_tokens 
    WHERE token = input_token AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Token inválido ou expirado');
    END IF;

    -- 2. Extrair dados principais para uso posterior
    new_advertiser_name := COALESCE(ad_data->>'advertiser_name', 'Anunciante desconhecido');
    new_title := COALESCE(ad_data->>'title', 'Anúncio sem título');

    -- 3. Identificar registro existente pelo mesmo library_id + user_id
    SELECT id INTO ad_id
    FROM ads
    WHERE library_id = COALESCE(ad_data->>'library_id', 'ext_' || extract(epoch from now())::text)
      AND user_id = token_row.user_id
    LIMIT 1;

    -- 3A. Se já existir, realizar UPDATE com os novos dados
    IF FOUND THEN
        -- Determinar novo link_type coerente com as novas URLs, se houver
        link_type := 'website';
        IF ad_data->>'ad_url' IS NOT NULL THEN
            CASE 
                WHEN ad_data->>'ad_url' ILIKE '%api.whatsapp.com%' THEN link_type := 'whatsapp_api';
                WHEN ad_data->>'ad_url' ILIKE '%wa.me%' OR ad_data->>'ad_url' ILIKE '%whatsapp.com%' THEN link_type := 'whatsapp';
                WHEN ad_data->>'ad_url' ILIKE '%instagram.com%' THEN link_type := 'instagram';
                WHEN ad_data->>'ad_url' ILIKE '%t.me%' OR ad_data->>'ad_url' ILIKE '%telegram%' THEN link_type := 'telegram';
                WHEN ad_data->>'ad_url' ILIKE '%shopee%' OR ad_data->>'ad_url' ILIKE '%mercadolivre%' 
                   OR ad_data->>'ad_url' ILIKE '%amazon%' OR ad_data->>'ad_url' ILIKE '%aliexpress%' THEN link_type := 'ecommerce';
                ELSE link_type := 'website';
            END CASE;
        ELSE
            link_type := 'no_link';
        END IF;

        UPDATE ads SET
            title             = new_title,
            description       = COALESCE(ad_data->>'description', ''),
            advertiser_name   = new_advertiser_name,
            page_name         = ad_data->>'page_name',
            video_url         = ad_data->>'video_url',
            thumbnail_url     = ad_data->>'thumbnail_url',
            uses_count        = CASE WHEN ad_data->>'uses_count' IS NOT NULL THEN (ad_data->>'uses_count')::integer ELSE uses_count END,
            start_date        = CASE WHEN ad_data->>'start_date' IS NOT NULL THEN (ad_data->>'start_date')::date ELSE start_date END,
            end_date          = CASE WHEN ad_data->>'end_date' IS NOT NULL THEN (ad_data->>'end_date')::date ELSE end_date END,
            category          = ad_data->>'category',
            country           = ad_data->>'country',
            language          = ad_data->>'language',
            page_url          = ad_data->>'page_url',
            ad_url            = ad_data->>'ad_url',
            link_type         = link_type,
            updated_at        = NOW()
        WHERE id = ad_id
        RETURNING id INTO ad_id;

        result := json_build_object(
            'success', true,
            'ad_id', ad_id,
            'message', 'Anúncio atualizado com sucesso'
        );
        RETURN result;
    END IF;

    -- 4. Para anúncios novos, executar detecção de duplicata similaridade
    -- VERIFICAÇÃO DE SIMILARIDADE (mantida igual)
    IF lower(new_advertiser_name) NOT IN ('anunciante desconhecido', 'unknown advertiser', 'patrocinado', 'sponsored') THEN
        similarity_check := check_similar_ads(token_row.user_id, new_advertiser_name, new_title, 24);
        IF (similarity_check->>'is_similar')::boolean = true THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Anúncio similar já existe',
                'similarity_info', similarity_check
            );
        END IF;
    END IF;

    -- 5. Determinar link_type para novo anúncio
    link_type := 'website';
    IF ad_data->>'ad_url' IS NOT NULL THEN
        CASE 
            WHEN ad_data->>'ad_url' ILIKE '%api.whatsapp.com%' THEN link_type := 'whatsapp_api';
            WHEN ad_data->>'ad_url' ILIKE '%wa.me%' OR ad_data->>'ad_url' ILIKE '%whatsapp.com%' THEN link_type := 'whatsapp';
            WHEN ad_data->>'ad_url' ILIKE '%instagram.com%' THEN link_type := 'instagram';
            WHEN ad_data->>'ad_url' ILIKE '%t.me%' OR ad_data->>'ad_url' ILIKE '%telegram%' THEN link_type := 'telegram';
            WHEN ad_data->>'ad_url' ILIKE '%shopee%' OR ad_data->>'ad_url' ILIKE '%mercadolivre%' 
                 OR ad_data->>'ad_url' ILIKE '%amazon%' OR ad_data->>'ad_url' ILIKE '%aliexpress%' THEN link_type := 'ecommerce';
            ELSE link_type := 'website';
        END CASE;
    ELSE
        link_type := 'no_link';
    END IF;

    -- 6. Inserir anúncio (caminho original)
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
        new_title,
        COALESCE(ad_data->>'description', ''),
        new_advertiser_name,
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

    -- 7. Resposta de sucesso para inserção
    result := json_build_object(
        'success', true,
        'ad_id', ad_id,
        'message', 'Anúncio inserido com sucesso'
    );
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário de documentação
COMMENT ON FUNCTION insert_ad_with_token(text, json) IS 'Insere ou atualiza anúncio. Se library_id já existir para o usuário, atualiza campos e retorna sucesso.'; 
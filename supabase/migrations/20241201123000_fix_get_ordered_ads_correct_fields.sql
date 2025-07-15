-- Migração v3.9.2 - Correção URGENTE da função get_ordered_ads
-- Data: Dezembro 2024
-- Objetivo: Corrigir campos inexistentes que estavam causando erro 400

-- PROBLEMA IDENTIFICADO:
-- A função get_ordered_ads estava tentando acessar campos que não existem na tabela ads
-- (likes, comments, shares, views, platform, ad_id)

-- SOLUÇÃO: Recriar função apenas com campos que realmente existem

-- Drop da função problemática
DROP FUNCTION IF EXISTS get_ordered_ads(uuid, text, integer, integer);

-- Recriar função com campos corretos
CREATE OR REPLACE FUNCTION get_ordered_ads(
    p_user_id uuid,
    p_filter_type text,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE (
    id bigint,
    library_id text,
    title text,
    description text,
    advertiser_name text,
    page_name text,
    video_url text,
    thumbnail_url text,
    uses_count integer,
    start_date date,
    end_date date,
    is_active boolean,
    category text,
    country text,
    language text,
    user_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    page_url text,
    ad_url text,
    link_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.library_id,
        a.title,
        a.description,
        a.advertiser_name,
        a.page_name,
        a.video_url,
        a.thumbnail_url,
        a.uses_count,
        a.start_date,
        a.end_date,
        a.is_active,
        a.category,
        a.country,
        a.language,
        a.user_id,
        a.created_at,
        a.updated_at,
        a.page_url,
        a.ad_url,
        a.link_type
    FROM
        ads a
    WHERE
        a.user_id = p_user_id AND
        (
            -- ✅ MANTIDO: trending filtra por uses_count >= 50
            (p_filter_type = 'trending' AND a.uses_count >= 50) OR
            (p_filter_type = 'weekly' AND a.created_at >= (NOW() - INTERVAL '7 days'))
        ) AND
        -- Filtrar anunciantes inválidos
        a.advertiser_name IS NOT NULL AND
        a.advertiser_name != '' AND
        LOWER(a.advertiser_name) NOT IN ('anunciante desconhecido', 'unknown advertiser', 'patrocinado', 'sponsored')
    ORDER BY
        a.uses_count DESC,
        a.created_at DESC,
        a.id DESC
    LIMIT
        p_limit
    OFFSET
        p_offset;
END;
$$ LANGUAGE plpgsql;

-- Comentário da migração
COMMENT ON FUNCTION get_ordered_ads(uuid, text, integer, integer) IS 
'v3.9.2 - CORREÇÃO CRÍTICA: Função corrigida com campos corretos da tabela ads. Resolve erro 400 Bad Request nos filtros trending/weekly.';

-- Log da migração aplicada
DO $$
BEGIN
    RAISE NOTICE 'Migração v3.9.2 aplicada: Função get_ordered_ads corrigida com campos válidos';
END $$; 
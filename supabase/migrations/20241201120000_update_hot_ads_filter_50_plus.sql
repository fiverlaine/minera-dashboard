-- Migração v3.9.1 - Atualização do filtro "Ofertas Mais Quentes" para 50+ anúncios
-- Data: Dezembro 2024
-- Objetivo: Modificar função get_ordered_ads para filtrar ofertas quentes por uses_count >= 50

-- CONTEXTO:
-- O usuário solicitou que as "ofertas mais quentes" sejam filtradas por cards com 50 anúncios ou mais
-- ao invés do critério atual de uses_count > 0

CREATE OR REPLACE FUNCTION get_ordered_ads(
    p_user_id uuid,
    p_filter_type text,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE (
    id bigint,
    created_at timestamp with time zone,
    user_id uuid,
    advertiser_name text,
    description text,
    thumbnail_url text,
    video_url text,
    likes integer,
    comments integer,
    shares integer,
    views integer,
    platform text,
    country text,
    ad_id text,
    uses_count integer,
    category text,
    title text,
    is_active boolean,
    page_url text,
    ad_url text,
    link_type text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.created_at,
        a.user_id,
        a.advertiser_name,
        a.description,
        a.thumbnail_url,
        a.video_url,
        a.likes,
        a.comments,
        a.shares,
        a.views,
        a.platform,
        a.country,
        a.ad_id,
        a.uses_count,
        a.category,
        a.title,
        a.is_active,
        a.page_url,
        a.ad_url,
        a.link_type
    FROM
        ads a
    WHERE
        a.user_id = p_user_id AND
        (
            -- ✅ ALTERAÇÃO: trending agora filtra por uses_count >= 50 (ao invés de > 0)
            (p_filter_type = 'trending' AND a.uses_count >= 50) OR
            (p_filter_type = 'weekly' AND a.created_at >= (NOW() - INTERVAL '7 days'))
        ) AND
        -- Filtrar anunciantes inválidos (mesmo filtro da extensão)
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
'v3.9.1 - Função atualizada para filtrar ofertas mais quentes por uses_count >= 50. Ofertas quentes agora requerem 50+ anúncios para aparecer no filtro trending.';

-- Log da migração aplicada
DO $$
BEGIN
    RAISE NOTICE 'Migração v3.9.1 aplicada: Filtro "Ofertas Mais Quentes" atualizado para 50+ anúncios';
END $$; 
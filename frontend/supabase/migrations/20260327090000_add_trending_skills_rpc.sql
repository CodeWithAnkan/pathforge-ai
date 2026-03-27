CREATE OR REPLACE FUNCTION public.get_trending_skills(limit_count integer DEFAULT 5)
RETURNS TABLE (skill text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest_analyses AS (
    SELECT DISTINCT ON (user_id)
      user_id,
      extracted_skills
    FROM public.analyses
    WHERE extracted_skills IS NOT NULL
      AND jsonb_typeof(extracted_skills) = 'array'
    ORDER BY user_id, created_at DESC, id DESC
  ),
  normalized_skills AS (
    SELECT DISTINCT
      latest_analyses.user_id,
      lower(trim(replace(skill_item.value, '_', ' '))) AS skill_key
    FROM latest_analyses
    CROSS JOIN LATERAL jsonb_array_elements_text(latest_analyses.extracted_skills) AS skill_item(value)
    WHERE trim(skill_item.value) <> ''
  )
  SELECT
    skill_key AS skill,
    count(*) AS count
  FROM normalized_skills
  GROUP BY skill_key
  ORDER BY count(*) DESC, skill_key ASC
  LIMIT GREATEST(limit_count, 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_trending_skills(integer) TO authenticated;

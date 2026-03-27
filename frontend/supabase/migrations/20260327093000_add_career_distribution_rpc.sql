CREATE OR REPLACE FUNCTION public.get_career_distribution(limit_count integer DEFAULT 5)
RETURNS TABLE (career text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest_analyses AS (
    SELECT DISTINCT ON (user_id)
      user_id,
      career_recommendations
    FROM public.analyses
    WHERE career_recommendations IS NOT NULL
      AND jsonb_typeof(career_recommendations) = 'array'
      AND jsonb_array_length(career_recommendations) > 0
    ORDER BY user_id, created_at DESC, id DESC
  ),
  top_careers AS (
    SELECT
      lower(trim(career_recommendations -> 0 ->> 'career')) AS career_key
    FROM latest_analyses
    WHERE trim(career_recommendations -> 0 ->> 'career') <> ''
  )
  SELECT
    career_key AS career,
    count(*) AS count
  FROM top_careers
  GROUP BY career_key
  ORDER BY count(*) DESC, career_key ASC
  LIMIT GREATEST(limit_count, 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_career_distribution(integer) TO authenticated;

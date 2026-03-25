ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS extracted_skills JSONB,
  ADD COLUMN IF NOT EXISTS career_recommendations JSONB,
  ADD COLUMN IF NOT EXISTS career_insight JSONB,
  ADD COLUMN IF NOT EXISTS industry_insight JSONB;

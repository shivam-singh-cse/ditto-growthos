-- ============================================================
-- DITTO GROWTH OS — ADDITIONAL HELPERS
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Fuzzy influencer name search (used by duplicate detection)
CREATE OR REPLACE FUNCTION public.search_influencers_fuzzy(
  search_name TEXT,
  min_similarity NUMERIC DEFAULT 0.4
)
RETURNS SETOF public.influencers AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.influencers
  WHERE
    is_deleted = FALSE
    AND similarity(lower(name), lower(search_name)) >= min_similarity
  ORDER BY similarity(lower(name), lower(search_name)) DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute on all functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_command_center_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_influencers_fuzzy(TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_recommendation(NUMERIC, INTEGER, INTEGER, INTEGER) TO authenticated;

-- Grant select on views
GRANT SELECT ON public.v_campaigns TO authenticated;
GRANT SELECT ON public.v_tasks TO authenticated;
GRANT SELECT ON public.v_activity_log TO authenticated;

-- Realtime subscriptions (enable for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.influencers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaign_performance;

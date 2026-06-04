-- ============================================================
-- DITTO GROWTH OS — DATABASE SCHEMA + SEED DATA
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- fuzzy text search

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('founder', 'vp_marketing', 'influencer_manager');
CREATE TYPE user_status AS ENUM ('active', 'inactive');

CREATE TYPE influencer_status AS ENUM (
  'Sourced', 'Contacted', 'Waiting For Reply',
  'Negotiation', 'Approved', 'Live', 'Inactive'
);
CREATE TYPE relationship_score AS ENUM ('Cold', 'Warm', 'Partner', 'Strategic Partner');

CREATE TYPE product_type AS ENUM ('Health', 'Term', 'Both');
CREATE TYPE content_type AS ENUM (
  'LinkedIn Post', 'Instagram Reel', 'Instagram Story',
  'Dedicated YouTube Video', 'Integrated YouTube Video'
);
CREATE TYPE campaign_status AS ENUM (
  'Draft', 'Negotiation', 'Approved', 'Scheduled',
  'Live', 'Completed', 'Awaiting Review', 'Delayed'
);
CREATE TYPE approval_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE recommendation AS ENUM ('Scale', 'Retest', 'Cut');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE task_status AS ENUM ('Open', 'In Progress', 'Done', 'Overdue');
CREATE TYPE entity_type AS ENUM ('influencer', 'campaign', 'task', 'report');

-- ─── TABLES ─────────────────────────────────────────────────

-- USERS (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  role         user_role NOT NULL DEFAULT 'influencer_manager',
  status       user_status NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INFLUENCERS
CREATE TABLE IF NOT EXISTS public.influencers (
  influencer_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  platform          TEXT NOT NULL,
  category          TEXT NOT NULL,
  followers         INTEGER NOT NULL DEFAULT 0,
  engagement_rate   NUMERIC(5,2) NOT NULL DEFAULT 0,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL DEFAULT '',
  instagram_url     TEXT,
  youtube_url       TEXT,
  linkedin_url      TEXT,
  owner_id          UUID NOT NULL REFERENCES public.users(id),
  status            influencer_status NOT NULL DEFAULT 'Sourced',
  last_contact_date DATE,
  next_action       TEXT,
  next_action_date  DATE,
  relationship_score relationship_score NOT NULL DEFAULT 'Cold',
  notes             TEXT,
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
  campaign_id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id         UUID NOT NULL REFERENCES public.influencers(influencer_id),
  product               product_type NOT NULL,
  content_type          content_type NOT NULL,
  campaign_owner        UUID NOT NULL REFERENCES public.users(id),
  budget                NUMERIC(12,2) NOT NULL DEFAULT 0,
  launch_date           DATE,
  campaign_status       campaign_status NOT NULL DEFAULT 'Draft',
  utm_link              TEXT,
  promo_code            TEXT,
  lead_capture_method   TEXT,
  deliverables          TEXT,
  approval_status       approval_status NOT NULL DEFAULT 'Pending',
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CAMPAIGN PERFORMANCE
CREATE TABLE IF NOT EXISTS public.campaign_performance (
  campaign_id       UUID PRIMARY KEY REFERENCES public.campaigns(campaign_id) ON DELETE CASCADE,
  leads             INTEGER NOT NULL DEFAULT 0,
  qualified_leads   INTEGER NOT NULL DEFAULT 0,
  conversions       INTEGER NOT NULL DEFAULT 0,
  premium_revenue   NUMERIC(14,2) NOT NULL DEFAULT 0,
  roi               NUMERIC(8,2) NOT NULL DEFAULT 0,
  recommendation    recommendation,
  review_notes      TEXT,
  reviewed_by       UUID REFERENCES public.users(id),
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  task_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type   entity_type NOT NULL,
  entity_id     UUID NOT NULL,
  owner         UUID NOT NULL REFERENCES public.users(id),
  title         TEXT NOT NULL,
  description   TEXT,
  due_date      DATE NOT NULL,
  priority      task_priority NOT NULL DEFAULT 'Medium',
  status        task_status NOT NULL DEFAULT 'Open',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.activity_log (
  log_id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id),
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  old_value     JSONB,
  new_value     JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_influencers_owner ON public.influencers(owner_id);
CREATE INDEX IF NOT EXISTS idx_influencers_status ON public.influencers(status);
CREATE INDEX IF NOT EXISTS idx_influencers_name_trgm ON public.influencers USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_campaigns_influencer ON public.campaigns(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner ON public.campaigns(campaign_owner);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON public.tasks(owner);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON public.tasks(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON public.activity_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_log(created_at DESC);

-- ─── TRIGGERS ────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER influencers_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER campaign_performance_updated_at
  BEFORE UPDATE ON public.campaign_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'influencer_manager')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger creation requires superuser or API. Commenting out to allow SQL Editor execution.
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users: authenticated can read" ON public.users
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users: admins can update" ON public.users
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('founder', 'vp_marketing'));

-- INFLUENCERS policies
CREATE POLICY "Influencers: all authenticated can read" ON public.influencers
  FOR SELECT TO authenticated USING (is_deleted = FALSE);

CREATE POLICY "Influencers: managers and VP can insert" ON public.influencers
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('influencer_manager', 'vp_marketing', 'founder'));

CREATE POLICY "Influencers: managers and VP can update" ON public.influencers
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('influencer_manager', 'vp_marketing', 'founder'));

-- CAMPAIGNS policies
CREATE POLICY "Campaigns: all authenticated can read" ON public.campaigns
  FOR SELECT TO authenticated USING (is_deleted = FALSE);

CREATE POLICY "Campaigns: managers and VP can insert" ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('influencer_manager', 'vp_marketing', 'founder'));

CREATE POLICY "Campaigns: managers and VP can update" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('influencer_manager', 'vp_marketing', 'founder'));

-- CAMPAIGN PERFORMANCE policies
CREATE POLICY "Performance: all authenticated can read" ON public.campaign_performance
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Performance: VP and founder can insert/update" ON public.campaign_performance
  FOR INSERT TO authenticated
  WITH CHECK (public.user_role() IN ('vp_marketing', 'founder'));

CREATE POLICY "Performance: VP and founder can update" ON public.campaign_performance
  FOR UPDATE TO authenticated
  USING (public.user_role() IN ('vp_marketing', 'founder'));

-- TASKS policies
CREATE POLICY "Tasks: all authenticated can read" ON public.tasks
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Tasks: all authenticated can insert" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Tasks: owners and admins can update" ON public.tasks
  FOR UPDATE TO authenticated
  USING (owner = auth.uid() OR public.user_role() IN ('vp_marketing', 'founder'));

-- ACTIVITY LOG policies
CREATE POLICY "Activity: all authenticated can read" ON public.activity_log
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Activity: all authenticated can insert" ON public.activity_log
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- ─── VIEWS ───────────────────────────────────────────────────

-- Campaigns with influencer and owner names (useful for joins)
CREATE OR REPLACE VIEW public.v_campaigns AS
SELECT
  c.*,
  i.name AS influencer_name,
  i.platform AS influencer_platform,
  i.relationship_score,
  u.name AS campaign_owner_name,
  cp.leads,
  cp.qualified_leads,
  cp.conversions,
  cp.premium_revenue,
  cp.roi,
  cp.recommendation
FROM public.campaigns c
LEFT JOIN public.influencers i ON c.influencer_id = i.influencer_id
LEFT JOIN public.users u ON c.campaign_owner = u.id
LEFT JOIN public.campaign_performance cp ON c.campaign_id = cp.campaign_id
WHERE c.is_deleted = FALSE;

-- Tasks with owner names
CREATE OR REPLACE VIEW public.v_tasks AS
SELECT
  t.*,
  u.name AS owner_name
FROM public.tasks t
LEFT JOIN public.users u ON t.owner = u.id;

-- Activity log with user names
CREATE OR REPLACE VIEW public.v_activity_log AS
SELECT
  al.*,
  u.name AS user_name
FROM public.activity_log al
LEFT JOIN public.users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- ─── FUNCTIONS ───────────────────────────────────────────────

-- Get command center data in one call
CREATE OR REPLACE FUNCTION public.get_command_center_summary()
RETURNS JSON AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  RETURN json_build_object(
    'tasks_due_today', (
      SELECT COUNT(*) FROM public.tasks
      WHERE due_date = today AND status IN ('Open', 'In Progress')
    ),
    'overdue_tasks', (
      SELECT COUNT(*) FROM public.tasks
      WHERE due_date < today AND status IN ('Open', 'In Progress')
    ),
    'campaigns_going_live', (
      SELECT COUNT(*) FROM public.campaigns
      WHERE launch_date BETWEEN today AND today + 7
        AND campaign_status IN ('Scheduled', 'Approved')
        AND is_deleted = FALSE
    ),
    'campaigns_awaiting_review', (
      SELECT COUNT(*) FROM public.campaigns
      WHERE campaign_status = 'Awaiting Review' AND is_deleted = FALSE
    ),
    'live_campaigns', (
      SELECT COUNT(*) FROM public.campaigns
      WHERE campaign_status = 'Live' AND is_deleted = FALSE
    ),
    'total_influencers', (
      SELECT COUNT(*) FROM public.influencers WHERE is_deleted = FALSE
    ),
    'total_spend', (
      SELECT COALESCE(SUM(budget), 0) FROM public.campaigns WHERE is_deleted = FALSE
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(premium_revenue), 0) FROM public.campaign_performance
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Smart recommendation engine
CREATE OR REPLACE FUNCTION public.compute_recommendation(
  p_roi NUMERIC,
  p_conversions INTEGER,
  p_leads INTEGER,
  p_qualified_leads INTEGER
) RETURNS recommendation AS $$
DECLARE
  conv_rate NUMERIC;
  lead_quality NUMERIC;
BEGIN
  conv_rate := CASE WHEN p_leads > 0 THEN (p_conversions::NUMERIC / p_leads) * 100 ELSE 0 END;
  lead_quality := CASE WHEN p_leads > 0 THEN p_qualified_leads::NUMERIC / p_leads ELSE 0 END;

  IF p_roi >= 5 AND conv_rate >= 15 AND lead_quality >= 0.4 THEN
    RETURN 'Scale';
  ELSIF p_roi < 1 AND p_conversions <= 3 THEN
    RETURN 'Cut';
  ELSE
    RETURN 'Retest';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-set recommendation when performance is inserted/updated
CREATE OR REPLACE FUNCTION public.auto_set_recommendation()
RETURNS TRIGGER AS $$
BEGIN
  NEW.recommendation := public.compute_recommendation(
    NEW.roi, NEW.conversions, NEW.leads, NEW.qualified_leads
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_recommendation
  BEFORE INSERT OR UPDATE ON public.campaign_performance
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_recommendation();

-- ─── SEED DATA ───────────────────────────────────────────────
-- NOTE: Run AFTER creating users via Supabase Auth Dashboard
-- Replace UUIDs below with actual user IDs from auth.users

-- Step 1: First create 3 users in Auth > Users in Supabase Dashboard:
--   shivam@ditto.in  (Founder)
--   priya@ditto.in   (VP Marketing)
--   rahul@ditto.in   (Influencer Manager)
--
-- Then run the UPDATE below with the real UUIDs:

-- Update user roles (get IDs from auth.users)
-- UPDATE public.users SET role = 'founder'              WHERE email = 'shivam@ditto.in';
-- UPDATE public.users SET role = 'vp_marketing'         WHERE email = 'priya@ditto.in';
-- UPDATE public.users SET role = 'influencer_manager'   WHERE email = 'rahul@ditto.in';

-- ─── INFLUENCER SEED ─────────────────────────────────────────
-- This uses a DO block so we can reference user IDs by email
DO $$
DECLARE
  founder_id    UUID;
  vp_id         UUID;
  manager_id    UUID;

  inf_001 UUID := uuid_generate_v4();
  inf_002 UUID := uuid_generate_v4();
  inf_003 UUID := uuid_generate_v4();
  inf_004 UUID := uuid_generate_v4();
  inf_005 UUID := uuid_generate_v4();
  inf_006 UUID := uuid_generate_v4();
  inf_007 UUID := uuid_generate_v4();
  inf_008 UUID := uuid_generate_v4();
  inf_009 UUID := uuid_generate_v4();
  inf_010 UUID := uuid_generate_v4();
  inf_011 UUID := uuid_generate_v4();
  inf_012 UUID := uuid_generate_v4();
  inf_013 UUID := uuid_generate_v4();
  inf_014 UUID := uuid_generate_v4();
  inf_015 UUID := uuid_generate_v4();

  cmp_001 UUID := uuid_generate_v4();
  cmp_002 UUID := uuid_generate_v4();
  cmp_003 UUID := uuid_generate_v4();
  cmp_004 UUID := uuid_generate_v4();
  cmp_005 UUID := uuid_generate_v4();
  cmp_006 UUID := uuid_generate_v4();
  cmp_007 UUID := uuid_generate_v4();
  cmp_008 UUID := uuid_generate_v4();
  cmp_009 UUID := uuid_generate_v4();
  cmp_010 UUID := uuid_generate_v4();
  cmp_011 UUID := uuid_generate_v4();
  cmp_012 UUID := uuid_generate_v4();
  cmp_013 UUID := uuid_generate_v4();
  cmp_014 UUID := uuid_generate_v4();
  cmp_015 UUID := uuid_generate_v4();
  cmp_016 UUID := uuid_generate_v4();
  cmp_017 UUID := uuid_generate_v4();
  cmp_018 UUID := uuid_generate_v4();
  cmp_019 UUID := uuid_generate_v4();
  cmp_020 UUID := uuid_generate_v4();

BEGIN
  -- Get user IDs
  SELECT id INTO founder_id FROM public.users WHERE email = 'shivam@ditto.in';
  SELECT id INTO vp_id      FROM public.users WHERE email = 'priya@ditto.in';
  SELECT id INTO manager_id FROM public.users WHERE email = 'rahul@ditto.in';

  -- Skip seed if users not created yet
  IF founder_id IS NULL THEN
    RAISE NOTICE 'Users not found. Create auth users first, then run seed.';
    RETURN;
  END IF;

  -- ─── INFLUENCERS ────────────────────────────────────────────
  INSERT INTO public.influencers VALUES
  (inf_001, 'Aditya Kumar',    'YouTube',   'Finance',               284000, 4.2, 'aditya@guidepune.com',      '+91 98765 43210', 'https://instagram.com/adityaguidepune',  'https://youtube.com/@AdityaGuidePune',    'https://linkedin.com/in/adityakumar',  vp_id,      'Live',              '2026-05-28', 'Schedule Q3 campaign',               '2026-06-10', 'Strategic Partner', 'Best performing influencer. 3 successful campaigns.', FALSE, NOW() - INTERVAL '140 days', NOW()),
  (inf_002, 'Arjun Mehta',     'Instagram', 'Personal Finance',      156000, 3.8, 'arjun@insightspune.com',    '+91 87654 32109', 'https://instagram.com/arjuninsightspune', NULL,                                       'https://linkedin.com/in/arjunmehta',   vp_id,      'Approved',          '2026-05-30', 'Send campaign brief',                '2026-06-05', 'Partner',           'Good engagement. Low ROI on health but limited evidence.', FALSE, NOW() - INTERVAL '113 days', NOW()),
  (inf_003, 'Om Prakash',      'YouTube',   'Insurance Education',    98000, 2.1, 'om@studioindia.com',        '+91 76543 21098', 'https://instagram.com/omstudioindia',    'https://youtube.com/@OmStudioIndia',       NULL,                                   vp_id,      'Inactive',          '2026-04-15', 'Review for offboarding',             '2026-06-01', 'Cold',              'Repeated poor performance on Term campaigns.', FALSE, NOW() - INTERVAL '134 days', NOW()),
  (inf_004, 'Sneha Iyer',      'LinkedIn',  'Financial Planning',     42000, 6.7, 'sneha.iyer@gmail.com',      '+91 65432 10987', 'https://instagram.com/snehaiyer',        NULL,                                       'https://linkedin.com/in/snehaiyer',    vp_id,      'Live',              '2026-06-01', 'Collect performance data',           '2026-06-15', 'Warm',              'High engagement on LinkedIn. First campaign live.', FALSE, NOW() - INTERVAL '90 days',  NOW()),
  (inf_005, 'Vikram Nair',     'YouTube',   'FIRE Movement',         312000, 5.1, 'vikram@financefocus.in',    '+91 54321 09876', 'https://instagram.com/vikramfinancefocus','https://youtube.com/@VikramFinanceFocus',  NULL,                                   manager_id, 'Negotiation',       '2026-06-02', 'Finalize budget agreement',          '2026-06-06', 'Warm',              'Large audience. Negotiating for dedicated YT video.', FALSE, NOW() - INTERVAL '52 days',  NOW()),
  (inf_006, 'Kavya Reddy',     'Instagram', 'Millennial Finance',     89000, 4.9, 'kavya.reddy@creator.co',    '+91 43210 98765', 'https://instagram.com/kavyareddy',       NULL,                                       'https://linkedin.com/in/kavyareddy',   vp_id,      'Contacted',         '2026-06-03', 'Follow up on proposal',              '2026-06-07', 'Cold',              'Outreach sent. Good fit for health insurance.', FALSE, NOW() - INTERVAL '14 days',  NOW()),
  (inf_007, 'Rohan Kapoor',    'YouTube',   'Personal Finance',      523000, 3.2, 'rohan@moneywise.in',        '+91 32109 87654', 'https://instagram.com/rohanmoneywise',   'https://youtube.com/@RohanMoneyWise',      NULL,                                   manager_id, 'Approved',          '2026-05-25', 'Send UTM and promo codes',           '2026-06-04', 'Partner',           'Large subscriber base. Approved for Both products.', FALSE, NOW() - INTERVAL '94 days',  NOW()),
  (inf_008, 'Divya Krishnan',  'Instagram', 'Women & Finance',       134000, 7.2, 'divya.krishnan@gmail.com',  '+91 21098 76543', 'https://instagram.com/divyakrish',       NULL,                                       NULL,                                   vp_id,      'Waiting For Reply', '2026-05-29', 'Follow up — no reply in 5 days',     '2026-06-04', 'Cold',              'High engagement rate. Waiting for reply.', FALSE, NOW() - INTERVAL '12 days',  NOW()),
  (inf_009, 'Manish Gupta',    'YouTube',   'Insurance & Tax',       178000, 4.5, 'manish@taxsaver.in',        '+91 10987 65432', NULL,                                      'https://youtube.com/@ManishTaxSaver',      'https://linkedin.com/in/manishgupta',  manager_id, 'Live',              '2026-06-01', 'Monitor performance weekly',         '2026-06-08', 'Partner',           'Strong term insurance content. Scale candidate.', FALSE, NOW() - INTERVAL '85 days',  NOW()),
  (inf_010, 'Preethi Nambiar', 'LinkedIn',  'HR & Benefits',          28000, 8.9, 'preethi.nambiar@creator.co','+91 09876 54321', NULL,                                      NULL,                                       'https://linkedin.com/in/preethinambiar', vp_id,    'Sourced',           NULL,         'Send initial outreach email',        '2026-06-05', 'Cold',              'Discovered via LinkedIn. Niche HR audience.', FALSE, NOW() - INTERVAL '2 days',   NOW()),
  (inf_011, 'Siddharth Rao',   'YouTube',   'Stock Market & Finance', 445000, 3.6, 'sid.rao@investwise.com',   '+91 98765 12340', 'https://instagram.com/sidrao',           'https://youtube.com/@SiddharthInvestWise',  NULL,                                  manager_id, 'Live',              '2026-05-30', 'Collect final metrics',              '2026-06-12', 'Strategic Partner', 'Premium YouTuber. Both product campaigns above benchmark.', FALSE, NOW() - INTERVAL '124 days', NOW()),
  (inf_012, 'Ananya Singh',    'Instagram', 'Lifestyle & Finance',    67000, 5.4, 'ananya.singh@collab.in',    '+91 87654 23019', 'https://instagram.com/ananyasingh',      NULL,                                       NULL,                                   vp_id,      'Contacted',         '2026-06-01', 'Follow up if no reply',              '2026-06-08', 'Cold',              'Good aesthetic fit. Health-focused audience.', FALSE, NOW() - INTERVAL '6 days',   NOW()),
  (inf_013, 'Nikhil Jain',     'YouTube',   'Entrepreneurship',      201000, 4.0, 'nikhil@buildandgrow.in',    '+91 76543 34029', NULL,                                      'https://youtube.com/@NikhilBuildGrow',     'https://linkedin.com/in/nikhiljain',   manager_id, 'Negotiation',       '2026-06-03', 'Counter offer on budget',            '2026-06-06', 'Warm',              'Entrepreneurial audience. Budget negotiation in progress.', FALSE, NOW() - INTERVAL '42 days',  NOW()),
  (inf_014, 'Pooja Patel',     'Instagram', 'Family Finance',         92000, 6.1, 'pooja.patel@famfin.com',    '+91 65432 45038', 'https://instagram.com/poojapatel',       NULL,                                       NULL,                                   vp_id,      'Approved',          '2026-05-31', 'Get deliverables sign-off',          '2026-06-07', 'Warm',              'Family focus. Strong fit for term life.', FALSE, NOW() - INTERVAL '59 days',  NOW()),
  (inf_015, 'Karan Malhotra',  'YouTube',   'Crypto & Finance',      387000, 2.8, 'karan@cryptofin.in',        '+91 54321 56047', 'https://instagram.com/karanmalhotra',    'https://youtube.com/@KaranCryptoFin',      NULL,                                   manager_id, 'Waiting For Reply', '2026-05-27', 'Final follow-up before drop',        '2026-06-04', 'Cold',              'Crypto-primary audience. May not convert well.', FALSE, NOW() - INTERVAL '16 days',  NOW());

  -- ─── CAMPAIGNS ────────────────────────────────────────────
  INSERT INTO public.campaigns VALUES
  (cmp_001, inf_001, 'Both',   'Dedicated YouTube Video',   vp_id,      150000, '2026-04-15', 'Completed',      'https://joinditto.in?utm_source=aditya_yt_apr26',     'ADITYA10',  'Landing page form',       '1x dedicated 15-min video, 2x community posts', 'Approved', FALSE, NOW() - INTERVAL '63 days', NOW() - INTERVAL '5 days'),
  (cmp_002, inf_001, 'Both',   'Integrated YouTube Video',  vp_id,      120000, '2026-02-20', 'Completed',      'https://joinditto.in?utm_source=aditya_yt_feb26',     'ADITYA5',   'Landing page form',       '1x integrated mention in finance video',          'Approved', FALSE, NOW() - INTERVAL '115 days',NOW() - INTERVAL '81 days'),
  (cmp_003, inf_001, 'Health', 'Instagram Reel',            vp_id,       80000, '2026-05-10', 'Completed',      'https://joinditto.in?utm_source=aditya_ig_may26',     'ADITYA15',  'Instagram swipe-up link', '1x Instagram Reel, 3x stories',                   'Approved', FALSE, NOW() - INTERVAL '40 days', NOW() - INTERVAL '25 days'),
  (cmp_004, inf_002, 'Health', 'Instagram Reel',            manager_id,  60000, '2026-03-20', 'Completed',      'https://joinditto.in?utm_source=arjun_ig_mar26',      'ARJUN10',   'Bio link',                '1x reel, 2x stories',                             'Approved', FALSE, NOW() - INTERVAL '76 days', NOW() - INTERVAL '45 days'),
  (cmp_005, inf_003, 'Term',   'Dedicated YouTube Video',   vp_id,      100000, '2026-02-05', 'Completed',      'https://joinditto.in?utm_source=om_yt_feb26',         'OMTERM10',  'Landing page form',       '1x dedicated video',                              'Approved', FALSE, NOW() - INTERVAL '119 days',NOW() - INTERVAL '85 days'),
  (cmp_006, inf_003, 'Term',   'Integrated YouTube Video',  vp_id,       75000, '2026-04-01', 'Completed',      'https://joinditto.in?utm_source=om_yt_apr26',         'OMTERM5',   'Landing page form',       '1x integrated mention',                           'Approved', FALSE, NOW() - INTERVAL '64 days', NOW() - INTERVAL '34 days'),
  (cmp_007, inf_004, 'Health', 'LinkedIn Post',             vp_id,       40000, '2026-06-01', 'Live',           'https://joinditto.in?utm_source=sneha_li_jun26',      'SNEHA10',   'LinkedIn form',           '3x LinkedIn posts, 1x newsletter',                'Approved', FALSE, NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  (cmp_008, inf_005, 'Both',   'Dedicated YouTube Video',   manager_id, 250000, '2026-06-20', 'Negotiation',    NULL,                                                  NULL,        NULL,                      'TBD',                                             'Pending',  FALSE, NOW() - INTERVAL '7 days',  NOW()),
  (cmp_009, inf_007, 'Both',   'Dedicated YouTube Video',   manager_id, 200000, '2026-06-15', 'Approved',       'https://joinditto.in?utm_source=rohan_yt_jun26',      'ROHAN15',   'Landing page form',       '1x dedicated 20-min video, 2x shorts',            'Approved', FALSE, NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'),
  (cmp_010, inf_009, 'Term',   'Dedicated YouTube Video',   manager_id, 130000, '2026-05-20', 'Live',           'https://joinditto.in?utm_source=manish_yt_may26',     'MANISH10',  'Landing page form',       '1x dedicated video on term insurance',            'Approved', FALSE, NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'),
  (cmp_011, inf_011, 'Both',   'Dedicated YouTube Video',   manager_id, 180000, '2026-05-01', 'Completed',      'https://joinditto.in?utm_source=sid_yt_may26',        'SID10',     'Landing page form',       '1x dedicated video, 1x community post',           'Approved', FALSE, NOW() - INTERVAL '50 days', NOW() - INTERVAL '4 days'),
  (cmp_012, inf_011, 'Term',   'Integrated YouTube Video',  manager_id,  90000, '2026-05-25', 'Live',           'https://joinditto.in?utm_source=sid_yt_term_may26',   'SIDTERM5',  'Landing page form',       '1x integrated mention',                           'Approved', FALSE, NOW() - INTERVAL '23 days', NOW() - INTERVAL '10 days'),
  (cmp_013, inf_014, 'Term',   'Instagram Reel',            vp_id,       55000, '2026-06-10', 'Approved',       'https://joinditto.in?utm_source=pooja_ig_jun26',      'POOJA10',   'Bio link',                '1x reel, 4x stories',                             'Approved', FALSE, NOW() - INTERVAL '13 days', NOW() - INTERVAL '4 days'),
  (cmp_014, inf_002, 'Both',   'Instagram Reel',            manager_id,  75000, '2026-06-08', 'Scheduled',      'https://joinditto.in?utm_source=arjun_ig_jun26',      'ARJUN15',   'Bio link',                '2x reels, 3x stories',                            'Approved', FALSE, NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'),
  (cmp_015, inf_009, 'Health', 'Integrated YouTube Video',  manager_id,  85000, '2026-06-18', 'Scheduled',      'https://joinditto.in?utm_source=manish_yt_health_jun26','MANISHH10','Landing page form',      '1x integrated mention in finance video',           'Approved', FALSE, NOW() - INTERVAL '5 days',  NOW()),
  (cmp_016, inf_013, 'Term',   'Dedicated YouTube Video',   manager_id, 160000, '2026-06-25', 'Negotiation',    NULL,                                                  NULL,        NULL,                      'TBD',                                             'Pending',  FALSE, NOW() - INTERVAL '10 days', NOW()),
  (cmp_017, inf_004, 'Both',   'LinkedIn Post',             vp_id,       35000, '2026-06-22', 'Draft',          NULL,                                                  NULL,        NULL,                      '2x LinkedIn posts',                               'Pending',  FALSE, NOW() - INTERVAL '2 days',  NOW()),
  (cmp_018, inf_007, 'Health', 'Instagram Story',           manager_id,  45000, '2026-05-05', 'Awaiting Review','https://joinditto.in?utm_source=rohan_ig_may26',      'ROHL15',    'Instagram swipe-up link', '5x Instagram stories',                            'Approved', FALSE, NOW() - INTERVAL '44 days', NOW() - INTERVAL '15 days'),
  (cmp_019, inf_001, 'Health', 'Instagram Story',           vp_id,       50000, '2026-06-05', 'Scheduled',      'https://joinditto.in?utm_source=aditya_ig_jun26',     'ADITJUN',   'Instagram swipe-up link', '4x Instagram stories',                            'Approved', FALSE, NOW() - INTERVAL '9 days',  NOW()),
  (cmp_020, inf_006, 'Health', 'Instagram Reel',            vp_id,       65000, '2026-07-01', 'Draft',          NULL,                                                  NULL,        NULL,                      '1x reel, 3x stories',                             'Pending',  FALSE, NOW() - INTERVAL '1 day',   NOW());

  -- ─── CAMPAIGN PERFORMANCE ───────────────────────────────────
  -- Note: recommendation is auto-computed by trigger
  INSERT INTO public.campaign_performance (campaign_id, leads, qualified_leads, conversions, premium_revenue, roi, review_notes, reviewed_by, reviewed_at)
  VALUES
  (cmp_001, 312, 187, 47, 2250000, 15.0, 'Exceptional. Best campaign to date. Scale immediately.',       founder_id, NOW() - INTERVAL '4 days'),
  (cmp_002, 248, 142, 35, 1680000, 14.0, 'Strong ROI. Consistent with brand messaging.',                founder_id, NOW() - INTERVAL '80 days'),
  (cmp_003, 189,  98, 22,  960000, 12.0, 'Instagram performs well for Aditya audience.',                vp_id,      NOW() - INTERVAL '24 days'),
  (cmp_004,  87,  34,  6,  240000,  4.0, 'Low ROI but limited evidence. Audience needs education.',     manager_id, NOW() - INTERVAL '44 days'),
  (cmp_005,  62,  18,  3,   90000,  0.9, 'Poor performance. Low conversion. Below break-even.',         vp_id,      NOW() - INTERVAL '84 days'),
  (cmp_006,  54,  14,  2,   60000,  0.8, 'Repeated poor performance. Cut this partnership.',            vp_id,      NOW() - INTERVAL '33 days'),
  (cmp_011, 267, 156, 38, 1710000,  9.5, 'Strong. Audience very responsive to Both product messaging.', founder_id, NOW() - INTERVAL '3 days'),
  (cmp_018,  72,  28,  5,  225000,  5.0, 'Decent leads but low conversions. Story format needs work.',  manager_id, NOW() - INTERVAL '14 days');

  -- ─── TASKS ──────────────────────────────────────────────────
  INSERT INTO public.tasks (entity_type, entity_id, owner, title, description, due_date, priority, status) VALUES
  ('influencer', inf_008, vp_id,      'Follow up with Divya Krishnan — no reply in 5 days',   'Send follow-up email and DM on Instagram.',           CURRENT_DATE,       'High',     'Open'),
  ('influencer', inf_015, manager_id, 'Final follow-up with Karan Malhotra before dropping',   'If no reply today, mark as Inactive.',                 CURRENT_DATE,       'High',     'Open'),
  ('campaign',   cmp_009, manager_id, 'Send UTM link and promo code to Rohan Kapoor',          'Campaign launches June 15. Must send by June 5.',      CURRENT_DATE + 1,   'Critical', 'Open'),
  ('influencer', inf_010, vp_id,      'Send initial outreach to Preethi Nambiar',              'LinkedIn DM + email with Ditto collaboration proposal.', CURRENT_DATE + 1,  'Medium',   'Open'),
  ('influencer', inf_005, manager_id, 'Finalize budget with Vikram Nair',                      'Counter-offer ₹2.2L for dedicated video.',             CURRENT_DATE + 2,   'High',     'Open'),
  ('influencer', inf_006, vp_id,      'Follow up with Kavya Reddy on proposal',               '4 days since proposal sent. Send friendly follow-up.', CURRENT_DATE + 3,   'Medium',   'Open'),
  ('influencer', inf_014, vp_id,      'Get deliverables sign-off from Pooja Patel',           'Campaign cmp-013 launches June 10.',                   CURRENT_DATE + 3,   'High',     'Open'),
  ('campaign',   cmp_018, manager_id, 'Complete performance review for Rohan Story campaign',  'Campaign ended. Collect all metrics.',                  CURRENT_DATE - 1,   'High',     'Overdue'),
  ('campaign',   cmp_010, manager_id, 'Monitor Manish Gupta campaign weekly performance',     'Check UTM dashboard and update lead counts.',          CURRENT_DATE + 4,   'Medium',   'Open'),
  ('influencer', inf_013, manager_id, 'Counter-offer to Nikhil Jain on budget',               'Propose ₹1.4L with 30-day performance review clause.', CURRENT_DATE + 2,   'High',     'Open'),
  ('campaign',   cmp_012, manager_id, 'Collect final metrics for Siddharth Rao Term campaign','Campaign live since May 25. Collect 2-week metrics.',  CURRENT_DATE + 8,   'Medium',   'Open'),
  ('campaign',   cmp_007, vp_id,      'Collect performance data for Sneha Iyer LinkedIn',     'First campaign live. Set up weekly check-in.',         CURRENT_DATE + 11,  'Medium',   'Open');

  -- ─── ACTIVITY LOG ─────────────────────────────────────────
  INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, old_value, new_value, created_at) VALUES
  (vp_id,      'updated influencer status',    'influencer', inf_001::TEXT, '{"status":"Approved"}',      '{"status":"Live"}',          NOW() - INTERVAL '3 days'),
  (manager_id, 'created campaign',              'campaign',   cmp_020::TEXT, NULL,                         '{"status":"Draft","budget":65000}', NOW() - INTERVAL '1 day'),
  (founder_id, 'reviewed campaign performance', 'campaign',   cmp_011::TEXT, NULL,                         '{"recommendation":"Scale","roi":9.5}', NOW() - INTERVAL '3 days'),
  (vp_id,      'added influencer',              'influencer', inf_010::TEXT, NULL,                         '{"name":"Preethi Nambiar","status":"Sourced"}', NOW() - INTERVAL '2 days'),
  (manager_id, 'updated campaign status',       'campaign',   cmp_009::TEXT, '{"status":"Negotiation"}',   '{"status":"Approved"}',      NOW() - INTERVAL '3 days'),
  (vp_id,      'updated next action',           'influencer', inf_008::TEXT, '{"next_action":"Reply to collab email"}', '{"next_action":"Follow up — no reply in 5 days"}', NOW() - INTERVAL '1 day'),
  (manager_id, 'marked task overdue',            'task',       inf_008::TEXT, '{"status":"Open"}',          '{"status":"Overdue"}',       NOW()),
  (founder_id, 'reviewed weekly report',         'report',     'report-wk-22', NULL,                        '{"action":"Approved scale budget for Aditya Kumar Q3"}', NOW() - INTERVAL '2 days'),
  (vp_id,      'updated relationship score',    'influencer', inf_001::TEXT, '{"relationship_score":"Partner"}', '{"relationship_score":"Strategic Partner"}', NOW() - INTERVAL '4 days'),
  (manager_id, 'submitted budget request',       'campaign',   cmp_008::TEXT, NULL,                         '{"budget":250000,"product":"Both"}', NOW() - INTERVAL '7 days');

END $$;

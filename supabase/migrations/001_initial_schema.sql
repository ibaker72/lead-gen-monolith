-- =============================================================================
-- Lead Gen Engine — Initial Schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUM Types
-- ---------------------------------------------------------------------------
CREATE TYPE lead_urgency AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE lead_status   AS ENUM ('new', 'qualified', 'contacted', 'sold', 'rejected');
CREATE TYPE model_type    AS ENUM ('rank_rent', 'pay_per_lead', 'exclusive');
CREATE TYPE payment_type  AS ENUM ('subscription', 'per_lead');

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- TABLE: niches
-- ---------------------------------------------------------------------------
CREATE TABLE niches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  icon            TEXT,
  base_lead_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: locations
-- ---------------------------------------------------------------------------
CREATE TABLE locations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  city       TEXT        NOT NULL,
  state      TEXT        NOT NULL,
  zip_codes  TEXT[]      NOT NULL DEFAULT '{}',
  slug       TEXT        NOT NULL UNIQUE,
  lat        NUMERIC(9,6),
  lng        NUMERIC(9,6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE: contractors
-- ---------------------------------------------------------------------------
CREATE TABLE contractors (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name           TEXT        NOT NULL,
  phone                  TEXT,
  email                  TEXT        NOT NULL,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan_tier              TEXT        NOT NULL DEFAULT 'free',
  is_active              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TRIGGER contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX contractors_user_id_idx ON contractors(user_id);
CREATE INDEX contractors_stripe_customer_idx ON contractors(stripe_customer_id);

-- ---------------------------------------------------------------------------
-- TABLE: niche_locations
-- ---------------------------------------------------------------------------
CREATE TABLE niche_locations (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_id                UUID        NOT NULL REFERENCES niches(id) ON DELETE CASCADE,
  location_id             UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  assigned_contractor_id  UUID        REFERENCES contractors(id) ON DELETE SET NULL,
  is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
  monthly_rate            NUMERIC(10,2),
  model_type              model_type  NOT NULL DEFAULT 'rank_rent',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(niche_id, location_id)
);

CREATE INDEX niche_locations_niche_idx       ON niche_locations(niche_id);
CREATE INDEX niche_locations_location_idx    ON niche_locations(location_id);
CREATE INDEX niche_locations_contractor_idx  ON niche_locations(assigned_contractor_id);

-- ---------------------------------------------------------------------------
-- TABLE: leads
-- ---------------------------------------------------------------------------
CREATE TABLE leads (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_location_id UUID          REFERENCES niche_locations(id) ON DELETE SET NULL,
  contractor_id     UUID          REFERENCES contractors(id) ON DELETE SET NULL,
  name              TEXT          NOT NULL,
  phone             TEXT          NOT NULL,
  email             TEXT,
  service_type      TEXT          NOT NULL,
  urgency_score     INTEGER       CHECK (urgency_score BETWEEN 1 AND 10),
  urgency_label     lead_urgency  NOT NULL DEFAULT 'medium',
  ai_summary        TEXT,
  status            lead_status   NOT NULL DEFAULT 'new',
  source_url        TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX leads_contractor_id_idx       ON leads(contractor_id);
CREATE INDEX leads_niche_location_id_idx   ON leads(niche_location_id);
CREATE INDEX leads_status_idx              ON leads(status);
CREATE INDEX leads_urgency_label_idx       ON leads(urgency_label);
CREATE INDEX leads_created_at_idx          ON leads(created_at DESC);

-- ---------------------------------------------------------------------------
-- TABLE: lead_events  (audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE lead_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type TEXT        NOT NULL,
  notes      TEXT,
  created_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX lead_events_lead_id_idx ON lead_events(lead_id);

-- ---------------------------------------------------------------------------
-- TABLE: payments
-- ---------------------------------------------------------------------------
CREATE TABLE payments (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id            UUID         REFERENCES contractors(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount                   NUMERIC(10,2) NOT NULL,
  lead_id                  UUID         REFERENCES leads(id) ON DELETE SET NULL,
  type                     payment_type NOT NULL,
  status                   TEXT         NOT NULL DEFAULT 'pending',
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX payments_contractor_id_idx ON payments(contractor_id);

-- ---------------------------------------------------------------------------
-- TABLE: admins
-- ---------------------------------------------------------------------------
CREATE TABLE admins (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- FUNCTION: is_admin() — used in RLS policies
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Supabase Realtime — enable on leads table
-- ---------------------------------------------------------------------------
ALTER TABLE leads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- niches: public read, admin write
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "niches_public_read"
  ON niches FOR SELECT
  USING (true);

CREATE POLICY "niches_admin_all"
  ON niches FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- locations: public read, admin write
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_public_read"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "locations_admin_all"
  ON locations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- niche_locations: public read active rows, admin write
ALTER TABLE niche_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "niche_locations_public_read"
  ON niche_locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "niche_locations_admin_all"
  ON niche_locations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- contractors: own record read/update, admin all
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contractors_own_read"
  ON contractors FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "contractors_own_update"
  ON contractors FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "contractors_admin_all"
  ON contractors FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "contractors_own_insert"
  ON contractors FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- leads: contractors see only their own leads; admin sees all
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_contractor_read"
  ON leads FOR SELECT
  USING (
    contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "leads_contractor_update"
  ON leads FOR UPDATE
  USING (
    contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
  );

CREATE POLICY "leads_admin_all"
  ON leads FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- lead_events: contractors see/write events for their leads; admin all
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_events_contractor_read"
  ON lead_events FOR SELECT
  USING (
    lead_id IN (
      SELECT id FROM leads
      WHERE contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
    )
    OR is_admin()
  );

CREATE POLICY "lead_events_contractor_insert"
  ON lead_events FOR INSERT
  WITH CHECK (
    lead_id IN (
      SELECT id FROM leads
      WHERE contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "lead_events_admin_all"
  ON lead_events FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- payments: contractors read own; admin all
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_contractor_read"
  ON payments FOR SELECT
  USING (
    contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "payments_admin_all"
  ON payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- admins: only admins can see this table (read via service role in app)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_admin_all"
  ON admins FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

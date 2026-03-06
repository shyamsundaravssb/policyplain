-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
DO $$ BEGIN
  CREATE TYPE policy_type_enum AS ENUM ('privacy', 'terms', 'cookies', 'usage', 'eula');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE crawl_status_enum AS ENUM ('success', 'unchanged', 'failed', 'url_not_found');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website VARCHAR(500),
  category VARCHAR(100),
  overall_score FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  policy_type policy_type_enum NOT NULL,
  source_url TEXT NOT NULL,
  slug VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, policy_type)
);

-- Policy versions table
CREATE TABLE IF NOT EXISTS policy_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  raw_text TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT true,

  -- AI-generated analysis fields
  overall_summary TEXT,
  risk_level risk_level_enum DEFAULT 'medium',
  risk_summary TEXT,

  -- Risk sub-scores (0-10)
  score_data_privacy INTEGER DEFAULT 0,
  score_user_rights INTEGER DEFAULT 0,
  score_billing INTEGER DEFAULT 0,
  score_legal_exposure INTEGER DEFAULT 0,
  note_data_privacy TEXT,
  note_user_rights TEXT,
  note_billing TEXT,
  note_legal_exposure TEXT,

  -- Category breakdowns (JSON arrays)
  data_collected JSONB DEFAULT '[]'::jsonb,
  data_sharing JSONB DEFAULT '[]'::jsonb,
  your_rights JSONB DEFAULT '[]'::jsonb,
  what_you_give_up JSONB DEFAULT '[]'::jsonb,
  billing JSONB DEFAULT '[]'::jsonb,
  risk_flags JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawl log table
CREATE TABLE IF NOT EXISTS crawl_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status crawl_status_enum NOT NULL,
  error_message TEXT,
  new_version_created BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_category ON companies(category);
CREATE INDEX IF NOT EXISTS idx_companies_overall_score ON companies(overall_score);
CREATE INDEX IF NOT EXISTS idx_policies_company_id ON policies(company_id);
CREATE INDEX IF NOT EXISTS idx_policies_slug ON policies(slug);
CREATE INDEX IF NOT EXISTS idx_policy_versions_policy_id ON policy_versions(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_versions_is_current ON policy_versions(is_current);
CREATE INDEX IF NOT EXISTS idx_crawl_log_policy_id ON crawl_log(policy_id);

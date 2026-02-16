-- ═══════════════════════════════════════════════
-- ResuHub — Supabase Setup SQL
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Create the resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT,
  public_url TEXT,
  name TEXT NOT NULL,
  industry TEXT DEFAULT 'General',
  score INTEGER,
  parsed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (allow all for now — no auth)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON resumes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes (created_at DESC);

-- ============================================================================
-- TANGO CMS - Fresh Database Migration
-- ============================================================================
-- This migration creates all necessary tables for the Tango CMS
-- Only includes tables that are actively being used:
--   1. sourced_text - Raw source content
--   2. categories - Content categories
--   3. processed_content - AI-processed content
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: sourced_text
-- Stores raw source content that will be processed by AI
-- ============================================================================
CREATE TABLE sourced_text (
  id BIGSERIAL PRIMARY KEY,
  original_text TEXT NOT NULL,
  processed_text TEXT,
  content_type TEXT NOT NULL DEFAULT 'story_source',
  content_tags JSONB DEFAULT '[]'::jsonb,
  word_count INTEGER,
  char_count INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT content_type_valid CHECK (
    content_type IN (
      'trivia_source',
      'story_source',
      'quote_source',
      'news_source',
      'stats_source',
      'lore_source',
      'hugs_source',
      'geo_source'
    )
  ),
  CONSTRAINT content_tags_is_array CHECK (jsonb_typeof(content_tags) = 'array')
);

-- Indexes for sourced_text
CREATE INDEX idx_sourced_text_content_type ON sourced_text(content_type);
CREATE INDEX idx_sourced_text_created_at ON sourced_text(created_at DESC);
CREATE INDEX idx_sourced_text_created_by ON sourced_text(created_by);
CREATE INDEX idx_sourced_text_content_tags ON sourced_text USING GIN (content_tags);

-- Comments for sourced_text
COMMENT ON TABLE sourced_text IS 'Raw source content to be processed by AI';
COMMENT ON COLUMN sourced_text.content_type IS 'Primary content type classification';
COMMENT ON COLUMN sourced_text.content_tags IS 'Array of content type tags (e.g., ["trivia_source", "quote_source"])';

-- ============================================================================
-- TABLE: categories
-- Master list of content categories (NHL Records, Seasonal, etc.)
-- ============================================================================
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Comments for categories
COMMENT ON TABLE categories IS 'Master list of content categories';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier';

-- ============================================================================
-- TABLE: processed_content
-- Stores AI-extracted content (trivia, quotes, stories, etc.)
-- ============================================================================
CREATE TABLE processed_content (
  id BIGSERIAL PRIMARY KEY,
  source_text_id BIGINT REFERENCES sourced_text(id) ON DELETE SET NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL,
  content JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  quality_score DECIMAL(3,2),
  export_metadata JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT content_type_valid CHECK (
    content_type IN (
      'trivia',
      'quote',
      'story',
      'stat',
      'lore',
      'hugs',
      'article'
    )
  ),
  CONSTRAINT status_valid CHECK (
    status IN ('draft', 'review', 'approved', 'published', 'archived')
  ),
  CONSTRAINT quality_score_range CHECK (quality_score >= 0 AND quality_score <= 10)
);

-- Indexes for processed_content
CREATE INDEX idx_processed_content_source_text ON processed_content(source_text_id);
CREATE INDEX idx_processed_content_category ON processed_content(category_id);
CREATE INDEX idx_processed_content_type ON processed_content(content_type);
CREATE INDEX idx_processed_content_status ON processed_content(status);
CREATE INDEX idx_processed_content_created_at ON processed_content(created_at DESC);
CREATE INDEX idx_processed_content_content ON processed_content USING GIN (content);

-- Comments for processed_content
COMMENT ON TABLE processed_content IS 'AI-extracted and processed content ready for publishing';
COMMENT ON COLUMN processed_content.content IS 'Flexible JSONB field containing the processed content structure';
COMMENT ON COLUMN processed_content.export_metadata IS 'Export configuration and metadata for static site generation';

-- ============================================================================
-- TRIGGER FUNCTIONS
-- Automatically update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_sourced_text_updated_at
  BEFORE UPDATE ON sourced_text
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processed_content_updated_at
  BEFORE UPDATE ON processed_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- All tables require authentication
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE sourced_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_content ENABLE ROW LEVEL SECURITY;

-- sourced_text policies
CREATE POLICY "Authenticated users can view sourced_text"
  ON sourced_text FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sourced_text"
  ON sourced_text FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sourced_text"
  ON sourced_text FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sourced_text"
  ON sourced_text FOR DELETE
  TO authenticated
  USING (true);

-- categories policies
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- processed_content policies
CREATE POLICY "Authenticated users can view processed_content"
  ON processed_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert processed_content"
  ON processed_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update processed_content"
  ON processed_content FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete processed_content"
  ON processed_content FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- SEED DATA (Optional)
-- Insert some default categories to get started
-- ============================================================================
INSERT INTO categories (name, slug, description, color, icon, display_order) VALUES
  ('NHL Records', 'nhl-records', 'Historic NHL records and achievements', '#ef4444', '🏆', 1),
  ('Seasonal', 'seasonal', 'Holiday and seasonal hockey content', '#f59e0b', '🎄', 2),
  ('Player Stats', 'player-stats', 'Individual player statistics and milestones', '#3b82f6', '📊', 3),
  ('Team History', 'team-history', 'Team histories and memorable moments', '#8b5cf6', '🏒', 4),
  ('Geography', 'geography', 'Hockey arenas, cities, and regional content', '#10b981', '🌍', 5),
  ('Lore & Stories', 'lore-stories', 'Hockey legends and memorable stories', '#ec4899', '📖', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- ============================================================================
-- List all tables
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('sourced_text', 'categories', 'processed_content');

-- Count rows in each table
-- SELECT 'sourced_text' AS table_name, COUNT(*) AS row_count FROM sourced_text
-- UNION ALL SELECT 'categories', COUNT(*) FROM categories
-- UNION ALL SELECT 'processed_content', COUNT(*) FROM processed_content;


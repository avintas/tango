-- ============================================================================
-- TANGO CMS - Create Content Source Table
-- ============================================================================
-- Creates the new content_source table for hockey content sourcing
-- Clean, simple, atomic design
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Create content_source table
-- ============================================================================
CREATE TABLE content_source (
  id BIGSERIAL PRIMARY KEY,
  original_text TEXT NOT NULL,
  processed_content TEXT,
  word_count INTEGER,
  char_count INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ============================================================================
-- Create indexes for performance
-- ============================================================================
CREATE INDEX idx_content_source_created_at ON content_source(created_at DESC);
CREATE INDEX idx_content_source_created_by ON content_source(created_by);
CREATE INDEX idx_content_source_published_at ON content_source(published_at DESC);

-- ============================================================================
-- Add table and column comments
-- ============================================================================
COMMENT ON TABLE content_source IS 'Simple, atomic table for storing raw hockey content';
COMMENT ON COLUMN content_source.original_text IS 'Raw source content as entered';
COMMENT ON COLUMN content_source.processed_content IS 'Text after cleanup processing (whitespace, quotes, etc.)';
COMMENT ON COLUMN content_source.word_count IS 'Word count of the content';
COMMENT ON COLUMN content_source.char_count IS 'Character count of the content';
COMMENT ON COLUMN content_source.published_at IS 'When the content was published (NULL = not published)';

-- ============================================================================
-- Create trigger function for auto-updating timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to content_source
CREATE TRIGGER update_content_source_updated_at
  BEFORE UPDATE ON content_source
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Set up Row Level Security (RLS)
-- ============================================================================
ALTER TABLE content_source ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view content_source"
  ON content_source FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert content_source"
  ON content_source FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content_source"
  ON content_source FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete content_source"
  ON content_source FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Verification
-- ============================================================================
-- Check table was created
SELECT 'content_source table created successfully' as status;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'content_source';

-- ============================================================================
-- READY TO USE
-- ============================================================================
-- Your content_source table is now ready for:
-- - Content sourcing workflow
-- - Text processing and cleanup
-- - Integration with AI generation endpoints
-- ============================================================================

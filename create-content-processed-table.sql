-- Create content_processed table for AI-generated content
-- This table stores all processed content (trivia, stats, motivational, quotes, stories, lore)
-- Each record contains a full markdown file ready to be displayed on onlyhockey.com

CREATE TABLE content_processed (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core Content
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL,        -- 'trivia', 'stats', 'motivational', 'quotes', 'stories', 'lore'
  markdown_content TEXT NOT NULL,           -- The full formatted markdown file
  
  -- Publishing
  status VARCHAR(20) DEFAULT 'draft',       -- 'draft', 'published'
  published_at TIMESTAMPTZ,
  
  -- Standard fields
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_content_processed_type ON content_processed(content_type);
CREATE INDEX idx_content_processed_status ON content_processed(status);
CREATE INDEX idx_content_processed_created_at ON content_processed(created_at DESC);
CREATE INDEX idx_content_processed_type_status ON content_processed(content_type, status);

-- Enable Row Level Security
ALTER TABLE content_processed ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published content (for onlyhockey.com)
CREATE POLICY "Published content is publicly readable"
  ON content_processed
  FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can view all content (for CMS)
CREATE POLICY "Authenticated users can view all content"
  ON content_processed
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert content
CREATE POLICY "Authenticated users can insert content"
  ON content_processed
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update content
CREATE POLICY "Authenticated users can update content"
  ON content_processed
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete content
CREATE POLICY "Authenticated users can delete content"
  ON content_processed
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_content_processed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_processed_updated_at
  BEFORE UPDATE ON content_processed
  FOR EACH ROW
  EXECUTE FUNCTION update_content_processed_updated_at();

-- Add comments for documentation
COMMENT ON TABLE content_processed IS 'Stores AI-generated content in markdown format for display on onlyhockey.com';
COMMENT ON COLUMN content_processed.title IS 'The title/headline of the content piece';
COMMENT ON COLUMN content_processed.content_type IS 'Type of content: trivia, stats, motivational, quotes, stories, lore';
COMMENT ON COLUMN content_processed.markdown_content IS 'Full formatted markdown file as text';
COMMENT ON COLUMN content_processed.status IS 'Publication status: draft or published';
COMMENT ON COLUMN content_processed.published_at IS 'Timestamp when content was published';


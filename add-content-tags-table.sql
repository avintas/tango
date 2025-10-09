-- ============================================================================
-- Add content_tags table for dynamic tag management
-- ============================================================================
-- This table will store all available content tags that can be selected
-- when adding source content. Replaces hardcoded tag system.
-- ============================================================================

CREATE TABLE content_tags (
  id BIGSERIAL PRIMARY KEY,
  value TEXT NOT NULL UNIQUE, -- Database value like 'trivia_source'
  label TEXT NOT NULL,        -- Display label like 'Trivia'
  color TEXT DEFAULT '#6366f1', -- Hex color for UI
  icon TEXT,                  -- Emoji or icon identifier
  description TEXT,           -- Optional description
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0, -- How many times this tag has been used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT value_format CHECK (value ~ '^[a-z_]+_source$'),
  CONSTRAINT color_format CHECK (color ~ '^#[0-9a-fA-F]{6}$')
);

-- Indexes
CREATE INDEX idx_content_tags_active ON content_tags(is_active) WHERE is_active = true;
CREATE INDEX idx_content_tags_display_order ON content_tags(display_order);
CREATE INDEX idx_content_tags_value ON content_tags(value);

-- Comments
COMMENT ON TABLE content_tags IS 'Dynamic content tags for source content classification';
COMMENT ON COLUMN content_tags.value IS 'Database identifier (e.g., trivia_source)';
COMMENT ON COLUMN content_tags.label IS 'Display name (e.g., Trivia)';
COMMENT ON COLUMN content_tags.usage_count IS 'Number of times this tag has been used';

-- Trigger for updated_at
CREATE TRIGGER update_content_tags_updated_at
  BEFORE UPDATE ON content_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view content_tags"
  ON content_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert content_tags"
  ON content_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content_tags"
  ON content_tags FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete content_tags"
  ON content_tags FOR DELETE
  TO authenticated
  USING (true);

-- Seed with existing tags
INSERT INTO content_tags (value, label, color, icon, description, display_order) VALUES
  ('trivia_source', 'Trivia', '#3b82f6', '📝', 'Trivia questions and facts', 1),
  ('quote_source', 'Quotes', '#f59e0b', '💬', 'Famous quotes and sayings', 2),
  ('story_source', 'Stories', '#10b981', '📖', 'Narrative content and stories', 3),
  ('news_source', 'News', '#ef4444', '📰', 'News articles and updates', 4),
  ('stats_source', 'Stats', '#8b5cf6', '📊', 'Statistics and data', 5),
  ('lore_source', 'Lore', '#ec4899', '🏛️', 'Hockey lore and legends', 6),
  ('hugs_source', 'H.U.G.s', '#f97316', '🤗', 'Heartwarming and uplifting stories', 7),
  ('geo_source', 'Geo', '#06b6d4', '🌍', 'Geographic and location-based content', 8)
ON CONFLICT (value) DO NOTHING;

-- Update sourced_text table to reference content_tags
-- First, let's add a foreign key constraint (optional, for referential integrity)
-- ALTER TABLE sourced_text 
-- ADD CONSTRAINT fk_sourced_text_content_type 
-- FOREIGN KEY (content_type) REFERENCES content_tags(value);

-- Note: We're not adding the FK constraint yet because existing data might not match
-- We'll handle this migration more carefully in the application layer

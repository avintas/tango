-- Simplified Tango CMS Database Setup
-- Hybrid approach: Keep essential tables, drop complex ones

-- Drop complex tables we don't need right now
DROP TABLE IF EXISTS cms_activity_log CASCADE;
DROP TABLE IF EXISTS cms_groups CASCADE;
DROP TABLE IF EXISTS cms_users CASCADE;
DROP TABLE IF EXISTS content_relationships CASCADE;

-- Keep and enhance essential tables

-- Content Categories Table
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Items Table (simplified)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  url TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow all authenticated users to read/write
-- (You can tighten these later when you add user authentication)

-- Content Categories Policies
CREATE POLICY "Allow all authenticated users to manage categories" ON content_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Content Items Policies  
CREATE POLICY "Allow all authenticated users to manage content" ON content_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Media Library Policies
CREATE POLICY "Allow all authenticated users to manage media" ON media_library
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default categories for hockey content
INSERT INTO content_categories (name, slug, description) VALUES
('Hockey News', 'hockey-news', 'Latest hockey news and updates'),
('Player Profiles', 'player-profiles', 'Profiles of hockey players and legends'),
('Game Analysis', 'game-analysis', 'In-depth game analysis and breakdowns'),
('Community Stories', 'community-stories', 'Community stories and features'),
('Tips & Training', 'tips-training', 'Hockey tips and training advice'),
('Trivia & Fun', 'trivia-fun', 'Hockey trivia questions and fun facts'),
('Quotes & Motivation', 'quotes-motivation', 'Inspirational quotes from players and coaches')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_category_id ON content_items(category_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_published_at ON content_items(published_at);
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_content_categories_updated_at 
    BEFORE UPDATE ON content_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON content_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at 
    BEFORE UPDATE ON media_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slugs for content items
CREATE OR REPLACE FUNCTION auto_generate_content_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_content_slug_trigger
    BEFORE INSERT ON content_items
    FOR EACH ROW EXECUTE FUNCTION auto_generate_content_slug();

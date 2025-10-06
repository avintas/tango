-- Complete Database Cleanup and Fresh Start
-- This script removes ALL existing tables and creates a clean, modern system

-- ========================================
-- STEP 1: COMPLETE CLEANUP OF OLD SYSTEM
-- ========================================

-- Disable RLS temporarily to avoid policy conflicts during drops
SET session_replication_role = replica;

-- Drop all existing triggers first
DROP TRIGGER IF EXISTS audit_cms_users ON cms_users CASCADE;
DROP TRIGGER IF EXISTS audit_content_items ON content_items CASCADE;
DROP TRIGGER IF EXISTS audit_media_library ON media_library CASCADE;
DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories CASCADE;
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items CASCADE;
DROP TRIGGER IF EXISTS update_media_library_updated_at ON media_library CASCADE;
DROP TRIGGER IF EXISTS auto_generate_content_slug_trigger ON content_items CASCADE;
DROP TRIGGER IF EXISTS update_source_content_updated_at ON source_content CASCADE;
DROP TRIGGER IF EXISTS auto_calculate_content_metrics ON source_content CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS log_activity() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_editor() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS auto_generate_content_slug() CASCADE;
DROP FUNCTION IF EXISTS update_source_processing_status(UUID, VARCHAR, TEXT) CASCADE;
DROP FUNCTION IF EXISTS add_processing_step(UUID, VARCHAR, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS complete_processing_step(UUID, JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_content_metrics(UUID) CASCADE;
DROP FUNCTION IF EXISTS trigger_calculate_metrics() CASCADE;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Admins can view all users" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Super admins can create users" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Super admins can update user roles" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Admins can view groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Super admins can create groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Super admins can update groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Super admins can delete groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Admins can create categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Admins can update categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Super admins can delete categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Users can view published content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Authors can view own content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Editors can create content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Authors can update own content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Admins can delete content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Users can view content relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Editors can create relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Editors can update relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Admins can delete relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Users can view media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Editors can upload media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Admins can update media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Super admins can delete media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Admins can view activity logs" ON cms_activity_log CASCADE;
DROP POLICY IF EXISTS "System can insert activity logs" ON cms_activity_log CASCADE;
DROP POLICY IF EXISTS "Super admins can delete activity logs" ON cms_activity_log CASCADE;
DROP POLICY IF EXISTS "Allow all authenticated users to manage categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Allow all authenticated users to manage content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Allow all authenticated users to manage media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Users can view own source content" ON source_content CASCADE;
DROP POLICY IF EXISTS "Users can create source content" ON source_content CASCADE;
DROP POLICY IF EXISTS "Users can update own source content" ON source_content CASCADE;
DROP POLICY IF EXISTS "Admins can view all source content" ON source_content CASCADE;
DROP POLICY IF EXISTS "Users can view own processing steps" ON processing_steps CASCADE;
DROP POLICY IF EXISTS "System can manage processing steps" ON processing_steps CASCADE;
DROP POLICY IF EXISTS "Users can view own batches" ON processing_batches CASCADE;
DROP POLICY IF EXISTS "Users can create batches" ON processing_batches CASCADE;
DROP POLICY IF EXISTS "Users can update own batches" ON processing_batches CASCADE;
DROP POLICY IF EXISTS "Users can view own quality metrics" ON content_quality_metrics CASCADE;

-- Drop all existing tables (in reverse dependency order)
DROP TABLE IF EXISTS content_quality_metrics CASCADE;
DROP TABLE IF EXISTS batch_sources CASCADE;
DROP TABLE IF EXISTS processing_steps CASCADE;
DROP TABLE IF EXISTS processing_batches CASCADE;
DROP TABLE IF EXISTS source_content CASCADE;
DROP TABLE IF EXISTS cms_activity_log CASCADE;
DROP TABLE IF EXISTS content_relationships CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS cms_groups CASCADE;
DROP TABLE IF EXISTS cms_users CASCADE;

-- Drop all existing indexes
DROP INDEX IF EXISTS idx_content_items_category_id CASCADE;
DROP INDEX IF EXISTS idx_content_items_status CASCADE;
DROP INDEX IF EXISTS idx_content_items_published_at CASCADE;
DROP INDEX IF EXISTS idx_content_items_slug CASCADE;
DROP INDEX IF EXISTS idx_content_categories_slug CASCADE;
DROP INDEX IF EXISTS idx_source_content_status CASCADE;
DROP INDEX IF EXISTS idx_source_content_type CASCADE;
DROP INDEX IF EXISTS idx_source_content_created_at CASCADE;
DROP INDEX IF EXISTS idx_source_content_created_by CASCADE;
DROP INDEX IF EXISTS idx_source_content_published CASCADE;
DROP INDEX IF EXISTS idx_processing_steps_source_id CASCADE;
DROP INDEX IF EXISTS idx_processing_steps_status CASCADE;
DROP INDEX IF EXISTS idx_processing_steps_order CASCADE;
DROP INDEX IF EXISTS idx_processing_batches_status CASCADE;
DROP INDEX IF EXISTS idx_processing_batches_created_by CASCADE;
DROP INDEX IF EXISTS idx_quality_metrics_source_id CASCADE;
DROP INDEX IF EXISTS idx_quality_metrics_name CASCADE;

-- Re-enable normal replication role
SET session_replication_role = DEFAULT;

-- ========================================
-- STEP 2: MODERN SOURCE CONTENT SYSTEM
-- ========================================

-- Core source content table - clean and focused
CREATE TABLE source_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content Storage
  original_text TEXT NOT NULL,
  processed_text TEXT,
  
  -- Metadata
  source_name VARCHAR(255), -- "Hockey News Article", "Player Interview", etc.
  source_url VARCHAR(500), -- Original URL if applicable
  content_type VARCHAR(50) DEFAULT 'general', -- 'news', 'interview', 'stats', 'history', etc.
  
  -- Processing Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processing_notes TEXT,
  
  -- Generated Content
  generated_trivia JSONB, -- Array of trivia questions
  generated_quotes JSONB, -- Array of quotes
  generated_stories JSONB, -- Array of stories
  generated_facts JSONB, -- Array of factoids
  
  -- Analytics
  word_count INTEGER,
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Simple processing log table
CREATE TABLE processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content_id UUID REFERENCES source_content(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  error_message TEXT,
  result_data JSONB
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX idx_source_content_status ON source_content(status);
CREATE INDEX idx_source_content_type ON source_content(content_type);
CREATE INDEX idx_source_content_created_at ON source_content(created_at);
CREATE INDEX idx_processing_log_source_id ON processing_log(source_content_id);
CREATE INDEX idx_processing_log_status ON processing_log(status);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE source_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_log ENABLE ROW LEVEL SECURITY;

-- Simple policies - allow all authenticated users to manage content
CREATE POLICY "Authenticated users can manage source content" ON source_content
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage processing logs" ON processing_log
    FOR ALL USING (auth.role() = 'authenticated');

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to update processing status
CREATE OR REPLACE FUNCTION update_processing_status(
    source_id UUID,
    new_status VARCHAR(20),
    notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE source_content 
    SET 
        status = new_status,
        processing_notes = COALESCE(notes, processing_notes),
        updated_at = NOW(),
        processed_at = CASE 
            WHEN new_status = 'completed' THEN NOW()
            ELSE processed_at
        END
    WHERE id = source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log processing step
CREATE OR REPLACE FUNCTION log_processing_step(
    source_id UUID,
    step_name VARCHAR(100),
    result_data JSONB DEFAULT NULL,
    error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    processing_time INTEGER;
BEGIN
    INSERT INTO processing_log (
        source_content_id,
        step_name,
        status,
        result_data,
        error_message
    ) VALUES (
        source_id,
        step_name,
        CASE WHEN error_message IS NOT NULL THEN 'failed' ELSE 'completed' END,
        result_data,
        error_message
    ) RETURNING id INTO log_id;
    
    -- Update processing time
    UPDATE processing_log 
    SET 
        completed_at = NOW(),
        processing_time_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
    WHERE id = log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate word count
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF text_content IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN array_length(string_to_array(trim(text_content), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_source_content_updated_at 
    BEFORE UPDATE ON source_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate word count when text is updated
CREATE OR REPLACE FUNCTION auto_calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.processed_text IS NOT NULL AND NEW.processed_text != OLD.processed_text THEN
        NEW.word_count = calculate_word_count(NEW.processed_text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_word_count_trigger
    BEFORE UPDATE ON source_content
    FOR EACH ROW EXECUTE FUNCTION auto_calculate_word_count();

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Insert sample source content
INSERT INTO source_content (
    original_text,
    source_name,
    content_type,
    status
) VALUES (
    'Wayne Gretzky is widely considered the greatest hockey player of all time. He holds numerous NHL records including most goals, assists, and points in a career. Gretzky played for the Edmonton Oilers, Los Angeles Kings, St. Louis Blues, and New York Rangers during his 20-year NHL career.',
    'Hockey Legends Database',
    'history',
    'pending'
);

-- ========================================
-- VERIFICATION
-- ========================================

-- Show all tables to confirm clean state
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- Show completion message
SELECT 'Database cleaned and modern source content system created!' as status;

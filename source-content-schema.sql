-- Enhanced Source Content Management Schema
-- This extends the existing CMS with comprehensive source content tracking

-- ========================================
-- SOURCE CONTENT MANAGEMENT TABLES
-- ========================================

-- Main source content table
CREATE TABLE IF NOT EXISTS source_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Original Content Storage
  original_content TEXT NOT NULL,
  original_source VARCHAR(500), -- URL, file name, or source description
  original_format VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'markdown', 'pdf', 'url'
  original_metadata JSONB, -- Store additional metadata like file size, encoding, etc.
  
  -- Processing Pipeline
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'completed', 'failed', 'archived', 'review')
  ),
  processing_type VARCHAR(50), -- 'text_cleanup', 'ai_generation', 'format_conversion', 'batch_processing'
  processing_config JSONB, -- Store processing parameters and settings
  
  -- Processed Content
  processed_content TEXT,
  processed_format VARCHAR(50),
  processing_notes TEXT,
  processing_errors TEXT, -- Store any processing errors
  
  -- Content Analysis Results
  word_count INTEGER,
  char_count INTEGER,
  content_type VARCHAR(50), -- 'trivia_source', 'story_source', 'quote_source', 'news_source', etc.
  difficulty_level VARCHAR(20), -- 'easy', 'medium', 'hard'
  topics JSONB, -- Array of extracted topics/tags
  sentiment_score DECIMAL(3,2), -- -1.0 to 1.0 sentiment analysis
  readability_score DECIMAL(5,2), -- Flesch-Kincaid or similar readability score
  
  -- AI Generation Results
  generated_items JSONB, -- Store the generated content items (trivia, quotes, etc.)
  generation_config JSONB, -- Store generation parameters used
  generation_metadata JSONB, -- Store AI model info, tokens used, etc.
  
  -- Content Relationships
  parent_source_id UUID REFERENCES source_content(id), -- For content derived from other sources
  related_sources JSONB, -- Array of related source IDs
  
  -- Publishing Information
  published_to_cms BOOLEAN DEFAULT FALSE,
  cms_content_ids JSONB, -- Array of CMS content IDs this source generated
  target_categories JSONB, -- Categories this content should be published to
  
  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

-- Content processing steps tracking
CREATE TABLE IF NOT EXISTS processing_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content_id UUID REFERENCES source_content(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content generation batches (for processing multiple sources together)
CREATE TABLE IF NOT EXISTS processing_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR(255),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  batch_config JSONB, -- Configuration for the entire batch
  total_sources INTEGER DEFAULT 0,
  processed_sources INTEGER DEFAULT 0,
  failed_sources INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Link sources to batches
CREATE TABLE IF NOT EXISTS batch_sources (
  batch_id UUID REFERENCES processing_batches(id) ON DELETE CASCADE,
  source_content_id UUID REFERENCES source_content(id) ON DELETE CASCADE,
  PRIMARY KEY (batch_id, source_content_id)
);

-- Content quality metrics
CREATE TABLE IF NOT EXISTS content_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_content_id UUID REFERENCES source_content(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4),
  metric_unit VARCHAR(50),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculation_method VARCHAR(100)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Source content indexes
CREATE INDEX IF NOT EXISTS idx_source_content_status ON source_content(processing_status);
CREATE INDEX IF NOT EXISTS idx_source_content_type ON source_content(content_type);
CREATE INDEX IF NOT EXISTS idx_source_content_created_at ON source_content(created_at);
CREATE INDEX IF NOT EXISTS idx_source_content_created_by ON source_content(created_by);
CREATE INDEX IF NOT EXISTS idx_source_content_published ON source_content(published_to_cms);

-- Processing steps indexes
CREATE INDEX IF NOT EXISTS idx_processing_steps_source_id ON processing_steps(source_content_id);
CREATE INDEX IF NOT EXISTS idx_processing_steps_status ON processing_steps(status);
CREATE INDEX IF NOT EXISTS idx_processing_steps_order ON processing_steps(source_content_id, step_order);

-- Batch processing indexes
CREATE INDEX IF NOT EXISTS idx_processing_batches_status ON processing_batches(status);
CREATE INDEX IF NOT EXISTS idx_processing_batches_created_by ON processing_batches(created_by);

-- Quality metrics indexes
CREATE INDEX IF NOT EXISTS idx_quality_metrics_source_id ON content_quality_metrics(source_content_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_name ON content_quality_metrics(metric_name);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE source_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Source content policies
CREATE POLICY "Users can view own source content" ON source_content
    FOR SELECT USING (created_by::text = auth.uid()::text);

CREATE POLICY "Users can create source content" ON source_content
    FOR INSERT WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Users can update own source content" ON source_content
    FOR UPDATE USING (created_by::text = auth.uid()::text);

CREATE POLICY "Admins can view all source content" ON source_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Processing steps policies
CREATE POLICY "Users can view own processing steps" ON processing_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM source_content 
            WHERE id = processing_steps.source_content_id 
            AND created_by::text = auth.uid()::text
        )
    );

CREATE POLICY "System can manage processing steps" ON processing_steps
    FOR ALL USING (true); -- Allow system processes to manage steps

-- Batch processing policies
CREATE POLICY "Users can view own batches" ON processing_batches
    FOR SELECT USING (created_by::text = auth.uid()::text);

CREATE POLICY "Users can create batches" ON processing_batches
    FOR INSERT WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Users can update own batches" ON processing_batches
    FOR UPDATE USING (created_by::text = auth.uid()::text);

-- Quality metrics policies
CREATE POLICY "Users can view own quality metrics" ON content_quality_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM source_content 
            WHERE id = content_quality_metrics.source_content_id 
            AND created_by::text = auth.uid()::text
        )
    );

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to update processing status
CREATE OR REPLACE FUNCTION update_source_processing_status(
    source_id UUID,
    new_status VARCHAR(20),
    processing_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE source_content 
    SET 
        processing_status = new_status,
        processing_notes = COALESCE(processing_notes, source_content.processing_notes),
        updated_at = NOW(),
        processed_at = CASE 
            WHEN new_status = 'completed' THEN NOW()
            ELSE processed_at
        END
    WHERE id = source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add processing step
CREATE OR REPLACE FUNCTION add_processing_step(
    source_id UUID,
    step_name VARCHAR(100),
    step_order INTEGER,
    input_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    step_id UUID;
BEGIN
    INSERT INTO processing_steps (
        source_content_id,
        step_name,
        step_order,
        input_data
    ) VALUES (
        source_id,
        step_name,
        step_order,
        input_data
    ) RETURNING id INTO step_id;
    
    RETURN step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete processing step
CREATE OR REPLACE FUNCTION complete_processing_step(
    step_id UUID,
    output_data JSONB DEFAULT NULL,
    error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    processing_time INTEGER;
    step_record RECORD;
BEGIN
    SELECT started_at INTO step_record FROM processing_steps WHERE id = step_id;
    
    processing_time := CASE 
        WHEN step_record.started_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (NOW() - step_record.started_at)) * 1000
        ELSE NULL
    END;
    
    UPDATE processing_steps 
    SET 
        status = CASE WHEN error_message IS NOT NULL THEN 'failed' ELSE 'completed' END,
        completed_at = NOW(),
        processing_time_ms = processing_time,
        output_data = output_data,
        error_message = error_message
    WHERE id = step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate content metrics
CREATE OR REPLACE FUNCTION calculate_content_metrics(source_id UUID)
RETURNS VOID AS $$
DECLARE
    content_text TEXT;
    word_count INTEGER;
    char_count INTEGER;
BEGIN
    SELECT processed_content INTO content_text FROM source_content WHERE id = source_id;
    
    IF content_text IS NOT NULL THEN
        -- Calculate word count
        word_count := array_length(string_to_array(trim(content_text), ' '), 1);
        
        -- Calculate character count
        char_count := length(content_text);
        
        -- Update source content with metrics
        UPDATE source_content 
        SET 
            word_count = word_count,
            char_count = char_count,
            updated_at = NOW()
        WHERE id = source_id;
        
        -- Store individual metrics
        INSERT INTO content_quality_metrics (source_content_id, metric_name, metric_value, metric_unit)
        VALUES 
            (source_id, 'word_count', word_count, 'words'),
            (source_id, 'character_count', char_count, 'characters');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_source_content_updated_at 
    BEFORE UPDATE ON source_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-calculate metrics when content is processed
CREATE OR REPLACE FUNCTION trigger_calculate_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
        PERFORM calculate_content_metrics(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_content_metrics
    AFTER UPDATE ON source_content
    FOR EACH ROW EXECUTE FUNCTION trigger_calculate_metrics();

-- ========================================
-- SAMPLE DATA AND TESTING
-- ========================================

-- Insert sample source content for testing
INSERT INTO source_content (
    original_content,
    original_source,
    content_type,
    processing_status,
    created_by
) VALUES (
    'Wayne Gretzky is widely considered the greatest hockey player of all time. He holds numerous NHL records including most goals, assists, and points in a career. Gretzky played for the Edmonton Oilers, Los Angeles Kings, St. Louis Blues, and New York Rangers during his 20-year NHL career.',
    'Hockey History Database',
    'trivia_source',
    'pending',
    auth.uid()
) ON CONFLICT DO NOTHING;

-- ========================================
-- USEFUL QUERIES
-- ========================================

-- View all source content with processing status
-- SELECT 
--     id,
--     LEFT(original_content, 100) as content_preview,
--     content_type,
--     processing_status,
--     word_count,
--     char_count,
--     created_at
-- FROM source_content 
-- ORDER BY created_at DESC;

-- View processing steps for a source
-- SELECT 
--     ps.step_name,
--     ps.status,
--     ps.processing_time_ms,
--     ps.completed_at
-- FROM processing_steps ps
-- WHERE ps.source_content_id = 'your-source-id'
-- ORDER BY ps.step_order;

-- View content quality metrics
-- SELECT 
--     cqm.metric_name,
--     cqm.metric_value,
--     cqm.metric_unit
-- FROM content_quality_metrics cqm
-- WHERE cqm.source_content_id = 'your-source-id';

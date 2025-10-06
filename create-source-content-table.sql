-- Create source_content table
-- Simple, focused table for storing original and processed content

CREATE TABLE source_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content Storage
  original_text TEXT NOT NULL,
  processed_text TEXT,
  
  -- Analytics
  word_count INTEGER,
  processing_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE source_content ENABLE ROW LEVEL SECURITY;

-- Simple policy - allow all authenticated users to manage content
CREATE POLICY "Authenticated users can manage source content" ON source_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_source_content_created_at ON source_content(created_at);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_source_content_updated_at 
    BEFORE UPDATE ON source_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO source_content (
    original_text
) VALUES (
    'Wayne Gretzky is widely considered the greatest hockey player of all time. He holds numerous NHL records including most goals, assists, and points in a career.'
);

-- Verify table was created
SELECT 'source_content table created successfully!' as status;

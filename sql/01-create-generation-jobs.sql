-- Table for managing bulk content generation jobs
CREATE TABLE
  public.generation_jobs (
    id BIGSERIAL PRIMARY KEY,
    source_content_id BIGINT NOT NULL REFERENCES public.ingested (id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
    attempts INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_job_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update on the generation_jobs table
CREATE TRIGGER on_job_update
BEFORE UPDATE ON public.generation_jobs
FOR EACH ROW
EXECUTE PROCEDURE public.handle_job_update();

-- Add indexes for performance
CREATE INDEX idx_generation_jobs_status ON public.generation_jobs (status);
CREATE INDEX idx_generation_jobs_source_content_id ON public.generation_jobs (source_content_id);

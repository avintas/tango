-- Add a status column to the ingested table to track processing state
ALTER TABLE public.ingested
ADD COLUMN status TEXT NOT NULL DEFAULT 'ready'; -- e.g., ready, processing, completed, failed

-- Add an index for faster queries on the new status column
CREATE INDEX idx_ingested_status ON public.ingested (status);

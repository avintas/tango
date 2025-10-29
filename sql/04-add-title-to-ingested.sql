-- Add a title column to the ingested table
ALTER TABLE public.ingested
ADD COLUMN title TEXT;

-- Add an index for the new title column
CREATE INDEX idx_ingested_title ON public.ingested (title);

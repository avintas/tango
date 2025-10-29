-- Set attribution to "Penalty Box Philosopher" for all wisdom entries
-- Run this after the initial migration to add default attribution

UPDATE public.wisdom
SET attribution = 'Penalty Box Philosopher'
WHERE attribution IS NULL OR attribution = '';

-- Show results
SELECT 
  COUNT(*) as total_updated,
  attribution
FROM public.wisdom
GROUP BY attribution;


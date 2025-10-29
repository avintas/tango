-- Populate hero_collections with sample data
-- This creates starter collections with complete content stored as JSONB
-- Note: This is just an example structure - use the CMS to generate real collections

INSERT INTO public.hero_collections (title, description, content_items, display_order) VALUES
('Sample Collection', 'Example collection showing data structure', '[
  {
    "id": 1,
    "content_text": "Hockey teaches us that every shift matters",
    "content_type": "motivational",
    "theme": "dedication",
    "attribution": null
  },
  {
    "id": 2,
    "content_text": "Did you know the first hockey puck was made of wood?",
    "content_type": "statistics",
    "theme": "history",
    "attribution": null
  },
  {
    "id": 3,
    "content_text": "Every player deserves encouragement on the ice",
    "content_type": "greeting",
    "theme": "support",
    "attribution": null
  },
  {
    "id": 4,
    "content_text": "Champions learn from every game they play",
    "content_type": "wisdom",
    "theme": "growth",
    "attribution": null
  },
  {
    "id": 5,
    "content_text": "Hard work beats talent when talent doesn''t work hard",
    "content_type": "motivational",
    "theme": "work-ethic",
    "attribution": null
  },
  {
    "id": 6,
    "content_text": "The Stanley Cup weighs 34.5 pounds",
    "content_type": "statistics",
    "theme": "trivia",
    "attribution": null
  },
  {
    "id": 7,
    "content_text": "Your hockey journey is unique and valuable",
    "content_type": "greeting",
    "theme": "encouragement",
    "attribution": null
  }
]'::jsonb, 1);

-- Verify collections
SELECT 
  id,
  title, 
  description,
  jsonb_array_length(content_items) as content_count,
  active,
  display_order
FROM public.hero_collections
ORDER BY display_order;

-- View the actual content
SELECT 
  title,
  jsonb_pretty(content_items) as content
FROM public.hero_collections
WHERE id = 1;


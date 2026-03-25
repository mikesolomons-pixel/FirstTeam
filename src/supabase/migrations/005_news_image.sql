-- Add image_url to news_items for link preview thumbnails
ALTER TABLE public.news_items ADD COLUMN IF NOT EXISTS image_url text;

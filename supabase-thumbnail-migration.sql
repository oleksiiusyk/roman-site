-- Add thumbnail_url column to work_images table
ALTER TABLE work_images ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Backfill: existing images use same URL for thumbnail
UPDATE work_images SET thumbnail_url = image_url WHERE thumbnail_url IS NULL;

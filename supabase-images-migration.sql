-- Create images table for multiple images per work
CREATE TABLE work_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id UUID REFERENCES works(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE work_images ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Work images are viewable by everyone" ON work_images
    FOR SELECT USING (true);

-- Policies for admin operations
CREATE POLICY "Anyone can insert work images" ON work_images
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update work images" ON work_images
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete work images" ON work_images
    FOR DELETE USING (true);

-- Create index for faster queries
CREATE INDEX idx_work_images_work_id ON work_images(work_id);
CREATE INDEX idx_work_images_primary ON work_images(work_id, is_primary);

-- Migrate existing images from works table to work_images table
INSERT INTO work_images (work_id, image_url, is_primary, display_order)
SELECT
    id as work_id,
    image_url,
    true as is_primary,
    0 as display_order
FROM works
WHERE image_url IS NOT NULL;

-- Add thumbnail images as secondary images
INSERT INTO work_images (work_id, image_url, is_primary, display_order)
SELECT
    id as work_id,
    thumbnail_url,
    false as is_primary,
    1 as display_order
FROM works
WHERE thumbnail_url IS NOT NULL AND thumbnail_url != image_url;
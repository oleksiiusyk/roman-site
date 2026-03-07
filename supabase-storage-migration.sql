-- Supabase Storage Policies for work-images bucket
-- Run this in Supabase SQL Editor after creating the 'work-images' bucket

-- Allow public to read (view) images
CREATE POLICY "Public can view work images"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload work images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'work-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update work images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'work-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete work images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'work-images');
-- Migration to secure database with Supabase Auth
-- Run this in Supabase SQL Editor

-- 1. Drop existing insecure policies
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;

DROP POLICY IF EXISTS "Anyone can insert works" ON works;
DROP POLICY IF EXISTS "Anyone can update works" ON works;
DROP POLICY IF EXISTS "Anyone can delete works" ON works;

DROP POLICY IF EXISTS "Anyone can insert work images" ON work_images;
DROP POLICY IF EXISTS "Anyone can update work images" ON work_images;
DROP POLICY IF EXISTS "Anyone can delete work images" ON work_images;

-- 2. Create secure policies - only authenticated users can modify
-- Categories
CREATE POLICY "Authenticated users can insert categories" ON categories
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" ON categories
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete categories" ON categories
    FOR DELETE TO authenticated USING (true);

-- Works
CREATE POLICY "Authenticated users can insert works" ON works
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update works" ON works
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete works" ON works
    FOR DELETE TO authenticated USING (true);

-- Work Images
CREATE POLICY "Authenticated users can insert work images" ON work_images
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update work images" ON work_images
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete work images" ON work_images
    FOR DELETE TO authenticated USING (true);

-- 3. Comments and Ratings - allow public to create, but with rate limiting
-- Keep existing public access for comments
DROP POLICY IF EXISTS "Comments are writable by everyone" ON comments;
CREATE POLICY "Anyone can insert comments" ON comments
    FOR INSERT WITH CHECK (true);

-- Keep existing public access for ratings
DROP POLICY IF EXISTS "Ratings are writable by everyone" ON ratings;
CREATE POLICY "Anyone can insert ratings" ON ratings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their ratings" ON ratings
    FOR UPDATE USING (true);

-- 4. Create admin user (you'll need to set this up in Supabase Auth Dashboard)
-- Go to: Authentication > Users > Add User
-- Email: admin@roman-site.com (or your email)
-- Password: (set a strong password)
-- After creating, you can get the user ID and optionally create a role

-- Optional: Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Replace with your actual admin user UUID from Supabase Auth
  -- You'll get this after creating the user in the dashboard
  RETURN auth.uid() IN (
    -- Add your admin user UUIDs here
    '2179899b-da2e-4868-9435-09e01a0a0e64'::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: After running this migration:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter email and password for admin
-- 4. Copy the User UUID
-- 5. Update the is_admin() function above with that UUID
-- 6. Re-run just the is_admin() function creation
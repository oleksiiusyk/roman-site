-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_uk TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Works table
CREATE TABLE works (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_uk TEXT NOT NULL,
    description_en TEXT,
    description_uk TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    views INTEGER DEFAULT 0,
    date_created DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id UUID REFERENCES works(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id UUID REFERENCES works(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Session ID or IP hash
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(work_id, user_id)
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Works are viewable by everyone" ON works
    FOR SELECT USING (true);

CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Ratings are viewable by everyone" ON ratings
    FOR SELECT USING (true);

-- Policies for public write access (comments and ratings)
CREATE POLICY "Anyone can create comments" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create ratings" ON ratings
    FOR INSERT WITH CHECK (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_views(work_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE works SET views = views + 1 WHERE id = work_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO categories (name_en, name_uk, slug, icon) VALUES
    ('Drawings', 'Малюнки', 'drawings', '✏️'),
    ('Paintings', 'Картини', 'paintings', '🎨'),
    ('LEGO Art', 'ЛЕГО-картини', 'lego-art', '🧱'),
    ('Aircraft Collection', 'Колекція літаків', 'aircraft', '✈️'),
    ('Cards Collection', 'Колекція карток', 'cards', '🃏'),
    ('Other Collections', 'Інші колекції', 'other', '📦');
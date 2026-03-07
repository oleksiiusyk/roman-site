# Roman's Creative World 🎨✈️🚀

A portfolio website for showcasing Roman's artwork, collections, and creative projects. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🌐 **Multi-language support** (English & Ukrainian)
- 🎨 **Gallery** with filtering and sorting
- ⭐ **Ratings and comments** system
- 👤 **Admin panel** for content management
- 📱 **Responsive design** for all devices
- 🎯 **Aviation/Space/F1 themed** design

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Supabase
- **Animations:** Framer Motion
- **i18n:** react-i18next
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/roman-site.git
cd roman-site
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in Supabase SQL editor
   - Enable storage for images (optional)

5. Start the development server:
```bash
npm run dev
```

## Admin Access

Admin authentication uses **Supabase Auth**:

1. Create an admin user in Supabase Dashboard:
   - Go to Authentication > Users > Add User
   - Enter email and strong password
   - Copy the User UUID

2. Update `supabase-auth-migration.sql` with the UUID:
   - Replace the UUID in the `is_admin()` function

3. Run the migration in Supabase SQL Editor

4. Access admin panel at `/admin` and login with email + password

## Deployment

### Prerequisites

Before deploying, ensure you've:
1. ✅ Created Supabase project and run all migrations:
   - `supabase-schema.sql` - Initial database schema
   - `supabase-images-migration.sql` - Multiple images support
   - `supabase-auth-migration.sql` - Secure authentication & RLS policies

2. ✅ Created admin user in Supabase Auth

3. ✅ Have your Supabase credentials ready:
   - Project URL
   - Anon key

### Deploy to Vercel (Recommended)

#### Option 1: Via Vercel Dashboard (Easiest)

1. **Push to GitHub** (if not already):
   ```bash
   # If you need to create a remote repository:
   # 1. Create a new repository on GitHub
   # 2. Add remote and push:
   git remote add origin https://github.com/yourusername/roman-site.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables** in Vercel:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Deploy!** - Vercel will automatically build and deploy

#### Option 2: Via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Follow prompts** to:
   - Link to existing project or create new
   - Configure build settings (auto-detected)
   - Add environment variables

### After Deployment

1. **Add Environment Variables** to Vercel:
   - Dashboard > Project > Settings > Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. **Redeploy** if you added env vars after first deployment

3. **Test the site**:
   - Check homepage loads
   - Test gallery filtering
   - Test admin login
   - Create a test work in admin panel

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── i18n/          # Internationalization
├── lib/           # Utilities and configurations
└── App.tsx        # Main application component
```

## Features to Add

- Polish language support
- User registration system
- Image upload functionality
- More collection categories
- Achievement system
- Share functionality

## License

This project is private and belongs to Roman.

---

Made with ❤️ for Roman's creative journey!
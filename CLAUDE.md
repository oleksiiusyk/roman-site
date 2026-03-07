# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for showcasing Roman's artwork, collections, and creative projects. It's a React + TypeScript + Vite application with Supabase backend, featuring multi-language support (English/Ukrainian), a gallery with ratings/comments, and an admin panel for content management. The design theme is aviation/space/F1 inspired.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (uses Vite)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

### Environment Setup
Before running the app, create a `.env` file from `.env.example` and add Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
Run the SQL from `supabase-schema.sql` in the Supabase SQL editor to create the database schema with tables: categories, works, comments, ratings, and admin_users.

## Architecture

### Tech Stack
- **Frontend:** React 19.2, TypeScript 5.9
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom aviation/space theme
- **Animations:** Framer Motion
- **i18n:** react-i18next (English/Ukrainian)
- **Backend:** Supabase (PostgreSQL + Row Level Security)
- **Icons:** Lucide React
- **Build:** Vite
- **Deployment:** Vercel

### Key Application Flow

1. **Layout Structure:** All pages are wrapped in `Layout.tsx` which provides:
   - Animated background elements (Plane, Rocket, Trophy icons)
   - Navigation bar with current page highlighting
   - Language switcher (EN/UK toggle)
   - Footer

2. **Routing:** Defined in `App.tsx`:
   - `/` - Home page
   - `/gallery` - Gallery with filtering/sorting
   - `/about` - About page
   - `/work/:id` - Individual work detail page
   - `/admin/*` - Admin panel (lazy loaded)

3. **Admin Authentication:** Simple password-based auth (password: `roman2024`) stored in localStorage. Not production-secure but sufficient for this use case.

4. **Internationalization:**
   - Configuration in `src/i18n/config.ts`
   - Translation files: `src/i18n/locales/en.json` and `src/i18n/locales/uk.json`
   - Database fields are bilingual (e.g., `title_en`, `title_uk`)
   - Use `i18n.language` to determine which field to display

### Supabase Integration

The `src/lib/supabase.ts` file:
- Exports the configured Supabase client
- Defines TypeScript types for all database entities (Category, Work, Comment, Rating)
- Uses environment variables for configuration

Database structure:
- **categories:** Artwork/collection categories with bilingual names and emoji icons
- **works:** Individual artworks/items with bilingual content, category relation, view counts
- **comments:** User comments on works
- **ratings:** 1-5 star ratings (unique per work/user_id combination)
- **admin_users:** Admin authentication (currently unused, using simple password check instead)

Row Level Security is enabled with policies for public read access and public write access for comments/ratings.

### Styling Approach

- Dark theme with gradient backgrounds (`from-black via-gray-900 to-red-950`)
- Red accent color (`#dc2626`, `#991b1b`) for aviation/racing theme
- Glass morphism effects (`backdrop-blur`, semi-transparent backgrounds)
- Responsive design using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`)
- Custom font class `.font-racing` for headers/branding (not defined in codebase, may need to add)

### State Management

No global state library is used. Component state is managed with:
- `useState` for local component state
- `useEffect` for data fetching
- Props for parent-child communication
- React Router's `useNavigate` and `useLocation` for routing state

## Important Patterns

### Data Fetching Pattern
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Bilingual Content Display
Always check `i18n.language` to determine which language field to show:
```typescript
const title = i18n.language === 'uk' ? work.title_uk : work.title_en;
```

### Toast Notifications
Use `react-hot-toast` for user feedback:
```typescript
import toast from 'react-hot-toast';
toast.success('Success message');
toast.error('Error message');
```

### Admin Operations
Admin panel CRUD operations follow this pattern:
1. Fetch data with Supabase select query (often with relations using `category:categories(*)`)
2. Modify data with insert/update/delete operations
3. Show toast notification
4. Refetch data to update UI

## Deployment

Deployed to Vercel with SPA routing configuration in `vercel.json` that redirects all routes to `index.html` for client-side routing to work correctly.

## Security

### Authentication
Admin authentication is now secured using **Supabase Auth**:
- Email + password authentication (replaces old simple password check)
- Session management handled by Supabase
- Auth state managed via React Context (`src/contexts/AuthContext.tsx`)
- Protected routes ensure only authenticated users access admin panel

### Database Security (Row Level Security)
All database tables use **RLS policies** to protect data:
- **Public read access**: Anyone can view works, categories, comments, ratings
- **Authenticated write access**: Only logged-in users can INSERT/UPDATE/DELETE works, categories, and images
- **Public write for engagement**: Comments and ratings allow public creation (for user engagement)
- Migration file: `supabase-auth-migration.sql`

### API Keys
- `VITE_SUPABASE_ANON_KEY` is safe to expose on frontend - it works with RLS policies
- Actual database password is never exposed to the client
- Supabase automatically handles secure connections

## Known Limitations

- No image upload functionality yet (uses external image URLs via Imgur/Cloudinary/Supabase Storage)
- `.font-racing` class is referenced but font may not be defined in CSS
- User ratings useдавй session ID/IP hash stored client-side (can be manipulated)
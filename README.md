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

Default admin password: `roman2024`

To access the admin panel, navigate to `/admin` and enter the password.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

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
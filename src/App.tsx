import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './i18n/config';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import WorkDetail from './pages/WorkDetail';

// Lazy load admin panel
const Admin = React.lazy(() => import('./pages/Admin'));

const ThemedToaster: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#fff' : '#1f2937',
          border: `1px solid ${isDark ? '#dc2626' : '#fca5a5'}`,
        },
        duration: 3000,
      }}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
    <Router>
      <AuthProvider>
        <ThemedToaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="work/:id" element={<WorkDetail />} />
          <Route
            path="admin/*"
            element={
              <React.Suspense fallback={
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
              }>
                <Admin />
              </React.Suspense>
            }
          />
        </Route>
      </Routes>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
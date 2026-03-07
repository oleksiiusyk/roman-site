import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './i18n/config';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import WorkDetail from './pages/WorkDetail';

// Lazy load admin panel
const Admin = React.lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #dc2626',
          },
          duration: 3000,
        }}
      />
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
  );
}

export default App;
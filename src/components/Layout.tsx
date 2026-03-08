import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Image, User, Settings, Plane, Rocket, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/gallery', icon: Image, label: t('nav.gallery') },
    { path: '/about', icon: User, label: t('nav.about') },
    ...(user ? [{ path: '/admin', icon: Settings, label: t('nav.admin') }] : []),
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex flex-col relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-red-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Animated Icons */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 opacity-5"
        >
          <Plane size={120} className="text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 opacity-5"
        >
          <Rocket size={140} className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]" />
        </motion.div>
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-3"
        >
          <Trophy size={220} className="text-red-400 drop-shadow-[0_0_25px_rgba(220,38,38,0.4)]" />
        </motion.div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(220, 38, 38, 0.3) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-red-900/30 shadow-lg shadow-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center space-x-3"
            >
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-lg flex items-center justify-center font-racing font-bold text-white text-xl shadow-lg shadow-red-900/50 group-hover:shadow-red-600/60 transition-shadow duration-300">
                  R
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-600 rounded-lg blur-md"
                />
              </div>
              <span className="font-racing text-white text-lg hidden sm:block tracking-wider bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                ROMAN
              </span>
            </motion.div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {navigation.map(({ path, icon: Icon, label }, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={path}
                    className={`
                      relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      flex items-center space-x-2 group overflow-hidden
                      ${location.pathname === path
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/50'
                        : 'text-gray-300 hover:text-white'
                      }
                    `}
                  >
                    {location.pathname !== path && (
                      <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    )}
                    <Icon size={18} className="relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <span className="hidden sm:inline relative z-10">{label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  i18n.language === 'en'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('uk')}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  i18n.language === 'uk'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                UK
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 ${
        location.pathname.startsWith('/admin') ? 'max-w-[1920px]' : 'max-w-7xl'
      }`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-red-900/50 bg-black/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-sm">
            © 2024 Roman's Creative World. {t('common.loading') !== 'Loading...' ? '' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
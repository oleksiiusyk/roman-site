import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Image, User, Settings, Plane, Rocket, Trophy, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen theme-bg flex flex-col relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `rgb(var(--color-orb-1) / var(--color-orb-opacity))` }}></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `rgb(var(--color-orb-1) / var(--color-orb-opacity))`, animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `rgb(var(--color-orb-1) / calc(var(--color-orb-opacity) / 2))`, animationDelay: '2s' }}></div>

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
          className="absolute top-20 left-10"
          style={{ opacity: `var(--color-bg-icon-opacity)` }}
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
          className="absolute bottom-20 right-10"
          style={{ opacity: `var(--color-bg-icon-opacity)` }}
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: `var(--color-bg-icon-opacity)` }}
        >
          <Trophy size={220} className="text-red-400 drop-shadow-[0_0_25px_rgba(220,38,38,0.4)]" />
        </motion.div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0" style={{
          opacity: `var(--color-grid-opacity)`,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(220, 38, 38, 0.3) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 theme-nav backdrop-blur-xl border-b theme-border shadow-lg shadow-red-900/10 transition-colors duration-300">
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
              <span className={`font-racing text-lg hidden sm:block tracking-wider bg-clip-text text-transparent ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white to-red-200'
                  : 'bg-gradient-to-r from-gray-900 to-red-700'
              }`}>
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
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
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

            {/* Theme Toggle + Language Switcher */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
              </button>

              {/* Language Switcher */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    i18n.language === 'en'
                      ? 'bg-red-600 text-white'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('uk')}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    i18n.language === 'uk'
                      ? 'bg-red-600 text-white'
                      : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  UK
                </button>
              </div>
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
      <footer className="relative z-10 mt-auto border-t theme-border theme-footer backdrop-blur-lg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center theme-text-muted text-sm">
            © 2024 Roman's Creative World. {t('common.loading') !== 'Loading...' ? '' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

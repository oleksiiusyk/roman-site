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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
          className="absolute top-20 left-10 opacity-10"
        >
          <Plane size={100} className="text-red-500" />
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
          className="absolute bottom-20 right-10 opacity-10"
        >
          <Rocket size={120} className="text-red-600" />
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5"
        >
          <Trophy size={200} className="text-red-400" />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-black/50 backdrop-blur-lg border-b border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center font-racing font-bold text-white text-xl">
                  R
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-600 rounded-lg opacity-30 blur-md"
                />
              </div>
              <span className="font-racing text-white text-lg hidden sm:block">
                ROMAN
              </span>
            </motion.div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              {navigation.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    flex items-center space-x-2 group
                    ${location.pathname === path
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-red-600/20 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
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
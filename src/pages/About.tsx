import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plane, Rocket, Trophy, Gamepad2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const About: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const interests = [
    { icon: Plane, label: t('about.aviation'), color: 'text-blue-400' },
    { icon: Rocket, label: t('about.space'), color: 'text-purple-400' },
    { icon: Trophy, label: t('about.f1'), color: 'text-red-400' },
    { icon: Gamepad2, label: t('about.football'), color: 'text-green-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className={`text-4xl font-racing font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('about.title')}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`backdrop-blur rounded-lg p-8 border transition-colors duration-300 ${
          isDark
            ? 'bg-gray-900/50 border-red-900/30'
            : 'bg-white/70 border-red-200/40'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar/Profile Picture */}
          <motion.div
            whileHover={{ rotate: 5 }}
            className="relative"
          >
            <div className="w-48 h-48 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span className="text-6xl font-racing font-bold text-white">R</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-600 rounded-full opacity-30 blur-xl"
            />
          </motion.div>

          {/* Bio */}
          <div className="flex-1 text-center md:text-left">
            <h2 className={`text-3xl font-space font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('about.hello')}
            </h2>
            <p className={`text-xl mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('about.age')}
            </p>
            <p className={`leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('about.description')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Interests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className={`text-2xl font-racing font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('about.interests')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {interests.map(({ icon: Icon, label, color }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`backdrop-blur rounded-lg p-6 border transition-all duration-300 text-center group ${
                isDark
                  ? 'bg-gray-900/50 border-red-900/30 hover:border-red-600/50'
                  : 'bg-white/70 border-red-200/40 hover:border-red-400/50'
              }`}
            >
              <Icon size={48} className={`${color} mx-auto mb-3 group-hover:rotate-12 transition-transform`} />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`rounded-lg p-6 border transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-red-600/20 to-red-800/20 border-red-600/30'
            : 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200/50'
        }`}
      >
        <h3 className={`text-xl font-racing font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Fun Facts
        </h3>
        <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            I can name over 50 different aircraft models!
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            My favorite F1 team changes every race weekend
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            I've built a LEGO spaceship with over 1000 pieces
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">•</span>
            I dream of becoming a pilot-artist-race driver-astronaut!
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default About;

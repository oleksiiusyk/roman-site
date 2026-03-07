import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plane, Rocket, Trophy, Gamepad2 } from 'lucide-react';

const About: React.FC = () => {
  const { t } = useTranslation();

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
        <h1 className="text-4xl font-racing font-bold text-white mb-8">
          {t('about.title')}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900/50 backdrop-blur rounded-lg p-8 border border-red-900/30"
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
            <h2 className="text-3xl font-space font-bold text-white mb-4">
              {t('about.hello')}
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              {t('about.age')}
            </p>
            <p className="text-gray-400 leading-relaxed">
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
        <h3 className="text-2xl font-racing font-bold text-white mb-6 text-center">
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
              className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-red-900/30 hover:border-red-600/50 transition-all duration-300 text-center group"
            >
              <Icon size={48} className={`${color} mx-auto mb-3 group-hover:rotate-12 transition-transform`} />
              <p className="text-white font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fun Facts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-lg p-6 border border-red-600/30"
      >
        <h3 className="text-xl font-racing font-bold text-white mb-4">
          Fun Facts
        </h3>
        <ul className="space-y-2 text-gray-300">
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
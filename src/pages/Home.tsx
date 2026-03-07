import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Star } from 'lucide-react';
import { supabase, type Work } from '../lib/supabase';
import WorkImageCarousel from '../components/WorkImageCarousel';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [latestWorks, setLatestWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestWorks();
  }, []);

  const fetchLatestWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setLatestWorks(data || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-5xl sm:text-7xl font-racing font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mb-4"
        >
          {t('home.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-300 font-space"
        >
          {t('home.subtitle')}
        </motion.p>

        {/* Animated Icons */}
        <div className="flex justify-center space-x-8 mt-8">
          {['✈️', '🚀', '🏎️', '⚽', '🎨'].map((emoji, index) => (
            <motion.div
              key={emoji}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.3, rotate: 15 }}
              className="text-4xl cursor-pointer"
            >
              {emoji}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Latest Works */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-racing font-bold text-white">
            {t('home.latest')}
          </h2>
          <Link
            to="/gallery"
            className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors group"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/work/${work.id}`}>
                  <div className="bg-gray-900/50 backdrop-blur rounded-lg overflow-hidden border border-red-900/30 hover:border-red-600/50 transition-all duration-300 group">
                    <div className="aspect-w-16 aspect-h-12 bg-gray-800 relative overflow-hidden">
                      <WorkImageCarousel workId={work.id} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-space font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                        {work.title_en}
                      </h3>
                      {work.category && (
                        <span className="inline-block px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full mb-2">
                          {work.category.icon} {work.category.name_en}
                        </span>
                      )}
                      <div className="flex items-center justify-between text-gray-400 text-sm">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{work.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star size={14} className="text-yellow-500" />
                          <span>4.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && latestWorks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>{t('common.noData')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
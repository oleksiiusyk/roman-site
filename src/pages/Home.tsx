import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Star, MessageCircle, Sparkles } from 'lucide-react';
import { supabase, type Work, type Category } from '../lib/supabase';
import WorkImageCarousel from '../components/WorkImageCarousel';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTheme } from '../contexts/ThemeContext';

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [latestWorks, setLatestWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategories();
    fetchLatestWorks();
  }, [selectedCategory]);

  useEffect(() => {
    if (latestWorks.length > 0) {
      fetchCommentCounts();
      fetchAverageRatings();
    }
  }, [latestWorks]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name_en');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLatestWorks = async () => {
    try {
      let query = supabase
        .from('works')
        .select(`
          *,
          category:categories(*),
          images:work_images!work_images_work_id_fkey(*)
        `);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Set image_url from primary work_image if exists
      const worksWithImages = data?.map(work => {
        const primaryImage = work.images?.find((img: { is_primary: boolean }) => img.is_primary);
        return {
          ...work,
          image_url: primaryImage?.image_url || work.image_url,
          thumbnail_url: primaryImage?.image_url || work.thumbnail_url,
        };
      });

      setLatestWorks(worksWithImages || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentCounts = async () => {
    try {
      const workIds = latestWorks.map(w => w.id);
      const { data, error } = await supabase
        .from('comments')
        .select('work_id')
        .in('work_id', workIds);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((comment) => {
        counts[comment.work_id] = (counts[comment.work_id] || 0) + 1;
      });

      setCommentCounts(counts);
    } catch (error) {
      console.error('Error fetching comment counts:', error);
    }
  };

  const fetchAverageRatings = async () => {
    try {
      const workIds = latestWorks.map(w => w.id);
      const { data, error } = await supabase
        .from('ratings')
        .select('work_id, rating')
        .in('work_id', workIds);

      if (error) throw error;

      const ratings: Record<string, number[]> = {};
      data?.forEach((rating) => {
        if (!ratings[rating.work_id]) {
          ratings[rating.work_id] = [];
        }
        ratings[rating.work_id].push(rating.rating);
      });

      const averages: Record<string, number> = {};
      Object.entries(ratings).forEach(([workId, workRatings]) => {
        const sum = workRatings.reduce((acc, r) => acc + r, 0);
        averages[workId] = sum / workRatings.length;
      });

      setAverageRatings(averages);
    } catch (error) {
      console.error('Error fetching average ratings:', error);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 relative"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="relative inline-block"
        >
          <h1 className="text-5xl sm:text-7xl font-racing font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-700 mb-4 relative z-10">
            {t('home.title')}
          </h1>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 blur-3xl -z-10"
          />
          <Sparkles className="absolute -top-4 -right-8 text-red-500 animate-pulse" size={24} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-xl font-space max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {t('home.subtitle')}
        </motion.p>

        {/* Category Filter Emojis */}
        <div className="flex justify-center flex-wrap gap-4 mt-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.3, rotate: 15 }}
            onClick={() => setSelectedCategory('all')}
            className={`text-4xl cursor-pointer transition-opacity ${
              selectedCategory === 'all' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
            }`}
            title={t('gallery.allCategories')}
          >
            🎨
          </motion.button>
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index + 1) * 0.1 }}
              whileHover={{ scale: 1.3, rotate: 15 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`text-4xl cursor-pointer transition-opacity ${
                selectedCategory === category.id ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
              title={i18n.language === 'uk' ? category.name_uk : category.name_en}
            >
              {category.icon}
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Latest Works */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-3xl font-racing font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonLoader variant="card" count={6} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link to={`/work/${work.id}`}>
                  <div className={`relative backdrop-blur-md rounded-xl overflow-hidden border transition-all duration-300 group shadow-lg ${
                    isDark
                      ? 'bg-gray-900/50 border-red-900/30 hover:border-red-600/60 hover:shadow-red-900/30'
                      : 'bg-white/80 border-red-200/50 hover:border-red-400/60 hover:shadow-red-200/40'
                  }`}>
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-red-900/0 group-hover:from-red-600/5 group-hover:via-red-600/3 group-hover:to-red-900/5 transition-all duration-300 pointer-events-none z-10" />

                    <div className={`aspect-w-16 aspect-h-12 relative overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <WorkImageCarousel workId={work.id} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>

                    <div className="p-5 relative z-10">
                      <h3 className={`font-space font-semibold mb-2 group-hover:text-red-400 transition-colors text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {i18n.language === 'uk' ? work.title_uk : work.title_en}
                      </h3>
                      {work.category && (
                        <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 border ${
                          isDark
                            ? 'bg-gradient-to-r from-red-600/30 to-red-800/30 text-red-300 border-red-600/20'
                            : 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-red-200/50'
                        }`}>
                          {work.category.icon} {i18n.language === 'uk' ? work.category.name_uk : work.category.name_en}
                        </span>
                      )}
                      <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1.5 group-hover:text-gray-300 transition-colors">
                            <Eye size={15} className="group-hover:scale-110 transition-transform" />
                            <span>{work.views || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 group-hover:text-gray-300 transition-colors">
                            <MessageCircle size={15} className="group-hover:scale-110 transition-transform" />
                            <span>{commentCounts[work.id] || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 group-hover:text-yellow-400 transition-colors">
                          <Star size={15} className="text-yellow-500 group-hover:scale-110 transition-transform" fill={averageRatings[work.id] ? 'currentColor' : 'none'} />
                          <span className="font-medium">{averageRatings[work.id] ? averageRatings[work.id].toFixed(1) : '—'}</span>
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
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>{t('common.noData')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

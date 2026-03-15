import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Eye, Star, Grid, List, MessageCircle } from 'lucide-react';
import { supabase, type Work, type Category } from '../lib/supabase';
import WorkImageCarousel from '../components/WorkImageCarousel';
import SkeletonLoader from '../components/SkeletonLoader';
import { useTheme } from '../contexts/ThemeContext';

const Gallery: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchCategories();
    fetchWorks();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (works.length > 0) {
      fetchCommentCounts();
      fetchAverageRatings();
    }
  }, [works]);

  // Client-side sorting for comment-based sorting
  const getSortedWorks = () => {
    if (sortBy === 'mostCommented') {
      return [...works].sort((a, b) => {
        const countA = commentCounts[a.id] || 0;
        const countB = commentCounts[b.id] || 0;
        return countB - countA;
      });
    }
    return works;
  };

  const sortedWorks = getSortedWorks();

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

  const fetchWorks = async () => {
    try {
      setLoading(true);
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

      // Apply sorting
      switch (sortBy) {
        case 'oldest':
          query = query.order('date_created', { ascending: true });
          break;
        case 'mostViewed':
          query = query.order('views', { ascending: false });
          break;
        case 'topRated':
          query = query.order('views', { ascending: false });
          break;
        default: // newest
          query = query.order('date_created', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Set image_url from primary work_image if exists
      const worksWithImages = data?.map(work => {
        const primaryImage = work.images?.find((img: { is_primary: boolean }) => img.is_primary);
        return {
          ...work,
          image_url: primaryImage?.image_url || work.image_url,
          thumbnail_url: primaryImage?.thumbnail_url || primaryImage?.image_url || work.thumbnail_url,
        };
      });

      setWorks(worksWithImages || []);
    } catch (error) {
      console.error('Error fetching works:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedName = (category: Category) => {
    return i18n.language === 'uk' ? category.name_uk : category.name_en;
  };

  const getLocalizedTitle = (work: Work) => {
    return i18n.language === 'uk' ? work.title_uk : work.title_en;
  };

  const fetchCommentCounts = async () => {
    try {
      const workIds = works.map(w => w.id);
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
      const workIds = works.map(w => w.id);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className={`text-4xl font-racing font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('gallery.title')}
        </h1>
      </motion.div>

      {/* Filters and Controls */}
      <div className={`backdrop-blur-xl rounded-xl p-6 border shadow-lg transition-colors duration-300 ${
        isDark
          ? 'bg-gray-900/40 border-red-900/30 shadow-red-900/10'
          : 'bg-white/70 border-red-200/40 shadow-red-100/20'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Filter className="inline w-4 h-4 mr-1" />
              {t('gallery.filterBy')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 text-white'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t('gallery.allCategories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {getLocalizedName(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort and View Controls */}
          <div className="flex gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('gallery.sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-1 rounded border focus:border-red-500 focus:outline-none transition-colors ${
                  isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                <option value="newest">{t('gallery.newest')}</option>
                <option value="oldest">{t('gallery.oldest')}</option>
                <option value="mostViewed">{t('gallery.mostViewed')}</option>
                <option value="topRated">{t('gallery.topRated')}</option>
                <option value="mostCommented">{t('gallery.mostCommented')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                View
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Works Grid/List */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SkeletonLoader variant="card" count={8} />
          </div>
        ) : (
          <div className="space-y-4">
            <SkeletonLoader variant="list" count={5} />
          </div>
        )
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
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
                          {getLocalizedTitle(work)}
                        </h3>
                        {work.category && (
                          <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 border ${
                            isDark
                              ? 'bg-gradient-to-r from-red-600/30 to-red-800/30 text-red-300 border-red-600/20'
                              : 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-red-200/50'
                          }`}>
                            {work.category.icon} {getLocalizedName(work.category)}
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
          ) : (
            <div className="space-y-4">
              {sortedWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <Link to={`/work/${work.id}`}>
                    <div className={`backdrop-blur-md rounded-xl overflow-hidden border transition-all duration-300 group p-5 flex gap-5 shadow-lg ${
                      isDark
                        ? 'bg-gray-900/50 border-red-900/30 hover:border-red-600/60 hover:shadow-red-900/20'
                        : 'bg-white/80 border-red-200/50 hover:border-red-400/60 hover:shadow-red-200/30'
                    }`}>
                      <img
                        src={work.thumbnail_url || work.image_url || '/placeholder.jpg'}
                        alt={getLocalizedTitle(work)}
                        loading="lazy"
                        decoding="async"
                        className="w-36 h-28 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-space font-semibold mb-2 group-hover:text-red-400 transition-colors text-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {getLocalizedTitle(work)}
                        </h3>
                        {work.category && (
                          <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 border ${
                            isDark
                              ? 'bg-gradient-to-r from-red-600/30 to-red-800/30 text-red-300 border-red-600/20'
                              : 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 border-red-200/50'
                          }`}>
                            {work.category.icon} {getLocalizedName(work.category)}
                          </span>
                        )}
                        <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {i18n.language === 'uk' ? work.description_uk : work.description_en}
                        </p>
                        <div className={`flex items-center gap-5 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center space-x-1.5 group-hover:text-gray-300 transition-colors">
                            <Eye size={15} />
                            <span>{work.views || 0} {t('work.views')}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 group-hover:text-gray-300 transition-colors">
                            <MessageCircle size={15} />
                            <span>{commentCounts[work.id] || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 group-hover:text-yellow-400 transition-colors">
                            <Star size={15} className="text-yellow-500" fill={averageRatings[work.id] ? 'currentColor' : 'none'} />
                            <span>{averageRatings[work.id] ? averageRatings[work.id].toFixed(1) : '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && works.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>{t('gallery.noWorks')}</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
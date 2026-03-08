import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Eye, Star, Grid, List, MessageCircle } from 'lucide-react';
import { supabase, type Work, type Category } from '../lib/supabase';
import WorkImageCarousel from '../components/WorkImageCarousel';

const Gallery: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});

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
          // For now, just use views as a proxy for rating
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
          thumbnail_url: primaryImage?.image_url || work.thumbnail_url,
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
        <h1 className="text-4xl font-racing font-bold text-white mb-2">
          {t('gallery.title')}
        </h1>
      </motion.div>

      {/* Filters and Controls */}
      <div className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-red-900/30">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              {t('gallery.filterBy')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('gallery.sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 focus:border-red-500 focus:outline-none"
              >
                <option value="newest">{t('gallery.newest')}</option>
                <option value="oldest">{t('gallery.oldest')}</option>
                <option value="mostViewed">{t('gallery.mostViewed')}</option>
                <option value="topRated">{t('gallery.topRated')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                View
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {works.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
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
                          {getLocalizedTitle(work)}
                        </h3>
                        {work.category && (
                          <span className="inline-block px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full mb-2">
                            {work.category.icon} {getLocalizedName(work.category)}
                          </span>
                        )}
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye size={14} />
                              <span>{work.views || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle size={14} />
                              <span>{commentCounts[work.id] || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-500" />
                            <span>{averageRatings[work.id] ? averageRatings[work.id].toFixed(1) : '—'}</span>
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
              {works.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/work/${work.id}`}>
                    <div className="bg-gray-900/50 backdrop-blur rounded-lg overflow-hidden border border-red-900/30 hover:border-red-600/50 transition-all duration-300 group p-4 flex gap-4">
                      <img
                        src={work.thumbnail_url || work.image_url || '/placeholder.jpg'}
                        alt={getLocalizedTitle(work)}
                        className="w-32 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-space font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                          {getLocalizedTitle(work)}
                        </h3>
                        {work.category && (
                          <span className="inline-block px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full mb-2">
                            {work.category.icon} {getLocalizedName(work.category)}
                          </span>
                        )}
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {i18n.language === 'uk' ? work.description_uk : work.description_en}
                        </p>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{work.views || 0} {t('work.views')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle size={14} />
                            <span>{commentCounts[work.id] || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-500" />
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
        <div className="text-center py-12 text-gray-400">
          <p>{t('gallery.noWorks')}</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
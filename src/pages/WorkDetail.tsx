import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, Star, Send, Calendar } from 'lucide-react';
import { supabase, type Work, type Comment, type Rating, type WorkImage } from '../lib/supabase';
import toast from 'react-hot-toast';

const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [work, setWork] = useState<Work | null>(null);
  const [images, setImages] = useState<WorkImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [newComment, setNewComment] = useState({ name: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkDetails();
      incrementViews();
    }
  }, [id]);

  const fetchWorkDetails = async () => {
    try {
      // Fetch work details
      const { data: workData, error: workError } = await supabase
        .from('works')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (workError) throw workError;
      setWork(workData);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('work_images')
        .select('*')
        .eq('work_id', id)
        .order('display_order');

      if (imagesError) throw imagesError;
      setImages(imagesData || []);

      // Set primary image as selected
      const primaryIndex = imagesData?.findIndex(img => img.is_primary) ?? 0;
      setSelectedImageIndex(primaryIndex >= 0 ? primaryIndex : 0);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('work_id', id)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      // Fetch ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('work_id', id);

      if (ratingsError) throw ratingsError;
      setRatings(ratingsData || []);

      // Calculate average rating
      if (ratingsData && ratingsData.length > 0) {
        const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
        setAverageRating(avg);
      }

      // Check if user has already rated (using session storage as user ID)
      const userId = getOrCreateUserId();
      const existingRating = ratingsData?.find(r => r.user_id === userId);
      if (existingRating) {
        setUserRating(existingRating.rating);
      }
    } catch (error) {
      console.error('Error fetching work details:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_views', { work_id: id });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const getOrCreateUserId = () => {
    let userId = sessionStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('userId', userId);
    }
    return userId;
  };

  const handleRating = async (rating: number) => {
    try {
      const userId = getOrCreateUserId();

      const { error } = await supabase
        .from('ratings')
        .upsert({
          work_id: id,
          user_id: userId,
          rating: rating
        });

      if (error) throw error;

      setUserRating(rating);
      toast.success('Thank you for rating!');

      // Refresh ratings
      fetchWorkDetails();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          work_id: id,
          author_name: newComment.name,
          content: newComment.content
        });

      if (error) throw error;

      toast.success('Comment added successfully!');
      setNewComment({ name: '', content: '' });
      fetchWorkDetails(); // Refresh comments
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Work not found</p>
      </div>
    );
  }

  const title = i18n.language === 'uk' ? work.title_uk : work.title_en;
  const description = i18n.language === 'uk' ? work.description_uk : work.description_en;
  const categoryName = work.category ?
    (i18n.language === 'uk' ? work.category.name_uk : work.category.name_en) : '';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>{t('common.back')}</span>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-gray-900/50 backdrop-blur rounded-lg overflow-hidden border border-red-900/30">
              <img
                src={images.length > 0 ? images[selectedImageIndex]?.image_url : work.image_url || '/placeholder.jpg'}
                alt={title}
                className="w-full h-auto"
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? 'border-red-500 ring-2 ring-red-500/50'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {image.is_primary && (
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1 rounded">
                        Main
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-red-900/30"
          >
            <h3 className="text-xl font-racing font-bold text-white mb-4">
              {t('work.comments')} ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6 space-y-4">
              <input
                type="text"
                placeholder={t('work.yourName')}
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                maxLength={50}
              />
              <textarea
                placeholder={t('work.yourComment')}
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                <span>{t('work.submit')}</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-400">{comment.author_name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {t('work.leaveComment')}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Work Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-red-900/30"
          >
            <h1 className="text-2xl font-racing font-bold text-white mb-2">
              {title}
            </h1>
            {work.category && (
              <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 rounded-full mb-4">
                {work.category.icon} {categoryName}
              </span>
            )}
            {description && (
              <p className="text-gray-300 mb-4">{description}</p>
            )}

            <div className="space-y-3 text-gray-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye size={18} />
                  <span>{work.views} {t('work.views')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} />
                  <span>{t('work.created')}</span>
                </div>
                <span>{new Date(work.date_created).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-red-900/30"
          >
            <h3 className="text-lg font-racing font-bold text-white mb-4">
              {t('work.rating')}
            </h3>

            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-yellow-400">
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">
                ({ratings.length} ratings)
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">{t('work.rateWork')}:</p>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      className={`${
                        star <= userRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600 hover:text-yellow-400'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {userRating > 0 && (
                <p className="text-xs text-center text-green-400 mt-2">
                  You rated this {userRating} stars
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkDetail;
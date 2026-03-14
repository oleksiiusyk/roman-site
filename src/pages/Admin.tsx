import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LogOut, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase, type Work, type Category, type WorkImage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';

// Auth component with Supabase
const AdminLogin: React.FC = () => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Invalid credentials');
    } else {
      toast.success('Welcome to Admin Panel!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`backdrop-blur rounded-lg p-8 border w-full max-w-md ${
          isDark ? 'bg-gray-900/50 border-red-900/30' : 'bg-white/70 border-red-200/40'
        }`}
      >
        <h2 className={`text-2xl font-racing font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('admin.login')}
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${
                isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder={t('admin.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${
                isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : t('admin.signIn')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// Work form component
const WorkForm: React.FC<{ work?: Work; onSave: () => void; onCancel: () => void; onImageUpdate?: () => void }> = ({ work, onSave, onCancel, onImageUpdate }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<WorkImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formData, setFormData] = useState({
    title_en: work?.title_en || '',
    title_uk: work?.title_uk || '',
    description_en: work?.description_en || '',
    description_uk: work?.description_uk || '',
    category_id: work?.category_id || '',
    image_url: work?.image_url || '',
    thumbnail_url: work?.thumbnail_url || '',
    date_created: work?.date_created || new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    fetchCategories();
    if (work?.id) {
      fetchImages();
    }
  }, [work?.id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const fetchImages = async () => {
    if (!work?.id) return;
    const { data } = await supabase
      .from('work_images')
      .select('*')
      .eq('work_id', work.id)
      .order('display_order');
    setImages(data || []);
  };

  const addImage = async (imageUrl?: string) => {
    const urlToAdd = imageUrl || newImageUrl;

    if (!urlToAdd.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    if (work?.id) {
      // Add to existing work
      const isPrimary = images.length === 0;
      const { error } = await supabase
        .from('work_images')
        .insert({
          work_id: work.id,
          image_url: urlToAdd,
          is_primary: isPrimary,
          display_order: images.length,
        });

      if (error) {
        toast.error('Failed to add image');
        return;
      }

      // If this is the first image (primary), update the works table
      if (isPrimary) {
        await supabase
          .from('works')
          .update({
            image_url: urlToAdd,
            thumbnail_url: urlToAdd,
          })
          .eq('id', work.id);
      }

      toast.success('Image added!');
      setNewImageUrl('');
      fetchImages();
      // Refresh parent works list to show updated thumbnail
      if (onImageUpdate) onImageUpdate();
    } else {
      // Add to new work (temporary state)
      setImages([...images, {
        id: `temp-${Date.now()}`,
        work_id: '',
        image_url: urlToAdd,
        is_primary: images.length === 0,
        display_order: images.length,
        created_at: new Date().toISOString(),
      }]);
      setNewImageUrl('');
    }
  };

  const removeImage = async (imageId: string) => {
    if (!window.confirm(t('admin.confirmDeleteImage'))) return;

    if (imageId.startsWith('temp-')) {
      // Remove from temporary state
      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image removed!');
    } else {
      // Delete from database
      const { error } = await supabase
        .from('work_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        toast.error('Failed to remove image');
        return;
      }
      toast.success('Image removed!');
      fetchImages();
      // Refresh parent works list to show updated thumbnail
      if (onImageUpdate) onImageUpdate();
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    if (work?.id && !imageId.startsWith('temp-')) {
      // Update in database
      await supabase
        .from('work_images')
        .update({ is_primary: false })
        .eq('work_id', work.id);

      await supabase
        .from('work_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      // Get the new primary image URL and update works table
      const { data: primaryImage } = await supabase
        .from('work_images')
        .select('image_url')
        .eq('id', imageId)
        .single();

      if (primaryImage) {
        await supabase
          .from('works')
          .update({
            image_url: primaryImage.image_url,
            thumbnail_url: primaryImage.image_url,
          })
          .eq('id', work.id);
      }

      toast.success('Primary image updated!');
      fetchImages();
    } else {
      // Update temporary state
      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === imageId,
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let workId = work?.id;

      if (work) {
        // Update existing work
        const { error } = await supabase
          .from('works')
          .update(formData)
          .eq('id', work.id);

        if (error) throw error;
        toast.success('Work updated successfully!');
      } else {
        // Create new work
        const { data, error } = await supabase
          .from('works')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        workId = data.id;

        // Insert images for new work
        if (images.length > 0) {
          const imageInserts = images.map((img, idx) => ({
            work_id: workId,
            image_url: img.image_url,
            is_primary: img.is_primary,
            display_order: idx,
          }));

          await supabase.from('work_images').insert(imageInserts);
        }

        toast.success('Work added successfully!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving work:', error);
      toast.error('Failed to save work');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Image Preview Modal */}
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}

    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            {t('admin.workTitle')} (EN)
          </label>
          <input
            type="text"
            value={formData.title_en}
            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            {t('admin.workTitle')} (UK)
          </label>
          <input
            type="text"
            value={formData.title_uk}
            onChange={(e) => setFormData({ ...formData, title_uk: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            {t('admin.workDescription')} (EN)
          </label>
          <textarea
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            rows={3}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            {t('admin.workDescription')} (UK)
          </label>
          <textarea
            value={formData.description_uk}
            onChange={(e) => setFormData({ ...formData, description_uk: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            rows={3}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            {t('admin.category')}
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            {t('admin.dateCreated')}
          </label>
          <input
            type="date"
            value={formData.date_created}
            onChange={(e) => setFormData({ ...formData, date_created: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            required
          />
        </div>
      </div>

      {/* Image Gallery Management */}
      <div className="space-y-4">
        <label className={`block text-sm font-medium ${labelCls}`}>
          Image Gallery ({images.length} images)
        </label>

        {/* Image Uploader */}
        <ImageUploader
          onImageAdd={(imageUrl) => {
            addImage(imageUrl);
          }}
        />

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative group border-2 rounded-lg overflow-hidden ${
                  image.is_primary ? 'border-red-500' : isDark ? 'border-gray-700' : 'border-gray-300'
                }`}
              >
                <img
                  src={image.image_url}
                  alt="Work image"
                  className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreviewImage(image.image_url)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(image.id)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                      title="Set as primary"
                    >
                      Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
                {image.is_primary && (
                  <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className={`text-center py-8 border-2 border-dashed rounded-lg ${
            isDark ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-300'
          }`}>
            No images added yet. Add at least one image above.
          </div>
        )}
      </div>

      {/* Keep old image_url field for backward compatibility */}
      <input type="hidden" value={formData.image_url} />

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          <span>{t('admin.save')}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <X size={18} />
          <span>{t('admin.cancel')}</span>
        </button>
      </div>
    </form>
    </>
  );
};

// Category form component
const CategoryForm: React.FC<{ category?: Category; onSave: () => void; onCancel: () => void }> = ({ category, onSave, onCancel }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    name_en: category?.name_en || '',
    name_uk: category?.name_uk || '',
    slug: category?.slug || '',
    icon: category?.icon || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const inputCls = isDark
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (category) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', category.id);

        if (error) throw error;
        toast.success('Category updated successfully!');
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert(formData);

        if (error) throw error;
        toast.success('Category added successfully!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            Category Name (EN)
          </label>
          <input
            type="text"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            Category Name (UK)
          </label>
          <input
            type="text"
            value={formData.name_uk}
            onChange={(e) => setFormData({ ...formData, name_uk: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            placeholder="category-slug"
            required
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${labelCls}`}>
            Icon (Emoji)
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${inputCls}`}
            placeholder="✈️"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          <span>{t('admin.save')}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <X size={18} />
          <span>{t('admin.cancel')}</span>
        </button>
      </div>
    </form>
  );
};

// Main admin dashboard
const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'works' | 'categories'>('works');
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchWorks();
    fetchCategories();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('works')
        .select(`
          *,
          category:categories(*),
          images:work_images!work_images_work_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name_en');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('works')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Work deleted successfully!');
      fetchWorks();
    } catch (error) {
      console.error('Error deleting work:', error);
      toast.error('Failed to delete work');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (isAddingNew || editingWork) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-racing font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingWork ? t('admin.editWork') : t('admin.addWork')}
          </h2>
          <button
            onClick={() => {
              setEditingWork(null);
              setIsAddingNew(false);
            }}
            className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
          >
            <X size={24} />
          </button>
        </div>
        <div className={`backdrop-blur rounded-lg p-6 border ${
          isDark ? 'bg-gray-900/50 border-red-900/30' : 'bg-white/70 border-red-200/40'
        }`}>
          <WorkForm
            work={editingWork || undefined}
            onSave={() => {
              setEditingWork(null);
              setIsAddingNew(false);
              fetchWorks();
            }}
            onCancel={() => {
              setEditingWork(null);
              setIsAddingNew(false);
            }}
            onImageUpdate={() => {
              fetchWorks();
            }}
          />
        </div>
      </div>
    );
  }

  if (editingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-racing font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingCategory.id ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={() => setEditingCategory(null)}
            className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
          >
            <X size={24} />
          </button>
        </div>
        <div className={`backdrop-blur rounded-lg p-6 border ${
          isDark ? 'bg-gray-900/50 border-red-900/30' : 'bg-white/70 border-red-200/40'
        }`}>
          <CategoryForm
            category={editingCategory.id ? editingCategory : undefined}
            onSave={() => {
              setEditingCategory(null);
              fetchCategories();
            }}
            onCancel={() => setEditingCategory(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Preview Modal */}
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        </motion.div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-racing font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('admin.title')}
          </h2>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <LogOut size={18} />
            <span>{t('admin.logout')}</span>
          </button>
        </div>

      {/* Tabs */}
      <div className={`flex gap-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <button
          onClick={() => setActiveTab('works')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'works'
              ? 'text-red-500 border-red-500'
              : isDark ? 'text-gray-400 border-transparent hover:text-gray-300' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Works
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'categories'
              ? 'text-red-500 border-red-500'
              : isDark ? 'text-gray-400 border-transparent hover:text-gray-300' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (activeTab === 'works') {
              setIsAddingNew(true);
            } else {
              setEditingCategory({} as Category);
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>{activeTab === 'works' ? t('admin.addWork') : 'Add Category'}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className={`backdrop-blur rounded-lg border overflow-hidden ${
          isDark ? 'bg-gray-900/50 border-red-900/30' : 'bg-white/70 border-red-200/40'
        }`}>
          {activeTab === 'works' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-800/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Image
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Title
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Category
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Views
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {works.map((work) => (
                    <tr
                      key={work.id}
                      onClick={() => setEditingWork(work)}
                      className={`transition-colors cursor-pointer ${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <img
                          src={work.thumbnail_url || work.image_url || '/placeholder.jpg'}
                          alt={work.title_en}
                          className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setPreviewImage(work.image_url || work.thumbnail_url || '/placeholder.jpg')}
                        />
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {i18n.language === 'uk' ? work.title_uk : work.title_en}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {work.category && (
                          <span className="inline-flex items-center space-x-1">
                            <span>{work.category.icon}</span>
                            <span>{work.category.name_en}</span>
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {work.views || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingWork(work)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteWork(work.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-800/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Icon
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Name (EN)
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Name (UK)
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Slug
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {categories.map((category) => (
                    <tr key={category.id} className={`transition-colors ${isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3 text-2xl">
                        {category.icon}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name_en}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.name_uk}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {category.slug}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};

// Main Admin component with routing
const Admin: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      <AdminDashboard />
    </div>
  );
};

export default Admin;

import React, { useRef, useState } from 'react';
import { Upload, Camera, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { compressImage, formatBytes } from '../lib/imageCompression';

interface ImageUploaderProps {
  onImageAdd: (imageUrl: string, thumbnailUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageAdd }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Please drop image files only');
      return;
    }

    for (const file of imageFiles) {
      await processFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await processFile(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image size should be less than 20MB');
      return;
    }

    setUploading(true);
    const originalSize = file.size;

    try {
      // Compress
      setStatus('Compressing...');
      const { full, thumbnail } = await compressImage(file);

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);

      // Upload full-size
      setStatus('Uploading full image...');
      const fullPath = `works/${timestamp}-${random}-full.webp`;
      const { error: fullError } = await supabase.storage
        .from('work-images')
        .upload(fullPath, full, {
          contentType: 'image/webp',
          cacheControl: '604800',
          upsert: false,
        });

      if (fullError) {
        toast.error(fullError.message || 'Failed to upload image');
        return;
      }

      // Upload thumbnail
      setStatus('Uploading thumbnail...');
      const thumbPath = `works/${timestamp}-${random}-thumb.webp`;
      const { error: thumbError } = await supabase.storage
        .from('work-images')
        .upload(thumbPath, thumbnail, {
          contentType: 'image/webp',
          cacheControl: '604800',
          upsert: false,
        });

      if (thumbError) {
        toast.error(thumbError.message || 'Failed to upload thumbnail');
        return;
      }

      const { data: { publicUrl: fullUrl } } = supabase.storage
        .from('work-images')
        .getPublicUrl(fullPath);

      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('work-images')
        .getPublicUrl(thumbPath);

      toast.success(`Compressed ${formatBytes(originalSize)} → ${formatBytes(full.size)}`);
      onImageAdd(fullUrl, thumbUrl);
    } catch (err) {
      console.error('Error processing file:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      setStatus('');
    }
  };

  const handleManualUrlAdd = () => {
    if (!manualUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      new URL(manualUrl);
      onImageAdd(manualUrl, manualUrl);
      setManualUrl('');
      toast.success('Image URL added');
    } catch (error) {
      toast.error('Please enter a valid URL');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 transition-all
          ${isDragging
            ? 'border-red-500 bg-red-500/10'
            : isDark
              ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Upload size={48} className="text-gray-400" />
          </div>

          <div>
            <p className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Images are auto-compressed before upload
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              <span>Choose Files</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera size={18} />
              <span>Take Photo</span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <Loader size={18} className="animate-spin" />
              <span>{status || 'Processing...'}</span>
            </div>
          )}

          <p className={`text-xs mt-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Supported: JPG, PNG, GIF, WebP (max 20MB, auto-compressed)
          </p>
        </div>
      </div>

      {/* Manual URL Input */}
      <div className="space-y-2">
        <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Or paste image URL directly
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-red-500 ${
              isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleManualUrlAdd())}
          />
          <button
            type="button"
            onClick={handleManualUrlAdd}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Add URL
          </button>
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Recommended: Upload to{' '}
          <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Imgur</a>
          ,{' '}
          <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">ImgBB</a>
          , or use Supabase Storage
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;

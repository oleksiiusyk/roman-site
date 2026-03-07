import React, { useRef, useState } from 'react';
import { Upload, Camera, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ImageUploaderProps {
  onImageAdd: (imageUrl: string) => void;
  uploadToSupabase?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageAdd, uploadToSupabase = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `works/${fileName}`;

      const { data, error } = await supabase.storage
        .from('work-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        toast.error(error.message || 'Failed to upload image');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('work-images')
        .getPublicUrl(filePath);

      toast.success('Image uploaded successfully!');
      onImageAdd(publicUrl);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleManualUrlAdd = () => {
    if (!manualUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      new URL(manualUrl);
      onImageAdd(manualUrl);
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
            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
          }
        `}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <Upload size={48} className="text-gray-400" />
          </div>

          <div>
            <p className="text-gray-300 font-medium mb-2">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-gray-500 text-sm">or choose an option below</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {/* File Select Button */}
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

            {/* Camera Capture Button (Mobile) */}
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
              <span>Processing image...</span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Supported: JPG, PNG, GIF, WebP (max 5MB)
          </p>
        </div>
      </div>

      {/* Manual URL Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">
          Or paste image URL directly
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
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
        <p className="text-xs text-gray-500">
          Recommended: Upload to{' '}
          <a
            href="https://imgur.com/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Imgur
          </a>
          ,{' '}
          <a
            href="https://imgbb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            ImgBB
          </a>
          , or use Supabase Storage
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
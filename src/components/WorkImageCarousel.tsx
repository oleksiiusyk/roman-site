import React, { useEffect, useState } from 'react';
import { supabase, type WorkImage } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { getCached, setCache } from '../lib/cache';

interface WorkImageCarouselProps {
  workId: string;
}

const WorkImageCarousel: React.FC<WorkImageCarouselProps> = ({ workId }) => {
  const [images, setImages] = useState<WorkImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchImages = async () => {
      const cacheKey = `work_images:${workId}`;
      const cached = getCached<WorkImage[]>(cacheKey);
      if (cached && cached.length > 0) {
        setImages(cached);
        const primaryIndex = cached.findIndex(img => img.is_primary);
        setCurrentIndex(primaryIndex >= 0 ? primaryIndex : 0);
        return;
      }

      const { data } = await supabase
        .from('work_images')
        .select('*')
        .eq('work_id', workId)
        .order('display_order');

      if (data && data.length > 0) {
        setCache(cacheKey, data);
        setImages(data);
        const primaryIndex = data.findIndex(img => img.is_primary);
        setCurrentIndex(primaryIndex >= 0 ? primaryIndex : 0);
      }
    };

    fetchImages();
  }, [workId]);

  // Auto-rotate images every 2 seconds when hovered
  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  if (images.length === 0) return null;

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative w-full h-48 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        // Reset to primary image when mouse leaves
        const primaryIndex = images.findIndex(img => img.is_primary);
        setCurrentIndex(primaryIndex >= 0 ? primaryIndex : 0);
      }}
    >
      {/* Current Image */}
      <img
        src={images[currentIndex]?.image_url}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-48 object-cover transition-opacity duration-300"
      />

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-red-500 w-4'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

export default WorkImageCarousel;

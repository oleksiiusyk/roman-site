import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'detail' | 'text';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'card', count = 1 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBg = isDark ? 'bg-gray-900/50' : 'bg-white/70';
  const borderColor = isDark ? 'border-red-900/30' : 'border-red-200/40';
  const shimmerBg = isDark ? 'bg-gray-800' : 'bg-gray-200';
  const shimmerGradient = isDark
    ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800'
    : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`${cardBg} backdrop-blur rounded-lg overflow-hidden border ${borderColor} animate-pulse`}>
            <div className={`aspect-w-16 aspect-h-12 ${shimmerBg} relative overflow-hidden`}>
              <div className={`absolute inset-0 ${shimmerGradient}`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className={`h-5 ${shimmerBg} rounded-md w-3/4 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className={`h-4 ${shimmerBg} rounded-md w-1/3 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-3">
                  <div className={`h-4 ${shimmerBg} rounded w-12 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                  </div>
                  <div className={`h-4 ${shimmerBg} rounded w-12 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                  </div>
                </div>
                <div className={`h-4 ${shimmerBg} rounded w-12 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`${cardBg} backdrop-blur rounded-lg overflow-hidden border ${borderColor} p-4 flex gap-4 animate-pulse`}>
            <div className={`w-32 h-24 ${shimmerBg} rounded relative overflow-hidden`}>
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className={`h-5 ${shimmerBg} rounded-md w-2/3 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className={`h-4 ${shimmerBg} rounded-md w-1/4 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className={`h-3 ${shimmerBg} rounded-md w-full relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="flex gap-4">
                <div className={`h-3 ${shimmerBg} rounded w-16 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
                <div className={`h-3 ${shimmerBg} rounded w-16 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
                <div className={`h-3 ${shimmerBg} rounded w-16 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'detail':
        return (
          <div className="space-y-6 animate-pulse">
            <div className={`${cardBg} backdrop-blur rounded-lg overflow-hidden border ${borderColor} h-96 relative`}>
              <div className={`absolute inset-0 ${shimmerGradient}`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className={`h-8 ${shimmerBg} rounded-md w-2/3 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className={`h-4 ${shimmerBg} rounded-md w-1/4 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className={`h-4 ${shimmerBg} rounded-md w-full relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className={`h-4 ${shimmerBg} rounded-md w-5/6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2 animate-pulse">
            <div className={`h-4 ${shimmerBg} rounded w-full relative overflow-hidden`}>
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
            <div className={`h-4 ${shimmerBg} rounded w-5/6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
            <div className={`h-4 ${shimmerBg} rounded w-4/6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'detail' | 'text';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-gray-900/50 backdrop-blur rounded-lg overflow-hidden border border-red-900/30 animate-pulse">
            <div className="aspect-w-16 aspect-h-12 bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-800 rounded-md w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded-md w-1/3 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-3">
                  <div className="h-4 bg-gray-800 rounded w-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                  </div>
                  <div className="h-4 bg-gray-800 rounded w-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-800 rounded w-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="bg-gray-900/50 backdrop-blur rounded-lg overflow-hidden border border-red-900/30 p-4 flex gap-4 animate-pulse">
            <div className="w-32 h-24 bg-gray-800 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-800 rounded-md w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded-md w-1/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="h-3 bg-gray-800 rounded-md w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-3 bg-gray-800 rounded w-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
                <div className="h-3 bg-gray-800 rounded w-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
                <div className="h-3 bg-gray-800 rounded w-16 relative overflow-hidden">
                  <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'detail':
        return (
          <div className="space-y-6 animate-pulse">
            <div className="bg-gray-900/50 backdrop-blur rounded-lg overflow-hidden border border-red-900/30 h-96 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-800 rounded-md w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded-md w-1/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded-md w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
              <div className="h-4 bg-gray-800 rounded-md w-5/6 relative overflow-hidden">
                <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-800 rounded w-5/6 relative overflow-hidden">
              <div className="absolute inset-0 bg-shimmer animate-shimmer"></div>
            </div>
            <div className="h-4 bg-gray-800 rounded w-4/6 relative overflow-hidden">
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
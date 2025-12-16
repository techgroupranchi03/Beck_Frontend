import React from 'react';

export default function CardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header with title and menu */}
        <div className="flex justify-between items-start mb-2">
          <div className="skeleton-wave h-8 w-64 rounded"></div>
          <div className="skeleton-wave h-6 w-6 rounded"></div>
        </div>

        {/* Description */}
        <div className="skeleton-wave h-4 w-full rounded mb-2"></div>
        <div className="skeleton-wave h-4 w-3/4 rounded mb-4"></div>

        {/* Maintenance Badge */}
        <div className="mb-4">
          <div className="skeleton-wave h-8 w-32 rounded-full"></div>
        </div>

        {/* Info chips row 1 */}
        <div className="flex flex-wrap gap-2 mb-2">
          <div className="skeleton-wave h-8 w-24 rounded-full"></div>
          <div className="skeleton-wave h-8 w-32 rounded-full"></div>
          <div className="skeleton-wave h-8 w-36 rounded-full"></div>
        </div>

        {/* Info chips row 2 */}
        <div className="flex flex-wrap gap-2">
          <div className="skeleton-wave h-8 w-40 rounded-full"></div>
          <div className="skeleton-wave h-8 w-48 rounded-full"></div>
        </div>
      </div>

      <style>{`
        .skeleton-wave {
          background: linear-gradient(
            90deg,
            #f0f0f0 0%,
            #f0f0f0 40%,
            #e0e0e0 50%,
            #f0f0f0 60%,
            #f0f0f0 100%
          );
          background-size: 200% 100%;
          animation: wave 1.5s ease-in-out infinite;
        }

        @keyframes wave {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
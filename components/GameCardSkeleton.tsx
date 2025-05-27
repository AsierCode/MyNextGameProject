import React from 'react';

const GameCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg flex flex-col" aria-hidden="true">
      <div className="relative w-full h-48 bg-slate-700 overflow-hidden">
        <div className="absolute inset-0 shimmer-bg"></div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="relative h-6 bg-slate-700 rounded w-3/4 mb-2 overflow-hidden">
            <div className="absolute inset-0 shimmer-bg"></div>
        </div>
        <div className="relative h-4 bg-slate-700 rounded w-1/2 mb-3 overflow-hidden">
            <div className="absolute inset-0 shimmer-bg"></div>
        </div>
        <div className="relative h-3 bg-slate-700 rounded w-1/3 mb-1 overflow-hidden">
            <div className="absolute inset-0 shimmer-bg"></div>
        </div>
        <div className="mt-auto pt-2">
          <div className="mb-2">
            <div className="relative h-3 bg-slate-700 rounded w-1/4 mb-1 overflow-hidden">
                <div className="absolute inset-0 shimmer-bg"></div>
            </div>
            <div className="relative h-3 bg-slate-700 rounded w-full overflow-hidden">
                <div className="absolute inset-0 shimmer-bg"></div>
            </div>
          </div>
          <div>
            <div className="relative h-3 bg-slate-700 rounded w-1/4 mb-1 overflow-hidden">
                <div className="absolute inset-0 shimmer-bg"></div>
            </div>
            <div className="relative h-3 bg-slate-700 rounded w-full overflow-hidden">
                <div className="absolute inset-0 shimmer-bg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCardSkeleton;
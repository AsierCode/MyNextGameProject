import React from 'react';
import { Game } from '../types';
import GameCard from './GameCard';
import LoadingSpinner from './LoadingSpinner';
import GameCardSkeleton from './GameCardSkeleton';
import { PAGE_SIZE, InfoIcon, ErrorIcon, EmptyWishlistIcon } from '../constants';

interface GameGridProps {
  games: Game[];
  isLoading: boolean;
  error: string | null;
  onViewDetails: (gameId: number) => void;
  onToggleWishlist: (gameId: number) => void;
  viewMode: 'all' | 'wishlist'; 
}

const GameGrid: React.FC<GameGridProps> = ({ games, isLoading, error, onViewDetails, onToggleWishlist, viewMode }) => {
  if (isLoading && games.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5" aria-live="polite" aria-busy="true"> {/* Adjusted grid for potentially more filters taking space */}
        {Array.from({ length: PAGE_SIZE }).map((_, index) => (
          <GameCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4 flex flex-col items-center justify-center min-h-[300px]" role="alert">
        <span className="text-red-500 mb-4">{ErrorIcon}</span>
        <p className="text-xl font-semibold text-red-400 mb-2 font-heading">Oops! Something Went Wrong</p>
        <p className="text-slate-400 max-w-md">{error}</p>
        <p className="text-slate-500 mt-2 text-sm">Please try again later or adjust your search.</p>
      </div>
    );
  }

  if (!isLoading && games.length === 0) {
    if (viewMode === 'wishlist') {
      return (
        <div className="text-center py-12 px-4 flex flex-col items-center justify-center min-h-[300px]">
          <span className="mb-4">{EmptyWishlistIcon}</span>
          <p className="text-xl font-semibold text-slate-300 mb-2 font-heading">Your Wishlist is Empty</p>
          <p className="text-slate-400">Explore games and click the heart icon to add them here!</p>
        </div>
      );
    }
    return (
      <div className="text-center py-12 px-4 flex flex-col items-center justify-center min-h-[300px]">
        <span className="mb-4">{InfoIcon}</span> {/* InfoIcon is now fuchsia from constants */}
        <p className="text-xl font-semibold text-slate-300 mb-2 font-heading">No Games Found</p>
        <p className="text-slate-400">Try adjusting your search filters or try a different keyword.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && games.length > 0 && ( 
        <div className="absolute inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center z-10 rounded-lg" aria-live="polite" aria-busy="true">
          <LoadingSpinner />
          <span className="sr-only">Loading more games...</span>
        </div>
      )}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${isLoading && games.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
        {games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            onViewDetails={onViewDetails}
            onToggleWishlist={onToggleWishlist}
            isFavorite={!!game.isFavorite} 
          />
        ))}
      </div>
    </div>
  );
};

export default GameGrid;
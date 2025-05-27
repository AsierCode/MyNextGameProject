import React, { useState } from 'react';
import { Game } from '../types';
import StarRating from './StarRating';
import { HeartIconFilled, HeartIconOutline } from '../constants';

interface GameCardProps {
  game: Game;
  onViewDetails: (gameId: number) => void;
  onToggleWishlist: (gameId: number) => void;
  isFavorite: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, onViewDetails, onToggleWishlist, isFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryImageUrl = game.background_image || `https://picsum.photos/seed/${game.id}/400/225`;
  const hoverImageUrl = game.short_screenshots && game.short_screenshots.length > 0 
    ? game.short_screenshots[0].image 
    : primaryImageUrl;

  const displayImageUrl = isHovered ? hoverImageUrl : primaryImageUrl;

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (document.activeElement === event.currentTarget && event.key === ' ') {
         event.preventDefault(); 
      }
      if(event.target === event.currentTarget || (event.target as HTMLElement).closest('[role="button"]') !== event.currentTarget.querySelector('.wishlist-button')) {
        onViewDetails(game.id);
      }
    }
  };

  const handleWishlistToggle = (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation(); 
    onToggleWishlist(game.id);
  };

  return (
    <div 
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-fuchsia-600/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 flex flex-col cursor-pointer focus:outline-none relative group border border-slate-700 hover:border-fuchsia-600/70 animate-fadeIn"
      onClick={() => onViewDetails(game.id)}
      onKeyPress={handleKeyPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${game.name}`}
    >
      <button
        onClick={handleWishlistToggle}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleWishlistToggle(e);}}
        className="wishlist-button absolute top-2.5 right-2.5 z-20 p-2 bg-slate-900/70 backdrop-blur-sm rounded-full text-rose-500 hover:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 focus:ring-offset-slate-800 transition-all"
        aria-label={isFavorite ? `Remove ${game.name} from wishlist` : `Add ${game.name} to wishlist`}
        aria-pressed={isFavorite}
      >
        {isFavorite ? HeartIconFilled : HeartIconOutline}
      </button>

      <div className="w-full h-48 overflow-hidden relative">
        <img 
          src={displayImageUrl} 
          alt={`${game.name} preview`} 
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; 
            target.src = `https://picsum.photos/seed/${game.id}/400/225`;
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors mb-1 truncate font-heading" title={game.name}>{game.name}</h3>
        
        <div className="flex items-center mb-2">
          {game.rating > 0 && <StarRating rating={game.rating} maxRating={game.rating_top || 5} size="sm" />}
          {game.rating > 0 && <span className="ml-2 text-xs text-slate-400">({game.ratings_count} ratings)</span>}
          {game.rating === 0 && <span className="text-xs text-slate-500">Not rated</span>}
        </div>

        {game.released && (
          <p className="text-xs text-slate-400 mb-1">Released: {new Date(game.released).toLocaleDateString()}</p>
        )}
        
        <div className="mt-auto pt-2 space-y-1">
          <div>
            <p className="text-xs text-slate-500 font-medium">Platforms:</p>
            <p className="text-xs text-slate-300 truncate" title={game.parent_platforms?.map(p => p.platform.name).join(', ') || 'N/A'}>
              {game.parent_platforms?.map(p => p.platform.name).join(', ') || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Genres:</p>
            <p className="text-xs text-slate-300 truncate" title={game.genres?.map(g => g.name).join(', ') || 'N/A'}>
              {game.genres?.map(g => g.name).join(', ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
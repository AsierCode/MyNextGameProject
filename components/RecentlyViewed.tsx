import React from 'react';
import { RecentlyViewedGame } from '../types';
import { HistoryIcon } from '../constants';

interface RecentlyViewedProps {
  games: RecentlyViewedGame[];
  onViewDetails: (gameId: number) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ games, onViewDetails }) => {
  if (!games || games.length === 0) {
    return null; 
  }

  return (
    <section className="my-6 py-4 border-t border-b border-slate-700/50" aria-labelledby="recently-viewed-title">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-3 text-fuchsia-400">
          {HistoryIcon}
          <h2 id="recently-viewed-title" className="text-lg font-semibold ml-2 font-heading">
            Recently Viewed
          </h2>
        </div>
        <div className="flex overflow-x-auto space-x-4 pb-3 custom-scrollbar-thin">
          {games.map((game, index) => (
            <div
              key={game.id}
              onClick={() => onViewDetails(game.id)}
              onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails(game.id); }}
              className="group relative flex-none w-48 bg-slate-800 rounded-lg shadow-md hover:shadow-fuchsia-600/20 overflow-hidden cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
              tabIndex={0}
              role="button"
              aria-label={`View details for recently viewed game: ${game.name}`}
            >
              <img
                src={game.background_image || `https://picsum.photos/seed/${game.id}/300/160`}
                alt={`Cover for ${game.name}`}
                className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://picsum.photos/seed/${game.id}/300/160`;
                }}
              />
              <div className="p-3">
                <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-fuchsia-300 transition-colors" title={game.name}>
                  {game.name}
                </h3>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
          ))}
        </div>
         {games.length === 0 && <p className="text-slate-500 text-sm">No recently viewed games yet.</p>}
      </div>
    </section>
  );
};

export default RecentlyViewed;
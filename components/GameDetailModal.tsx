

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GameDetails, ParentPlatform, Genre, Developer, Publisher, Tag, Store, MovieClip } from '../types'; // Removed GameSuggestion
import { fetchGameDetails } from '../services/rawgService'; // fetchGameSuggestions removed, fetchGameMovies is called within fetchGameDetails
import LoadingSpinner from './LoadingSpinner';
import { CloseIcon, ExternalLinkIcon, HeartIconFilled, HeartIconOutline, PlayIcon, SparkleIcon, SurpriseMeIcon } from '../constants';
import StarRating from './StarRating';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

interface GameDetailModalProps {
  gameId: number | null;
  onClose: () => void;
  onToggleWishlist: (gameId: number, gameDetails: GameDetails) => void;
  isFavoriteInitial: boolean;
  onViewDetails: (gameId: number) => void; 
  onFindSimilar: (genreSlug: string | null, gameName: string | null) => void; // Updated prop
}


const GameDetailModal: React.FC<GameDetailModalProps> = ({ gameId, onClose, onToggleWishlist, isFavoriteInitial, onViewDetails, onFindSimilar }) => {
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [showTrailer, setShowTrailer] = useState(false);

  // State for AI Summary
  const [summarizedDescription, setSummarizedDescription] = useState<string | null>(null);
  const [isSummarizingDescription, setIsSummarizingDescription] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);


  const titleId = 'game-detail-modal-title';
  const carouselIntervalRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsFavorite(isFavoriteInitial);
  }, [isFavoriteInitial]);

  const clearCarouselInterval = () => {
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }
  };
  
  const startCarouselInterval = useCallback(() => {
    clearCarouselInterval();
    if (gameDetails && gameDetails.short_screenshots && gameDetails.short_screenshots.length > 1 && !showTrailer) {
      carouselIntervalRef.current = window.setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (gameDetails.short_screenshots.length));
      }, 4000);
    }
  }, [gameDetails, showTrailer]);


  const fetchDetails = useCallback(async () => {
    if (!gameId) return;
    setIsLoading(true);
    setError(null);
    setGameDetails(null); 
    setCurrentImageIndex(0);
    setShowTrailer(false);
    clearCarouselInterval();
    
    // Reset AI summary state
    setSummarizedDescription(null);
    setIsSummarizingDescription(false);
    setSummaryError(null);

    try {
      const details = await fetchGameDetails(gameId); // This now includes movie fetching logic
      setGameDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game details.');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (gameDetails && !isLoading) {
        startCarouselInterval();
    }
    return () => clearCarouselInterval();
  }, [gameDetails, isLoading, startCarouselInterval]);


  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearCarouselInterval();
    };
  }, [onClose]);

  const handleWishlistToggleInternal = () => {
    if (!gameDetails) return;
    onToggleWishlist(gameDetails.id, gameDetails);
    setIsFavorite(!isFavorite); 
  };

   const handleSummarizeDescription = async () => {
    if (!gameDetails || !gameDetails.description_raw) return;

    setIsSummarizingDescription(true);
    setSummarizedDescription(null);
    setSummaryError(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-2.5-flash-preview-04-17';
      const prompt = `You are a helpful assistant. Summarize the following game description in 2-4 concise and engaging sentences. Focus on the core gameplay, unique features, and overall player experience. Keep it brief and exciting. Game Description: \n\n${gameDetails.description_raw}`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      setSummarizedDescription(response.text);
    } catch (err) {
      console.error("Error summarizing description:", err);
      setSummaryError(err instanceof Error ? err.message : "Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizingDescription(false);
    }
  };


  if (!gameId) return null;

  const mainImage = gameDetails?.short_screenshots && gameDetails.short_screenshots.length > 0 
    ? gameDetails.short_screenshots[currentImageIndex]?.image 
    : gameDetails?.background_image;
  
  const firstTrailer = gameDetails?.clips?.find(clip => clip.data?.max || clip.data?.['480']);


  const changeImage = (newIndex: number) => {
    if (gameDetails && gameDetails.short_screenshots) {
      setShowTrailer(false);
      setCurrentImageIndex(newIndex);
      startCarouselInterval(); 
    }
  };
  
  const nextImage = () => {
    if (gameDetails && gameDetails.short_screenshots) {
      changeImage((currentImageIndex + 1) % gameDetails.short_screenshots.length);
    }
  };

  const prevImage = () => {
     if (gameDetails && gameDetails.short_screenshots) {
      changeImage((currentImageIndex - 1 + gameDetails.short_screenshots.length) % gameDetails.short_screenshots.length);
    }
  };

  const handlePlayTrailer = () => {
    if (firstTrailer) {
      setShowTrailer(true);
      clearCarouselInterval();
    }
  };
  
  const renderDetailItem = (label: string, value: string | React.ReactNode | null | undefined, customClass?: string) => {
    if (!value && typeof value !== 'number') return null;
    return (
      <div className={customClass}>
        <p className="text-sm text-fuchsia-300/80 font-semibold font-heading">{label}:</p>
        {typeof value === 'string' ? <p className="text-slate-200 break-words">{value}</p> : value}
      </div>
    );
  };

  const handleFindSimilarClick = () => {
    if (gameDetails) {
      const genreSlug = gameDetails.genres?.[0]?.slug || null;
      const gameName = gameDetails.name; // Use game name
      onFindSimilar(genreSlug, gameName); // Pass gameName instead of tagSlug
      onClose();
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-start md:items-center z-50 p-2 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div 
        className="bg-slate-800/90 backdrop-blur-lg rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col my-auto border border-fuchsia-600/30"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <header className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-700/70">
          <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-gradient-fuchsia truncate pr-2 font-heading">{gameDetails?.name || 'Loading...'}</h2>
          <div className="flex items-center gap-2">
            {gameDetails && (
                 <button
                    onClick={handleWishlistToggleInternal}
                    className="p-2 text-rose-500 hover:bg-rose-500/20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 transition-all"
                    aria-label={isFavorite ? `Remove ${gameDetails.name} from wishlist` : `Add ${gameDetails.name} to wishlist`}
                    aria-pressed={isFavorite}
                  >
                    {isFavorite ? HeartIconFilled : HeartIconOutline}
                  </button>
            )}
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-100 transition-colors p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
              aria-label="Close game details"
            >
              {CloseIcon}
            </button>
          </div>
        </header>

        {isLoading && <div className="p-8 min-h-[200px] sm:min-h-[300px] flex justify-center items-center"><LoadingSpinner size="lg" /></div>}
        {error && <p className="text-center text-red-400 p-8">{error}</p>}
        
        {gameDetails && !isLoading && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-grow custom-scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-6">
              <section aria-labelledby="game-media-details" className="md:col-span-3 space-y-4">
                 <h3 id="game-media-details" className="sr-only font-heading">Game Media and Core Details</h3>
                
                <div 
                    className="relative mb-4 group aspect-video bg-slate-900 rounded-lg shadow-xl overflow-hidden"
                    onMouseEnter={clearCarouselInterval}
                    onMouseLeave={startCarouselInterval}
                  >
                    {showTrailer && firstTrailer ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${firstTrailer.data.max.split('watch?v=')[1] || firstTrailer.data['480'].split('watch?v=')[1]}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3`}
                            title={`Trailer for ${gameDetails.name}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    ) : (mainImage && (
                        <>
                        <img 
                            ref={imageRef}
                            src={mainImage} 
                            alt={currentImageIndex > 0 ? `Screenshot ${currentImageIndex + 1} for ${gameDetails.name}` : `${gameDetails.name} cover art`}
                            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                            key={mainImage} 
                            style={{opacity: 0}} 
                            onLoad={(e) => (e.target as HTMLImageElement).style.opacity = '1'}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; 
                                target.src = `https://picsum.photos/seed/${gameDetails.id}/600/400`;
                                target.style.opacity = '1';
                            }}
                        />
                         {firstTrailer && !showTrailer && (
                            <button
                                onClick={handlePlayTrailer}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                                aria-label={`Play trailer for ${gameDetails.name}`}
                            >
                                <span className="text-fuchsia-400 drop-shadow-lg">{PlayIcon}</span>
                            </button>
                        )}
                        </>
                    ))}
                    {!showTrailer && gameDetails.short_screenshots && gameDetails.short_screenshots.length > 1 && (
                        <>
                            <button 
                                onClick={prevImage} 
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2.5 rounded-full hover:bg-black/70 focus:bg-black/70 transition-all opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 outline-none focus-visible:ring-1 focus-visible:ring-fuchsia-400 ring-offset-0"
                                aria-label="Previous image">
                                &#10094;
                            </button>
                            <button 
                                onClick={nextImage} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2.5 rounded-full hover:bg-black/70 focus:bg-black/70 transition-all opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 outline-none focus-visible:ring-1 focus-visible:ring-fuchsia-400 ring-offset-0"
                                aria-label="Next image">
                                &#10095;
                            </button>
                             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                                {gameDetails.short_screenshots.map((_, idx) => (
                                    <button 
                                        key={`dot-${idx}`}
                                        onClick={() => changeImage(idx)}
                                        aria-label={`Go to image ${idx + 1}`}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-fuchsia-400 scale-125' : 'bg-slate-400/70 hover:bg-slate-200/80'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    {showTrailer && firstTrailer && (
                         <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded hover:bg-black/80 transition-all"
                            aria-label="Close trailer and show images"
                         >
                           Show Images
                         </button>
                    )}
                  </div>
                
                {renderDetailItem("Rating", gameDetails.rating > 0 ? <StarRating rating={gameDetails.rating} maxRating={gameDetails.rating_top || 5} /> : <span className="text-slate-400">Not Rated</span>)}
                {renderDetailItem("Metacritic", gameDetails.metacritic ? 
                    <span className={`font-bold px-2 py-0.5 rounded text-sm shadow-sm ${gameDetails.metacritic >= 75 ? 'bg-green-500 text-white' : gameDetails.metacritic >= 50 ? 'bg-yellow-500 text-black' : 'bg-red-600 text-white'}`}>
                        {gameDetails.metacritic}
                    </span> 
                    : <span className="text-slate-400">N/A</span>)}
                {renderDetailItem("Release Date", gameDetails.released ? new Date(gameDetails.released).toLocaleDateString() : "TBA")}
                {renderDetailItem("ESRB Rating", gameDetails.esrb_rating?.name || "Not Rated")}
                {gameDetails.website && renderDetailItem("Website", 
                  <a href={gameDetails.website} target="_blank" rel="noopener noreferrer" className="text-fuchsia-400 hover:text-fuchsia-300 hover:underline inline-flex items-center gap-1 break-all transition-colors">
                    Visit Site <span aria-hidden="true" className="opacity-80">{ExternalLinkIcon}</span>
                  </a>
                )}
              </section>

              <section aria-labelledby="game-additional-details" className="md:col-span-2 space-y-4">
                <h3 id="game-additional-details" className="sr-only font-heading">Additional Game Details</h3>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-lg font-semibold text-slate-100 font-heading">Description</h4>
                    {gameDetails.description_raw && gameDetails.description_raw.length > 50 && !summarizedDescription && !isSummarizingDescription && !summaryError && (
                        <button
                        onClick={handleSummarizeDescription}
                        className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 py-1.5 rounded-md shadow-sm transition-all inline-flex items-center gap-1.5 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                        aria-label="Summarize game description with AI"
                        >
                        <SparkleIcon className="w-3.5 h-3.5" />
                        <span>AI Summary</span>
                        </button>
                    )}
                  </div>
                  <div className="text-sm text-slate-300 max-h-40 sm:max-h-48 overflow-y-auto pr-2 leading-relaxed custom-scrollbar-thin"
                       dangerouslySetInnerHTML={{ __html: gameDetails.description_raw?.replace(/\n/g, '<br />') || '<i class="text-slate-400">No description available.</i>' }}>
                  </div>

                  {/* AI Summary Section */}
                  {isSummarizingDescription && (
                    <div className="mt-3 p-3 bg-slate-700/30 rounded-md flex items-center gap-2 text-sm text-slate-300 animate-fadeIn">
                      <svg aria-hidden="true" className="animate-spin h-4 w-4 text-fuchsia-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating AI summary...</span>
                    </div>
                  )}
                  {summaryError && !isSummarizingDescription && (
                    <div className="mt-3 p-3 bg-red-900/40 border border-red-700 rounded-md text-sm text-red-300 animate-fadeIn" role="alert">
                      <p className="font-semibold mb-1">AI Summary Error:</p>
                      <p className="text-xs">{summaryError}</p>
                      <button 
                          onClick={handleSummarizeDescription} 
                          className="mt-2 text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-red-900/40">
                          Try Again
                      </button>
                    </div>
                  )}
                  {summarizedDescription && !isSummarizingDescription && !summaryError && (
                    <blockquote className="mt-4 p-4 border-l-4 border-fuchsia-500 bg-slate-700/60 rounded-r-md text-slate-200 animate-fadeIn">
                      <p className="font-semibold text-fuchsia-300 mb-1.5 flex items-center gap-1.5 text-sm">
                          <SparkleIcon className="w-4 h-4" />
                          <span>AI-Powered Summary</span>
                      </p>
                      <p className="text-sm italic leading-relaxed whitespace-pre-wrap">{summarizedDescription}</p>
                      <button 
                          onClick={() => { setSummarizedDescription(null); setSummaryError(null); }}
                          className="mt-2 text-xs text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus-visible:underline">
                          Clear Summary
                      </button>
                    </blockquote>
                  )}
                </div>
                
                {renderDetailItem("Platforms", gameDetails.parent_platforms?.map((p: ParentPlatform) => p.platform.name).join(', ') || <span className="text-slate-400">N/A</span>)}
                {renderDetailItem("Genres", gameDetails.genres?.map((g: Genre) => g.name).join(', ') || <span className="text-slate-400">N/A</span>)}
                {renderDetailItem("Developers", gameDetails.developers?.map((d: Developer) => d.name).join(', ') || <span className="text-slate-400">N/A</span>)}
                {renderDetailItem("Publishers", gameDetails.publishers?.map((p: Publisher) => p.name).join(', ') || <span className="text-slate-400">N/A</span>)}
                
                {gameDetails.stores && gameDetails.stores.length > 0 && (
                  <div>
                    <p className="text-sm text-fuchsia-300/80 font-semibold mb-1 font-heading">Available on:</p>
                    <div className="flex flex-wrap gap-2">
                      {gameDetails.stores.map((s: Store) => (
                        s.url ? (
                          <a 
                            key={s.id} 
                            href={s.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-slate-700/80 hover:bg-slate-600/90 text-slate-200 text-xs px-2.5 py-1 rounded-md shadow-sm transition-all hover:text-fuchsia-300 inline-flex items-center gap-1.5"
                          >
                            {s.store.name} <span aria-hidden="true" className="opacity-70">{ExternalLinkIcon}</span>
                          </a>
                        ) : (
                           <span key={s.id} className="bg-slate-600/70 text-slate-300 text-xs px-2.5 py-1 rounded-md shadow-sm">
                                {s.store.name} (Link not available)
                            </span>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {gameDetails.tags && gameDetails.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-fuchsia-300/80 font-semibold mb-1 font-heading">Tags:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-20 sm:max-h-24 overflow-y-auto custom-scrollbar-thin pr-1">
                      {gameDetails.tags.slice(0, 15).map((tag: Tag) => ( 
                        <span key={tag.id} className="bg-slate-600/70 text-slate-300 text-xs px-2 py-1 rounded-full shadow-sm">{tag.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
            
            {/* Actions Section */}
            <div className="mt-6 pt-4 border-t border-slate-700/70 space-y-3">
              <h4 className="text-md font-semibold text-fuchsia-300/90 font-heading">Acciones</h4>
              <button
                onClick={handleFindSimilarClick}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 w-full sm:w-auto shadow-md hover:shadow-indigo-500/30"
                aria-label={`Buscar juegos similares a ${gameDetails.name}`}
              >
                <SurpriseMeIcon className="w-4 h-4" />
                <span>Buscar Similares</span>
              </button>
            </div>

            {/* Similar Games Section Removed */}
            
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetailModal;
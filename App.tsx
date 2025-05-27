import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import GameGrid from './components/GameGrid';
import Pagination from './components/Pagination';
import GameDetailModal from './components/GameDetailModal';
import RecentlyViewed from './components/RecentlyViewed';
import QuizModal, { QuizAnswers } from './components/QuizModal'; // Import QuizModal and QuizAnswers
import ScrollToTopButton from './components/ScrollToTopButton'; // Import ScrollToTopButton
import { Game, Genre, PlatformCore, GameDetails, RecentlyViewedGame, Tag, ReleaseYearOption } from './types';
import { fetchGames, fetchGenres, fetchPlatforms, fetchTags, fetchGameDetails, fetchRandomGame } from './services/rawgService';
import * as StorageService from './services/localStorageService';
import { PAGE_SIZE, DEFAULT_ORDERING, ORDERING_OPTIONS, RELEASE_YEAR_OPTIONS } from './constants';

type ViewMode = 'all' | 'wishlist';

// Renamed and refined for handleSubmitQuiz logic.
const QUIZ_EXPERIENCE_TAG_MAPPING = [
  {
    id: 'experience', // Corresponds to answers.experience
    options: [
      { label: 'A deep story to get lost in', value: 'story', tags: ['story-rich', 'singleplayer', 'atmospheric', 'rpg', 'narrative', 'choices-matter'] },
      { label: 'Something to play with friends', value: 'multiplayer', tags: ['multiplayer', 'co-op', 'online-co-op', 'local-multiplayer', 'shared-screen-co-op', 'mmorpg', 'party-game'] },
      { label: 'A quick, action-packed game', value: 'action', tags: ['action', 'fast-paced', 'shooter', 'arcade', 'roguelike', 'bullet-hell', 'hack-and-slash'] },
      { label: 'A challenging strategic experience', value: 'strategy', tags: ['difficult', 'strategy', 'rts', 'turn-based-strategy', 'puzzle', 'tactical', '4x', 'grand-strategy'] },
      { label: 'Something relaxing and creative', value: 'relaxing', tags: ['casual', 'simulation', 'building', 'family-friendly', 'sandbox', 'life-sim', 'cozy', 'crafting', 'farming-sim'] },
    ],
  },
];


const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [allWishlistGames, setAllWishlistGames] = useState<GameDetails[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSurpriseMeLoading, setIsSurpriseMeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTermGlobal, setSearchTermGlobal] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); 
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [platforms, setPlatforms] = useState<PlatformCore[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]); 
  
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null); 
  const [selectedReleaseYear, setSelectedReleaseYear] = useState<string | null>(null); 
  const [selectedOrdering, setSelectedOrdering] = useState<string>(DEFAULT_ORDERING);

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [recentlyViewedGames, setRecentlyViewedGames] = useState<RecentlyViewedGame[]>([]);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false); // State for Quiz Modal

  useEffect(() => {
    setWishlist(StorageService.getWishlist());
    setRecentlyViewedGames(StorageService.getRecentlyViewedGames());
  }, []);

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (window.scrollY > 0 && !selectedGameId && !isQuizModalOpen) { 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewMode === 'wishlist') {
      if (wishlist.length === 0) {
        setGames([]);
        setAllWishlistGames([]);
        setTotalPages(0);
        setIsLoading(false);
        return;
      }
      try {
        const wishlistGameIds = allWishlistGames.map(g => g.id);
        const needsUpdate = wishlist.some(id => !wishlistGameIds.includes(id)) || allWishlistGames.length !== wishlist.length;

        if (needsUpdate) {
            const wishlistDetailsPromises = wishlist.map(id => 
                fetchGameDetails(id).then(detail => ({...detail, isFavorite: true}))
            );
            const detailedWishlistGames = await Promise.all(wishlistDetailsPromises);
            setAllWishlistGames(detailedWishlistGames);
            const paginatedWishlistGames = detailedWishlistGames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
            setGames(paginatedWishlistGames);
            setTotalPages(Math.ceil(detailedWishlistGames.length / PAGE_SIZE));
        } else {
            const paginatedWishlistGames = allWishlistGames.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
            setGames(paginatedWishlistGames);
            setTotalPages(Math.ceil(allWishlistGames.length / PAGE_SIZE));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wishlist details.');
        setGames([]);
        setAllWishlistGames([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    } else { 
      try {
        // Determine ordering: if there's a search term, RAWG default relevance. Otherwise, user selection.
        // If no search term and no specific user selection (e.g. after find similar), use selectedOrdering (which might be -rating)
        const currentOrdering = activeSearchTerm ? ORDERING_OPTIONS[0].value : selectedOrdering;
        
        let datesParam;
        if (selectedReleaseYear) {
            const years = selectedReleaseYear.split('-');
            if (years.length === 1) { 
                datesParam = `${years[0]}-01-01,${years[0]}-12-31`;
            } else if (years.length === 2) { 
                datesParam = `${years[0]}-01-01,${years[1]}-12-31`;
            }
        }
        
        // For tags, we expect a slug. RAWG API takes tag slugs directly for 'tags' param.
        // No need to find ID if selectedTag is already a slug.
        const tagParam = selectedTag || undefined;


        const params: any = { 
          page: currentPage, 
          page_size: PAGE_SIZE,
          ordering: currentOrdering,
          tags: tagParam, 
          dates: datesParam,
        };
        if (activeSearchTerm) params.search = activeSearchTerm;
        if (selectedGenre) params.genres = selectedGenre;
        if (selectedPlatform) params.platforms = selectedPlatform;
        
        const data = await fetchGames(params);
        const gamesWithFavStatus = data.results.map(game => ({
          ...game,
          isFavorite: wishlist.includes(game.id)
        }));
        setGames(gamesWithFavStatus);
        setTotalPages(Math.ceil(data.count / PAGE_SIZE));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setGames([]); 
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentPage, activeSearchTerm, selectedGenre, selectedPlatform, selectedTag, selectedReleaseYear, selectedOrdering, viewMode, wishlist, allWishlistGames, selectedGameId, allTags, isQuizModalOpen]); 

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [genresData, platformsData, tagsData] = await Promise.all([
          fetchGenres(),
          fetchPlatforms(),
          fetchTags(1, 50) 
        ]);
        setGenres(genresData.results);
        setPlatforms(platformsData.results);
        setAllTags(tagsData.results);
      } catch (err) {
        console.error("Failed to load filters:", err);
         setError("Failed to load filter options. Some functionalities might be limited.");
      }
    };
    loadFiltersData();
  }, []);

  const handleSearch = useCallback((term: string) => {
    setActiveSearchTerm(term);
    setCurrentPage(1); 
    if (term) {
      setSelectedOrdering(ORDERING_OPTIONS[0].value); // relevance for search
    } else {
      setSelectedOrdering(DEFAULT_ORDERING); 
    }
    setViewMode('all'); 
  }, []);

  const handleClearSearch = useCallback(() => {
    setActiveSearchTerm('');
    setSearchTermGlobal(''); 
    setCurrentPage(1);
    setSelectedOrdering(DEFAULT_ORDERING);
    setViewMode('all');
  }, []);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string | null>>) => (value: string | null) => {
    setter(value);
    setCurrentPage(1);
    setViewMode('all'); 
    // When a filter changes, if there's no active search term, ensure ordering is not stuck on 'relevance'
    if (!activeSearchTerm) {
        setSelectedOrdering(DEFAULT_ORDERING); // Or keep current selectedOrdering if it's not relevance
    }
  };
  
  const handleOrderingChange = (orderingValue: string) => {
    setSelectedOrdering(orderingValue);
    setCurrentPage(1);
    setViewMode('all'); 
  };

  const handleViewDetails = (gameId: number) => {
    setSelectedGameId(gameId); 

    let gameDataForStorage: Game | GameDetails | undefined;
    gameDataForStorage = games.find(g => g.id === gameId);
    if (!gameDataForStorage) {
      gameDataForStorage = allWishlistGames.find(g => g.id === gameId);
    }

    if (gameDataForStorage) {
      StorageService.addRecentlyViewedGame(gameDataForStorage);
      setRecentlyViewedGames(StorageService.getRecentlyViewedGames());
    } else {
      fetchGameDetails(gameId).then(details => { 
        StorageService.addRecentlyViewedGame(details); 
        setRecentlyViewedGames(StorageService.getRecentlyViewedGames());
      }).catch(err => {
        console.error(`Error fetching details for game ${gameId} to add to recently viewed:`, err);
      });
    }
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setSelectedGameId(null);
    document.body.style.overflow = '';
  };

  const handleToggleWishlist = (gameId: number, gameDetailsForRecent?: GameDetails | Game) => {
    const isInWishlist = wishlist.includes(gameId);
    let updatedWishlist;
    if (isInWishlist) {
      StorageService.removeFromWishlist(gameId);
      updatedWishlist = wishlist.filter(id => id !== gameId);
    } else {
      StorageService.addToWishlist(gameId);
      updatedWishlist = [...wishlist, gameId];
      if (gameDetailsForRecent) {
         StorageService.addRecentlyViewedGame(gameDetailsForRecent);
         setRecentlyViewedGames(StorageService.getRecentlyViewedGames());
      }
    }
    setWishlist(updatedWishlist);

    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId ? { ...game, isFavorite: !isInWishlist } : game
      )
    );
    
    // Update allWishlistGames if the game is from there or being added/removed
     setAllWishlistGames(prevAll => {
        if (isInWishlist) { // Removing
            return prevAll.filter(g => g.id !== gameId);
        } else { // Adding
            if (gameDetailsForRecent && !prevAll.find(g => g.id === gameId)) {
                 // Ensure it's a GameDetails type with isFavorite true
                const gameDetailWithFav = { ...gameDetailsForRecent, isFavorite: true } as GameDetails;
                return [...prevAll, gameDetailWithFav];
            }
            return prevAll;
        }
    });

    if (viewMode === 'wishlist') {
        if (isInWishlist && games.filter(g => g.id !== gameId).length === 0 && currentPage > 1) {
            setCurrentPage(currentPage -1); 
        } else {
            loadGames(); 
        }
    }
  };
  
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1); 
    if (mode === 'all' && activeSearchTerm) {
         setSelectedOrdering(ORDERING_OPTIONS[0].value);
    } else if (mode === 'all' && !activeSearchTerm) {
        setSelectedOrdering(DEFAULT_ORDERING);
    }
  };

  const handleResetFilters = () => {
    setSearchTermGlobal(''); 
    setActiveSearchTerm('');
    setSelectedGenre(null);
    setSelectedPlatform(null);
    setSelectedTag(null);
    setSelectedReleaseYear(null);
    setSelectedOrdering(DEFAULT_ORDERING);
    setCurrentPage(1);
    setViewMode('all'); 
  };

  const handleSurpriseMe = async () => {
    setIsSurpriseMeLoading(true);
    setError(null);
    try {
      const randomGame = await fetchRandomGame({
        genre: selectedGenre,
        platform: selectedPlatform,
        tag: selectedTag,
        year: selectedReleaseYear,
        allTags: allTags,
      });
      if (randomGame) {
        // Clear current filters to show the surprised game details cleanly
        // Or, we can just open the modal directly
        handleViewDetails(randomGame.id);
      } else {
        setError("Couldn't find a surprising game with current criteria. Try broadening your filters!");
      }
    } catch (err) {
      console.error("Surprise Me Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch a random game.");
    } finally {
      setIsSurpriseMeLoading(false);
    }
  };

  // Quiz Modal Handlers
  const handleOpenQuizModal = () => {
    setIsQuizModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
    document.body.style.overflow = '';
  };

  const handleSubmitQuiz = async (answers: QuizAnswers): Promise<Game[] | null> => {
    const params: any = {
      page_size: 5, // Show top 5 recommendations
      ordering: '-metacritic,-rating', // Default ordering
    };

    if (answers.genres.length > 0) params.genres = answers.genres.join(',');
    if (answers.platforms.length > 0) params.platforms = answers.platforms.join(',');

    let tagsToApply: string[] = [];
    const experienceMapping = QUIZ_EXPERIENCE_TAG_MAPPING.find(q => q.id === 'experience');
    const selectedExperienceOption = experienceMapping?.options?.find(opt => opt.value === answers.experience);
    
    if (selectedExperienceOption?.tags) {
        tagsToApply = [...tagsToApply, ...selectedExperienceOption.tags];
    }
        
    if (tagsToApply.length > 0) {
        const tagSlugsForApi = tagsToApply.join(',');
        params.tags = tagSlugsForApi;
    }
    
    const now = new Date();
    if (answers.age === 'new') {
      const lastYear = now.getFullYear() - 1;
      params.dates = `${lastYear}-01-01,${now.toISOString().split('T')[0]}`;
      params.ordering = '-released,-metacritic,-rating'; 
    } else if (answers.age === 'recent') {
      const fiveYearsAgo = now.getFullYear() - 5;
      params.dates = `${fiveYearsAgo}-01-01,${now.toISOString().split('T')[0]}`;
    }

    try {
      const data = await fetchGames(params);
      const gamesWithFavStatus = data.results.map(game => ({
        ...game,
        isFavorite: wishlist.includes(game.id)
      }));
      return gamesWithFavStatus;
    } catch (err) {
      console.error("Error fetching quiz recommendations:", err);
      throw err; 
    }
  };

  const handleFindSimilar = (genreSlug: string | null, gameName: string | null) => {
    setSearchTermGlobal(gameName || ''); // Update displayed search term
    setActiveSearchTerm(gameName || '');   // Update actual search term for API
    setSelectedGenre(genreSlug);
    
    // Reset other filters for a broader similar search
    setSelectedPlatform(null);
    setSelectedTag(null); // Ensure tag is reset as we are using game name and genre primarily
    setSelectedReleaseYear(null);
    
    // If a gameName is provided, we are effectively searching, so relevance is key.
    // The loadGames function automatically prioritizes relevance if activeSearchTerm is present.
    // Setting it here ensures the Navbar also reflects this choice.
    if (gameName) {
      setSelectedOrdering(ORDERING_OPTIONS[0].value); // '-relevance'
    } else {
      // Fallback, though gameName should always be present in this flow
      setSelectedOrdering(DEFAULT_ORDERING); 
    }
    
    setCurrentPage(1);
    setViewMode('all');
    // loadGames will be triggered by useEffect due to state changes
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900 text-slate-200 flex flex-col">
      <Navbar 
        searchTermGlobal={searchTermGlobal}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        genres={genres}
        platforms={platforms}
        tags={allTags} 
        releaseYears={RELEASE_YEAR_OPTIONS as ReleaseYearOption[]}
        selectedGenre={selectedGenre}
        onGenreChange={handleFilterChange(setSelectedGenre)}
        selectedPlatform={selectedPlatform}
        onPlatformChange={handleFilterChange(setSelectedPlatform)}
        selectedTag={selectedTag}
        onTagChange={handleFilterChange(setSelectedTag)}
        selectedReleaseYear={selectedReleaseYear}
        onReleaseYearChange={handleFilterChange(setSelectedReleaseYear)}
        selectedOrdering={selectedOrdering}
        onOrderingChange={handleOrderingChange}
        onResetFilters={handleResetFilters}
        viewMode={viewMode}
        onSetViewMode={handleSetViewMode}
        wishlistCount={wishlist.length}
        onSurpriseMe={handleSurpriseMe}
        isSurpriseMeLoading={isSurpriseMeLoading}
        onOpenQuiz={handleOpenQuizModal} 
      />
      {recentlyViewedGames.length > 0 && viewMode === 'all' && !isQuizModalOpen && (
        <RecentlyViewed games={recentlyViewedGames} onViewDetails={handleViewDetails} />
      )}
      <main className="container mx-auto p-4 flex-grow">
        <GameGrid 
          games={games} 
          isLoading={isLoading || isSurpriseMeLoading} 
          error={error}
          onViewDetails={handleViewDetails}
          onToggleWishlist={handleToggleWishlist}
          viewMode={viewMode}
        />
        {!isLoading && !isSurpriseMeLoading && !error && games.length > 0 && totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
      {selectedGameId && (
        <GameDetailModal 
            gameId={selectedGameId} 
            onClose={handleCloseModal} 
            onToggleWishlist={handleToggleWishlist}
            isFavoriteInitial={wishlist.includes(selectedGameId)}
            onViewDetails={handleViewDetails} 
            onFindSimilar={handleFindSimilar} // Pass the updated handler
        />
      )}
      {isQuizModalOpen && (
        <QuizModal
          isOpen={isQuizModalOpen}
          onClose={handleCloseQuizModal}
          genres={genres}
          platforms={platforms}
          onSubmitQuiz={handleSubmitQuiz}
          onViewDetails={handleViewDetails}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
        />
      )}
      <ScrollToTopButton /> {/* Added ScrollToTopButton */}
      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-700/30 mt-auto">
        Powered by <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer" className="text-fuchsia-500 hover:text-fuchsia-400 hover:underline">RAWG API</a>. 
        Game data and images are copyright of their respective owners. Site by Asier Núñez.
      </footer>
    </div>
  );
};

export default App;
// Note: The QUIZ_QUESTIONS array that was previously here for handleSubmitQuiz logic
// has been moved to the top of the file, renamed to QUIZ_EXPERIENCE_TAG_MAPPING, 
// and refined for better tag associations.
// The QuizModal.tsx component still defines its own QUIZ_QUESTIONS for rendering the UI.
// This separation allows the submission logic to use an optimized mapping without
// directly altering QuizModal.tsx's internal structure for this specific change.
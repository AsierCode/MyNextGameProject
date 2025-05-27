import React, { useState, useEffect } from 'react';
import { SearchIcon, ORDERING_OPTIONS, ResetIcon, DEFAULT_ORDERING, HeartIconOutline, ClearSearchIcon, RELEASE_YEAR_OPTIONS, SurpriseMeIcon, QuizIcon, MenuIcon, CloseIcon } from '../constants';
import { Genre, PlatformCore, Tag, ReleaseYearOption } from '../types';
import FilterDropdown from './FilterDropdown';

interface NavbarProps {
  searchTermGlobal: string;
  onSearch: (term: string) => void;
  onClearSearch: () => void;
  genres: Genre[];
  platforms: PlatformCore[];
  tags: Tag[]; 
  releaseYears: ReleaseYearOption[];
  selectedGenre: string | null;
  onGenreChange: (genreSlug: string | null) => void;
  selectedPlatform: string | null;
  onPlatformChange: (platformId: string | null) => void;
  selectedTag: string | null; 
  onTagChange: (tagSlug: string | null) => void; 
  selectedReleaseYear: string | null; 
  onReleaseYearChange: (yearValue: string | null) => void; 
  selectedOrdering: string;
  onOrderingChange: (orderingValue: string) => void;
  onResetFilters: () => void;
  viewMode: 'all' | 'wishlist';
  onSetViewMode: (mode: 'all' | 'wishlist') => void;
  wishlistCount: number;
  onSurpriseMe: () => void;
  isSurpriseMeLoading: boolean;
  onOpenQuiz: () => void; // New prop to open quiz modal
}

const Navbar: React.FC<NavbarProps> = ({ 
  searchTermGlobal,
  onSearch, 
  onClearSearch,
  genres, 
  platforms,
  tags,
  releaseYears,
  selectedGenre,
  onGenreChange,
  selectedPlatform,
  onPlatformChange,
  selectedTag,
  onTagChange,
  selectedReleaseYear,
  onReleaseYearChange,
  selectedOrdering,
  onOrderingChange,
  onResetFilters,
  viewMode,
  onSetViewMode,
  wishlistCount,
  onSurpriseMe,
  isSurpriseMeLoading,
  onOpenQuiz
}) => {
  const [searchTermLocal, setSearchTermLocal] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSearchTermLocal(searchTermGlobal);
  }, [searchTermGlobal]);

  useEffect(() => {
    if (viewMode === 'all') { 
        const delayDebounceFn = setTimeout(() => {
          onSearch(searchTermLocal);
        }, 500); 
        return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTermLocal, onSearch, viewMode]);

  const handleClearInput = () => {
    setSearchTermLocal('');
    onClearSearch();
  };

  const platformItems = platforms.map(p => ({ id: p.id, name: p.name, slug: String(p.id) }));
  const tagItems = tags.map(t => ({id: t.id, name: t.name, slug: t.slug}));
  const releaseYearItems = releaseYears.map(y => ({id: y.value, name: y.label, slug: y.value}));
  const orderingItems = ORDERING_OPTIONS.map(o => ({id: o.value, name: o.label, slug: o.value}));

  const isFilteringDisabled = viewMode === 'wishlist';

  const navButtonBaseClass = "px-3 sm:px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 text-sm shadow-sm hover:shadow-md w-full sm:w-auto text-center"; // Added w-full sm:w-auto
  const navButtonActiveClass = "bg-fuchsia-600 text-white hover:bg-fuchsia-500 focus-visible:ring-fuchsia-500 hover:shadow-fuchsia-500/30";
  const navButtonInactiveClass = "bg-slate-700 hover:bg-slate-600 text-slate-200 focus-visible:ring-fuchsia-500 hover:shadow-fuchsia-500/30";
  
  const isDefaultState = !searchTermGlobal && !selectedGenre && !selectedPlatform && !selectedTag && !selectedReleaseYear && selectedOrdering === DEFAULT_ORDERING;
  const canReset = viewMode === 'wishlist' || (viewMode === 'all' && !isDefaultState);


  return (
    <nav className="bg-slate-800/80 backdrop-blur-md p-4 shadow-lg sticky top-0 z-30 border-b-2 border-fuchsia-600/30" aria-label="Main navigation and filters">
      <div className="container mx-auto">
        {/* Row for Title and Hamburger button */}
        <div className="flex items-center justify-between mb-3 lg:mb-0"> {/* Adjusted mb for lg */}
          <a href="/" className="text-3xl font-bold hover:opacity-90 transition-opacity font-heading group" aria-label="MyNextGame Home">
            <span className="text-gradient-fuchsia group-hover:brightness-110 transition-all">MyNextGame</span>
          </a>
          <div className="lg:hidden"> {/* Hamburger button only on <lg screens */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-fuchsia-500"
              aria-controls="mobile-menu-content"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              {isMobileMenuOpen ? CloseIcon : MenuIcon }
            </button>
          </div>
        </div>

        {/* Collapsible Content Area */}
        <div
          id="mobile-menu-content"
          className={`${isMobileMenuOpen ? 'block animate-fadeInSlow' : 'hidden'} lg:block mt-4 lg:mt-0`} // Added mt for mobile view
        >
          {/* Original "actions and search" row - adjusted for mobile stacking */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            {/* Container for All Buttons (View Mode & Actions) */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* View Mode Buttons Group */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                    onClick={() => { onSetViewMode('all'); setIsMobileMenuOpen(false); }}
                    className={`${navButtonBaseClass} ${viewMode === 'all' ? navButtonActiveClass : navButtonInactiveClass}`}
                    aria-pressed={viewMode === 'all'}
                    >
                    All Games
                    </button>
                    <button 
                    onClick={() => { onSetViewMode('wishlist'); setIsMobileMenuOpen(false); }}
                    className={`${navButtonBaseClass} ${viewMode === 'wishlist' ? navButtonActiveClass : navButtonInactiveClass} flex items-center justify-center gap-1.5`}
                    aria-pressed={viewMode === 'wishlist'}
                    >
                    <span className="text-rose-400 group-hover:text-rose-300">{HeartIconOutline}</span> Wishlist 
                    {wishlistCount > 0 && <span className="bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">{wishlistCount}</span>}
                    </button>
                </div>
                {/* Action Buttons Group */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                    onClick={() => { onSurpriseMe(); setIsMobileMenuOpen(false); }}
                    disabled={isSurpriseMeLoading}
                    className={`${navButtonBaseClass} bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-purple-600 focus-visible:ring-purple-400 hover:shadow-purple-500/30`}
                    aria-label="Surprise me with a random game"
                    >
                    <SurpriseMeIcon />
                    <span>Surprise Me!</span>
                    </button>
                    <button
                    onClick={() => { onOpenQuiz(); setIsMobileMenuOpen(false); }}
                    className={`${navButtonBaseClass} bg-teal-500 hover:bg-teal-400 text-white flex items-center justify-center gap-1.5 focus-visible:ring-teal-400 hover:shadow-teal-500/30`}
                    aria-label="Find my next game quiz"
                    >
                    {QuizIcon}
                    <span>Find My Next Game</span>
                    </button>
                </div>
            </div>
            
            {/* Search Input */}
            <div className={`w-full lg:w-auto lg:max-w-xs xl:max-w-sm relative mt-4 lg:mt-0 ${isFilteringDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                {SearchIcon}
              </div>
              <input
                type="search"
                placeholder="Search for games..."
                aria-label="Search for games"
                className="w-full bg-slate-700 text-slate-200 placeholder-slate-400 rounded-md py-2.5 px-4 pl-10 pr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 transition-colors border border-transparent focus:border-fuchsia-600/70"
                value={searchTermLocal}
                onChange={(e) => setSearchTermLocal(e.target.value)}
                disabled={isFilteringDisabled}
              />
              {searchTermLocal && !isFilteringDisabled && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-full"
                  aria-label="Clear search"
                >
                  {ClearSearchIcon}
                </button>
              )}
            </div>
          </div>

          {/* Filters row */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end ${isFilteringDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
            <FilterDropdown
                label="Genre"
                items={genres}
                selectedValue={selectedGenre}
                onValueChange={onGenreChange} // Menu auto-close not handled here to keep FilterDropdown simpler
                placeholder="All Genres"
                disabled={isFilteringDisabled}
            />
            <FilterDropdown
                label="Platform"
                items={platformItems}
                selectedValue={selectedPlatform}
                onValueChange={onPlatformChange}
                placeholder="All Platforms"
                disabled={isFilteringDisabled}
            />
            <FilterDropdown
                label="Tags"
                items={tagItems}
                selectedValue={selectedTag}
                onValueChange={onTagChange}
                placeholder="All Tags"
                disabled={isFilteringDisabled}
            />
            <FilterDropdown
                label="Release Year"
                items={releaseYearItems}
                selectedValue={selectedReleaseYear}
                onValueChange={onReleaseYearChange}
                placeholder="Any Year"
                disabled={isFilteringDisabled}
            />
             <FilterDropdown
                label="Sort By"
                items={orderingItems}
                selectedValue={selectedOrdering}
                onValueChange={(value) => onOrderingChange(value || (searchTermLocal ? ORDERING_OPTIONS[0].value : DEFAULT_ORDERING) )}
                placeholder="Default"
                disabled={isFilteringDisabled}
            />
            <div className="w-full sm:col-span-2 lg:col-span-1">
                {/* Visible label for mobile for consistency with FilterDropdown labels */}
                <label htmlFor="reset-filters-button" className="text-sm text-slate-400 mb-1 block font-heading lg:hidden">Reset Filters</label>
                {/* Invisible label for desktop to maintain vertical alignment if FilterDropdown labels take up space */}
                <label htmlFor="reset-filters-button" className="text-sm text-slate-400 mb-1 block invisible font-heading hidden lg:block">Reset Filters</label>
                
                <button
                    id="reset-filters-button"
                    onClick={() => { onResetFilters(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-rose-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/30"
                    aria-label="Reset all filters and search"
                    disabled={!canReset} 
                >
                    {ResetIcon}
                    <span className="ml-2">Reset</span>
                </button>
            </div>
          </div>
        </div> {/* End of collapsible content */}
      </div>
    </nav>
  );
};

export default Navbar;
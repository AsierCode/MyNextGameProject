import { WISHLIST_KEY, RECENTLY_VIEWED_KEY, MAX_RECENTLY_VIEWED } from '../constants';
import { RecentlyViewedGame, GameDetails, Game } from '../types'; // Added Game here

// Wishlist stores an array of game IDs
export const getWishlist = (): number[] => {
  try {
    const wishlistJson = localStorage.getItem(WISHLIST_KEY);
    return wishlistJson ? JSON.parse(wishlistJson) : [];
  } catch (error) {
    console.error("Error reading wishlist from localStorage:", error);
    return [];
  }
};

export const addToWishlist = (gameId: number): void => {
  try {
    const wishlist = getWishlist();
    if (!wishlist.includes(gameId)) {
      const updatedWishlist = [...wishlist, gameId];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
    }
  } catch (error) {
    console.error("Error adding to wishlist in localStorage:", error);
  }
};

export const removeFromWishlist = (gameId: number): void => {
  try {
    const wishlist = getWishlist();
    const updatedWishlist = wishlist.filter(id => id !== gameId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));
  } catch (error) {
    console.error("Error removing from wishlist in localStorage:", error);
  }
};

export const isGameInWishlist = (gameId: number): boolean => {
  try {
    const wishlist = getWishlist();
    return wishlist.includes(gameId);
  } catch (error) {
    console.error("Error checking wishlist in localStorage:", error);
    return false;
  }
};

// Recently Viewed Games (stores basic info for direct display)
export const getRecentlyViewedGames = (): RecentlyViewedGame[] => {
  try {
    const recentlyViewedJson = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return recentlyViewedJson ? JSON.parse(recentlyViewedJson) : [];
  } catch (error) {
    console.error("Error reading recently viewed games from localStorage:", error);
    return [];
  }
};

export const addRecentlyViewedGame = (game: GameDetails | Game): void => {
  try {
    let recentlyViewed = getRecentlyViewedGames();
    // Remove if already exists to move to front
    recentlyViewed = recentlyViewed.filter(g => g.id !== game.id);
    
    const newEntry: RecentlyViewedGame = {
        id: game.id,
        name: game.name,
        slug: game.slug,
        background_image: game.background_image,
    };

    recentlyViewed.unshift(newEntry); // Add to the beginning

    if (recentlyViewed.length > MAX_RECENTLY_VIEWED) {
      recentlyViewed = recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);
    }
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error("Error adding to recently viewed in localStorage:", error);
  }
};

export interface PlatformCore {
  id: number;
  name: string;
  slug: string;
}

export interface ParentPlatform {
  platform: PlatformCore;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count?: number; // Optional, as not always needed/returned for simple lists
  image_background?: string; // Optional
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  language?: string; // Optional
  games_count?: number; // Optional
  image_background?: string; // Optional
}

export interface ShortScreenshot {
  id: number;
  image: string;
}

export interface StoreInfo {
  id: number;
  name: string;
  slug: string;
}
export interface Store {
  id: number;
  store: StoreInfo;
  url: string;
}

export interface MovieClipData {
  '480': string;
  max: string;
}

export interface MovieClip {
  id: number;
  name: string;
  preview: string;
  data: MovieClipData;
}

export interface Game {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  tba: boolean;
  background_image: string | null;
  rating: number;
  rating_top: number;
  ratings_count: number;
  reviews_text_count: string; 
  added: number;
  metacritic: number | null;
  playtime: number;
  suggestions_count: number;
  updated: string;
  parent_platforms: ParentPlatform[];
  genres: Genre[];
  tags: Tag[]; // Ensure Game has tags for details
  short_screenshots: ShortScreenshot[];
  stores: Store[]; 
  isFavorite?: boolean;
}

export interface Developer {
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
}

export interface Publisher {
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
}

export interface GameDetails extends Game {
  description_raw: string;
  website: string | null;
  developers: Developer[];
  publishers: Publisher[];
  esrb_rating: { id: number; name: string; slug: string } | null;
  clips: MovieClip[]; // For game trailers
  // tags property inherited from Game
}

export interface GameSuggestion { // For similar games
    id: number;
    slug: string;
    name: string;
    background_image: string | null;
    added: number;
}


export interface RAWGResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface OrderingOption {
  value: string;
  label: string;
}

export interface ReleaseYearOption {
  value: string; // e.g., "2023" or "2020-2024"
  label: string; // e.g., "2023" or "2020-2024"
}

export interface RecentlyViewedGame {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
}
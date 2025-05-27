
import { RAWG_API_KEY, RAWG_BASE_URL, PAGE_SIZE } from '../constants';
import { Game, GameDetails, Genre, PlatformCore, RAWGResponse, Tag, GameSuggestion, MovieClip } from '../types';

interface FetchGamesParams {
  page?: number;
  search?: string;
  genres?: string; 
  platforms?: string; 
  tags?: string; // Comma-separated tag IDs or slugs
  dates?: string; // YYYY-MM-DD,YYYY-MM-DD
  ordering?: string;
  pageSize?: number;
  metacritic?: string; // e.g. "80,100"
}

const buildUrl = (path: string, params: Record<string, string | number | undefined>): string => {
  const url = new URL(`${RAWG_BASE_URL}${path}`);
  url.searchParams.append('key', RAWG_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};

// Helper function for improved error handling
const handleApiError = async (response: Response, pathForContext: string = ''): Promise<Error> => {
  let errorDetailMessage = `Failed to fetch from ${pathForContext || 'API'}. HTTP Status: ${response.status} ${response.statusText || ''}`.trim();
  let specificErrorParsed = false; // Flag to track if a specific error message was parsed from the body
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      let specificError = '';
      if (typeof errorData === 'string') {
        specificError = errorData;
      } else if (errorData && typeof errorData.detail === 'string') {
        specificError = errorData.detail;
      } else if (errorData && typeof errorData.message === 'string') { // Some APIs use 'message'
        specificError = errorData.message;
      } else if (errorData && Array.isArray(errorData.errors) && errorData.errors.length > 0 && typeof errorData.errors[0] === 'object' && typeof errorData.errors[0].message === 'string') { // For array of error objects like { message: '...', field: '...' }
          specificError = errorData.errors[0].message;
      } else if (errorData && Array.isArray(errorData.errors) && errorData.errors.length > 0 && typeof errorData.errors[0] === 'string') { // For array of error strings
          specificError = errorData.errors[0];
      } else if (errorData) {
        try {
          // Attempt to stringify, but keep it concise if it's a large object
          const stringified = JSON.stringify(errorData);
          specificError = stringified.length > 200 ? stringified.substring(0, 200) + "..." : stringified;
        } catch { /* ignore stringify error, specificError remains empty */ }
      }
      
      if (specificError) {
        errorDetailMessage = specificError;
        specificErrorParsed = true;
      }
    } else {
      const textError = await response.text();
      // Avoid using long HTML pages as error messages.
      if (textError && textError.length > 0 && textError.length < 500 && !textError.trim().toLowerCase().startsWith('<!doctype html>') && !textError.trim().toLowerCase().startsWith('<html>')) {
        errorDetailMessage = textError;
        specificErrorParsed = true;
      }
    }
  } catch (e) {
    // This catch is for errors during parsing of the error response body (e.g., response.json() or response.text() failing)
    console.error(`Failed to parse error response body for ${pathForContext}:`, e);
    // errorDetailMessage remains the initial HTTP status based one
  }

  if (response.status === 401) {
    const lowerErrorDetail = errorDetailMessage.toLowerCase();
    // Check if the current message already explains an auth issue
    const authKeywords = ['key', 'token', 'authentication', 'credentials', 'unauthorized', 'auth'];
    const alreadyHasAuthInfo = authKeywords.some(keyword => lowerErrorDetail.includes(keyword));

    if (!alreadyHasAuthInfo) {
         errorDetailMessage += " (HTTP 401 Unauthorized: This typically indicates an issue with API authentication, e.g., an invalid/expired API key or insufficient permissions for the RAWG API.)";
    }
  }

  return new Error(errorDetailMessage);
};


export const fetchGames = async (params: FetchGamesParams): Promise<RAWGResponse<Game>> => {
  const queryParams: Record<string, string | number | undefined> = {
    page: params.page || 1,
    page_size: params.pageSize || PAGE_SIZE,
    search: params.search || undefined,
    genres: params.genres || undefined,
    platforms: params.platforms || undefined,
    tags: params.tags || undefined,
    dates: params.dates || undefined,
    ordering: params.ordering || undefined,
    metacritic: params.metacritic || undefined,
  };
  
  if (params.search && !params.ordering) { // If search is active and no specific ordering is provided, RAWG defaults to relevance.
    delete queryParams.ordering; 
  }

  const url = buildUrl('/games', queryParams);
  const response = await fetch(url);
  if (!response.ok) {
    throw await handleApiError(response, '/games');
  }
  return response.json() as Promise<RAWGResponse<Game>>;
};

export const fetchGameDetails = async (id: number | string): Promise<GameDetails> => {
  const url = buildUrl(`/games/${id}`, {});
  const response = await fetch(url);
  if (!response.ok) {
    throw await handleApiError(response, `/games/${id}`);
  }
  const details = await response.json() as GameDetails;
  try {
    const moviesResponse = await fetchGameMovies(id);
    details.clips = moviesResponse.results;
  } catch (movieError) {
    console.warn(`Could not fetch movies for game ${id}:`, movieError);
    details.clips = []; 
  }
  return details;
};

export const fetchGameMovies = async (id: number | string): Promise<RAWGResponse<MovieClip>> => {
  const url = buildUrl(`/games/${id}/movies`, {});
  const response = await fetch(url);
  if (!response.ok) {
     if (response.status === 404) { 
      return { count: 0, next: null, previous: null, results: [] };
    }
    throw await handleApiError(response, `/games/${id}/movies`);
  }
  return response.json() as Promise<RAWGResponse<MovieClip>>;
};


export const fetchGameSuggestions = async (id: number | string): Promise<RAWGResponse<GameSuggestion>> => {
  const url = buildUrl(`/games/${id}/suggested`, {page_size: 6});
  const response = await fetch(url);
   if (!response.ok) {
    if (response.status === 404) {
      return { count: 0, next: null, previous: null, results: [] };
    }
    throw await handleApiError(response, `/games/${id}/suggested`);
  }
  return response.json() as Promise<RAWGResponse<GameSuggestion>>;
};

export const fetchGenres = async (): Promise<RAWGResponse<Genre>> => {
  const url = buildUrl('/genres', { page_size: 40 });
  const response = await fetch(url);
  if (!response.ok) {
    throw await handleApiError(response, '/genres');
  }
  return response.json() as Promise<RAWGResponse<Genre>>;
};

export const fetchPlatforms = async (): Promise<RAWGResponse<PlatformCore>> => {
  const url = buildUrl('/platforms/lists/parents', { page_size: 20 });
  const response = await fetch(url);
  if (!response.ok) {
    throw await handleApiError(response, '/platforms/lists/parents');
  }
  return response.json() as Promise<RAWGResponse<PlatformCore>>;
};

export const fetchTags = async (page: number = 1, pageSize: number = 40): Promise<RAWGResponse<Tag>> => {
  const url = buildUrl('/tags', { page_size: pageSize, page: page, ordering: '-games_count' });
  const response = await fetch(url);
  if (!response.ok) {
    throw await handleApiError(response, '/tags');
  }
  return response.json() as Promise<RAWGResponse<Tag>>;
};

export const fetchRandomGame = async (
  activeFilters: { genre?: string | null; platform?: string | null; tag?: string | null; year?: string | null, allTags?: Tag[] }
): Promise<Game | null> => {
  
  const params: FetchGamesParams = {
    pageSize: 40, 
    ordering: '-metacritic,-rating', 
    metacritic: '75,100', 
  };

  if (activeFilters.genre) params.genres = activeFilters.genre;
  if (activeFilters.platform) params.platforms = activeFilters.platform;
  if (activeFilters.tag) params.tags = activeFilters.tag;

  if (activeFilters.year) {
     const years = activeFilters.year.split('-');
     if (years.length === 1) params.dates = `${years[0]}-01-01,${years[0]}-12-31`;
     else if (years.length === 2) params.dates = `${years[0]}-01-01,${years[1]}-12-31`;
  }
  
  let initialResponse;
  try {
    initialResponse = await fetchGames({ ...params, pageSize: 1, page: 1 });
  } catch (error) {
     console.error("Error fetching count for random game:", error);
     throw error; 
  }
  
  const totalGames = initialResponse.count;

  if (totalGames === 0) return null;

  // RAWG API limit: "page" may not be larger than 10000 / page_size. Max page effectively 250 for page_size=40
  const apiMaxPage = Math.floor(10000 / (params.pageSize || PAGE_SIZE));
  const maxPageForRandom = Math.min(Math.ceil(totalGames / (params.pageSize || PAGE_SIZE)), apiMaxPage, 250); // Further cap at 250 as a general safe RAWG limit
  
  if (maxPageForRandom <= 0) return null; // Should not happen if totalGames > 0, but defensive.

  const randomPage = Math.floor(Math.random() * maxPageForRandom) + 1;
  params.page = randomPage;

  let gamesResponse;
  try {
    gamesResponse = await fetchGames(params);
  } catch (error) {
    console.error("Error fetching page for random game:", error);
    throw error; 
  }

  if (gamesResponse.results && gamesResponse.results.length > 0) {
    const randomIndex = Math.floor(Math.random() * gamesResponse.results.length);
    return gamesResponse.results[randomIndex];
  }
  return null;
};

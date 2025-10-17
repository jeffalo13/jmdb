const { VITE_TMDB_API_KEY, VITE_TMDB_ACCESS_KEY } = import.meta.env;

if (!VITE_TMDB_API_KEY) {
  throw new Error("Missing VITE_TMDB_API_KEY");
}
if (!VITE_TMDB_ACCESS_KEY) {
  throw new Error("Missing VITE_TMDB_ACCESS_KEY");
}

export const TMDB_KEY = VITE_TMDB_API_KEY as string;
export const TMDB_V4_BEARER = VITE_TMDB_ACCESS_KEY as string;
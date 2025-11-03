// src/utils/api/getMovieByImdbId.ts
import type { Movie } from "../../types/movie";
import { tmdbGetMovieByImdbId } from "./tmdb";

export async function getMovieByTmdbId(tmdbID: number, signal?: AbortSignal): Promise<Movie> {
  const m = await tmdbGetMovieByImdbId(tmdbID, signal);
  if (m) return m;

  // placeholder if TMDb has no match (or no API key yet)
  return {
   tmdbID: NaN,
    title: tmdbID.toString(),
    year: NaN,
    genres: [],
    flavors: [],
    actors: [],
    crew: [],
    altPosters: [],
    backdropUrl: "",
    keywords: [],
    plot: "",
    posterUrl: "",
    tagline: "",
    runtime: NaN,
    dateAdded: NaN
  };
}

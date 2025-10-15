// src/utils/api/getMovieByImdbId.ts
import type { Movie } from "../../types/movie";
import { tmdbGetMovieByImdbId } from "./tmdb";

export async function getMovieByImdbId(imdbId: string, signal?: AbortSignal): Promise<Movie> {
  const m = await tmdbGetMovieByImdbId(imdbId, signal);
  if (m) return m;

  // placeholder if TMDb has no match (or no API key yet)
  return {
    id: imdbId,
    imdbId,
    title: imdbId,
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
    tagline: ""
  };
}

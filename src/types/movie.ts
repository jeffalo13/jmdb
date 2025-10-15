export type SortKey = "alpha" | "year" | "runtime";

export interface Movie {
  id: string;       // local id (use imdbId)
  imdbId: string;
  title: string;
  year: number;
  genres: string[];
  flavors: string[];
  keywords: string[];
  actors: string[];
  crew: string[];
  plot: string;
  posterUrl: string;
  backdropUrl: string;
  altPosters: string[];
  tagline: string;
  runtime: number;
}

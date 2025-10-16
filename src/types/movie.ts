export type SortKey = "alpha" | "year" | "runtime";

export interface Movie {
  tmdbID: number;     
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

export type SortKey = "alpha" | "year";

export interface Movie {
  id: string;       // local id (use imdbId)
  imdbId: string;
  title: string;
  year: number;
  genres: string[];
  flavors: string[];
  keywords: string[];
  actors: string[];
  plot: string;
  posterUrl: string;
  backdropUrl: string;
  altPosters: string[];
}

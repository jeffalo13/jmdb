import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../types/movie";
import { getMovieByImdbId as tmdbGet } from "../utils/api/tmdb";

export function useLoadMovies(ids: string[]) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const controller = useMemo(() => new AbortController(), [ids.join(",")]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErrors({});
      try {
        const results: Movie[] = [];
        for (const id of ids) {
          try {
            const m = await tmdbGet(id, controller.signal);
            if (m) { results.push(m); continue; }
            throw new Error("Not found on TMDb");
          } catch (e: any) {
            results.push({
              id, imdbId: id, title: id, year: NaN,
              genres: [], flavors: [], actors: [], keywords: [],
              plot: "", posterUrl: ""
            });
            setErrors(prev => ({ ...prev, [id]: e?.message ?? "error" }));
          }
        }
        if (!cancelled) setMovies(results);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; controller.abort(); };
  }, [ids, controller]);

  return { movies, loading, errors };
}

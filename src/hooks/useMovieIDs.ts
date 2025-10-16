import { useEffect, useMemo, useState } from "react";

const TMDB_V4_BEARER =
  (import.meta.env.VITE_TMDB_ACCESS_KEY as string | undefined) ||
  (import.meta.env.VITE_TMDB_ACCESS_KEY as string | undefined); // fallback if you renamed it

const TMDB_ACCOUNT_ID = 22384729; // your account id
const TMDB_BASE = "https://api.themoviedb.org/3";

type TmdbMovie = { id: number };
type FavPage = { page: number; total_pages: number; results: TmdbMovie[] };

export function useMovieIDs() {
  const [movieIDs, setMovieIDs] = useState<number[]>([]);
  const [loadingIDs, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);

      try {
        if (!TMDB_V4_BEARER) {
          throw new Error("Missing VITE_TMDB_ACCESS_KEY (v4 Bearer token).");
        }

        const headers = {
          Authorization: `Bearer ${TMDB_V4_BEARER}`,
          Accept: "application/json",
          "Content-Type": "application/json;charset=utf-8",
        };

        // First page
        const firstUrl =
          `${TMDB_BASE}/account/${TMDB_ACCOUNT_ID}/favorite/movies` +
          `?language=en-US&page=1&sort_by=created_at.asc`;
        const r1 = await fetch(firstUrl, { headers, cache: "no-store" });
        if (!r1.ok) throw new Error(`TMDb HTTP ${r1.status}`);
        const p1 = (await r1.json()) as FavPage;

        const ids: number[] = (p1.results ?? [])
          .map((m) => m.id)
          .filter((n) => Number.isFinite(n));

        // Remaining pages
        const totalPages = p1.total_pages ?? 1;
        for (let page = 2; page <= totalPages; page++) {
          const url =
            `${TMDB_BASE}/account/${TMDB_ACCOUNT_ID}/favorite/movies` +
            `?language=en-US&page=${page}&sort_by=created_at.asc`;
          const r = await fetch(url, { headers, cache: "no-store" });
          if (!r.ok) throw new Error(`TMDb HTTP ${r.status}`);
          const pj = (await r.json()) as FavPage;
          (pj.results ?? []).forEach((m) => {
            if (typeof m.id === "number") ids.push(m.id);
          });
        }

        setMovieIDs(ids);
      } catch (e) {
        setError(e as Error);
        setMovieIDs([]);
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { movieIDs, loadingIDs, error, reload };
}

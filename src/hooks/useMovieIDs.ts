import { useCallback, useEffect, useState } from "react";

// Configure your API base, e.g. VITE_API_BASE="https://tesseract-api.com"
const API_BASE = `https://tesseract-api.com/v1/`

// Your TMDB account id (can also be made a prop or env)
const TMDB_ACCOUNT_ID = 22384729;

// ---- types (unchanged) ----
type TmdbMovie = { id: number };
type FavPage = { page: number; total_pages: number; results: TmdbMovie[] };

type MovieId = number;
type OrderIndex = number;


export function useMovieIDs() {
  // key = TMDB movie id, value = order index in date-added ASC list
  const [movieIDs, setMovieIDs] = useState<Map<MovieId, OrderIndex>>(new Map());
  const [loadingIDs, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!API_BASE) {
        throw new Error("Missing VITE_API_BASE for your backend.");
      }
      if (TMDB_ACCOUNT_ID == null) {
        throw new Error("Missing TMDB_ACCOUNT_ID.");
      }

      const base = API_BASE.replace(/\/$/, "");
      const endpoint = `${base}/tmdb/tmdb-account-favorites-get`;
      const mkUrl = (page: number) =>
        `${endpoint}?accountId=${encodeURIComponent(String(TMDB_ACCOUNT_ID))}` +
        `&language=en-US&page=${page}&sort_by=created_at.asc`;

      // Build the map with continuous indexing across pages
      const map = new Map<MovieId, OrderIndex>();

      // First page
      const r1 = await fetch(mkUrl(1), { method: "GET", cache: "no-store" });
      if (!r1.ok) throw new Error(`API HTTP ${r1.status}`);
      const p1 = (await r1.json()) as FavPage;

      let idx = 0;
      for (const [i, m] of (p1.results ?? []).entries()) {
        if (typeof m.id === "number") {
          map.set(m.id, idx + i);
        }
      }
      idx += (p1.results ?? []).length;

      // Remaining pages
      const totalPages = p1.total_pages ?? 1;
      for (let page = 2; page <= totalPages; page++) {
        const r = await fetch(mkUrl(page), { method: "GET", cache: "no-store" });
        if (!r.ok) throw new Error(`API HTTP ${r.status}`);
        const pj = (await r.json()) as FavPage;

        for (const [i, m] of (pj.results ?? []).entries()) {
          if (typeof m.id === "number") {
            map.set(m.id, idx + i);
          }
        }
        idx += (pj.results ?? []).length;
      }

      // Commit a new Map instance to trigger state change
      setMovieIDs(map);
    } catch (e) {
      setError(e as Error);
      setMovieIDs(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { movieIDs, loadingIDs, error, reload };
}
import { useEffect, useMemo, useState } from "react";

// Configure your API base, e.g. VITE_API_BASE="https://tesseract-api.com"
const API_BASE = `https://tesseract-api.com/v1/`

// Your TMDB account id (can also be made a prop or env)
const TMDB_ACCOUNT_ID = 22384729;

// ---- types (unchanged) ----
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
        if (!API_BASE) {
          throw new Error("Missing VITE_API_BASE for your backend.");
        }

        const base = API_BASE.replace(/\/$/, "");
        const endpoint = `${base}/tmdb/tmdb-account-favorites-get`;

        // First page
        const firstUrl =
          `${endpoint}?accountId=${encodeURIComponent(String(TMDB_ACCOUNT_ID))}` +
          `&language=en-US&page=1&sort_by=created_at.asc`;

        const r1 = await fetch(firstUrl, { method: "GET", cache: "no-store" });
        if (!r1.ok) throw new Error(`API HTTP ${r1.status}`);
        const p1 = (await r1.json()) as FavPage;

        const ids: number[] = (p1.results ?? [])
          .map((m) => m.id)
          .filter((n) => Number.isFinite(n));

        // Remaining pages (frontend keeps the logic)
        const totalPages = p1.total_pages ?? 1;
        for (let page = 2; page <= totalPages; page++) {
          const url =
            `${endpoint}?accountId=${encodeURIComponent(String(TMDB_ACCOUNT_ID))}` +
            `&language=en-US&page=${page}&sort_by=created_at.asc`;

          const r = await fetch(url, { method: "GET", cache: "no-store" });
          if (!r.ok) throw new Error(`API HTTP ${r.status}`);
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

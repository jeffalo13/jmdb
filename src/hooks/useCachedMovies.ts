// src/hooks/useCachedMovies.ts
import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../types/movie";
import { getMovieByImdbId } from "../utils/api/getMovieByImdbID";

// Basic localStorage cache with TTL
const CACHE_PREFIX = "mlib:v16:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 1; // 1 hour

type CacheRecord = { movie: Movie; ts: number };
const key = (id: string) => `${CACHE_PREFIX}${id}`;

function readCache(id: string): Movie | null {
  try {
    const raw = localStorage.getItem(key(id));
    if (!raw) return null;
    const data = JSON.parse(raw) as CacheRecord;
    if (!data?.movie || !data?.ts) return null;
    if (Date.now() - data.ts > CACHE_TTL_MS) return null;
    return data.movie;
  } catch {
    return null;
  }
}

function writeCache(id: string, movie: Movie) {
  try {
    const payload: CacheRecord = { movie, ts: Date.now() };
    localStorage.setItem(key(id), JSON.stringify(payload));
  } catch {
    // ignore in dev
  }
}

export function useCachedMovies(ids: string[]) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep dependency stable (avoids re-runs if array identity changes)
  const idSig = useMemo(() => ids.join(","), [ids]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        // 1) start with whatever we already have cached
        const cached: Movie[] = [];
        const toFetch: string[] = [];
        for (const id of ids) {
          const c = readCache(id);
          if (c) cached.push(c);
          else toFetch.push(id);
        }
        if (alive) setMovies(cached);

        // 2) fetch remaining in parallel; ignore aborts
        const fetched = await Promise.all(
          toFetch.map(async (id) => {
            try {
              const m = await getMovieByImdbId(id, controller.signal);
              writeCache(id, m);
              return m;
            } catch (e: any) {
              if (e?.name === "AbortError") return null; // ignore
              console.error("Fetch failed for", id, e);
              return null;
            }
          })
        );

        if (!alive) return;
        const newOnes = fetched.filter(Boolean) as Movie[];
        if (newOnes.length) {
          // Merge: preserve order of ids
          const byId = new Map<string, Movie>();
          [...cached, ...newOnes].forEach((m) => byId.set(m.imdbId, m));
          setMovies(ids.map((id) => byId.get(id)).filter(Boolean) as Movie[]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort(); // triggers AbortError in in-flight fetches; we ignore above
    };
  }, [idSig]); // stable dependency

  return { movies, loading };
}

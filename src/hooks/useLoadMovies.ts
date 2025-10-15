import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../types/movie";
import { getMovieByImdbId } from "../utils/api/getMovieByImdbID";

// ----- config
const CACHE_PREFIX = "mlib:v25:";               // bump when cache shape changes
const IDS_SIG_KEY = `${CACHE_PREFIX}@ids-sig`;  // normalized list signature

// ----- helpers
const norm = (s: string) => s.trim().toLowerCase();
const cacheKey = (id: string) => `${CACHE_PREFIX}${norm(id)}`;
const normalizeIds = (ids: string[]) => ids.map(norm).sort().join(",");

type CacheRecord = { movie: Movie };

function readCache(id: string): Movie | null {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    if (!raw) return null;
    const data = JSON.parse(raw) as CacheRecord;
    return data?.movie ?? null;
  } catch {
    return null;
  }
}

function writeCache(id: string, movie: Movie) {
  try {
    localStorage.setItem(cacheKey(id), JSON.stringify({ movie } satisfies CacheRecord));
  } catch {}
}

function listCachedIds(): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(CACHE_PREFIX) && !k.endsWith("@ids-sig")) {
      out.push(k.replace(CACHE_PREFIX, ""));
    }
  }
  return out;
}

function pruneCache(keepIds: Set<string>) {
  for (const cachedId of listCachedIds()) {
    if (!keepIds.has(cachedId)) {
      localStorage.removeItem(`${CACHE_PREFIX}${cachedId}`);
    }
  }
}

// ----- hook
export function useLoadMovies(ids: string[]) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovieInfo, setLoadingMovieInfo] = useState<boolean>(true);

  // stable signal for deps
  const sig = useMemo(() => normalizeIds(ids), [ids]);

useEffect(() => {
  let alive = true;
  const controller = new AbortController();

  (async () => {
    setLoadingMovieInfo(true);

    // ✅ 1) Empty list => no work, no signature churn
    if (!ids || ids.length === 0) {
      if (alive) {
        setMovies([]);
        setLoadingMovieInfo(false);
      }
      return;
    }

    const prevSig = localStorage.getItem(IDS_SIG_KEY);
    const sameList = prevSig === sig;

    // ✅ 2) First run / missing signature, but cache already has this exact set
    if (!sameList && !sig) {
      const cached = ids.map(id => readCache(id)).filter(Boolean) as Movie[];
      if (cached.length === ids.length) {
        if (alive) {
          setMovies(orderToIds(ids, cached));
          localStorage.setItem(IDS_SIG_KEY, sig);       // bootstrap signature
          pruneCache(new Set(ids.map(norm)));           // tidy up
          setLoadingMovieInfo(false);
        }
        return; // skip network
      }
      // else: fall through to full refresh
    }

    // Existing behavior
    if (sameList) {
      const cached = ids.map(id => readCache(id)).filter(Boolean) as Movie[];
      if (cached.length === ids.length) {
        if (alive) {
          setMovies(orderToIds(ids, cached));
          setLoadingMovieInfo(false);
        }
        return;
      }
      // cache incomplete -> refresh all
    }

    // List changed OR cache incomplete -> fetch all


    const fetched = await Promise.all(
      ids.map(async (id) => {
        try {
          const m = await getMovieByImdbId(id, controller.signal);
          console.log("api call made")
          writeCache(id, m);
          return m;
        } catch { return null; }
      })
    );

    if (!alive) return;

    const moviesNow = (fetched.filter(Boolean) as Movie[]);
    setMovies(orderToIds(ids, moviesNow));
    localStorage.setItem(IDS_SIG_KEY, sig);
    pruneCache(new Set(ids.map(norm)));
    setLoadingMovieInfo(false);
  })();

  return () => { alive = false; controller.abort(); };
}, [sig, ids]);


  return { movies, loadingMovieInfo };
}

// Preserve the caller's order of ids
function orderToIds(ids: string[], list: Movie[]): Movie[] {
  const byId = new Map<string, Movie>();
  for (const m of list) byId.set(norm(m.imdbId), m);
  return ids.map(id => byId.get(norm(id))).filter(Boolean) as Movie[];
}

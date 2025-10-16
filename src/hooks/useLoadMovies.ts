import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../types/movie";
import { getMovieByImdbId } from "../utils/api/getMovieByImdbID";

// ----- config
const CACHE_PREFIX = "mlib:v30:";               // bump when cache shape changes
const IDS_SIG_KEY = `${CACHE_PREFIX}@ids-sig`;  // normalized list signature

// ----- helpers
const norm = (s: string) => s.trim().toLowerCase();
const cacheKey = (id: string) => `${CACHE_PREFIX}${norm(id)}`;
const normalizeIds = (ids: string[]) => ids.map(norm).sort().join(",");

// NEW: stronger cache record with ok + timestamp
type CacheRecord = { ok: true; ts: number; movie: Movie };

// NEW: minimal runtime validation for a Movie
function isValidMovie(m: any, expectedId?: string): m is Movie {
  if (!m || typeof m !== "object") return false;
  // ensure core identity exists
  if (!m.imdbId || typeof m.imdbId !== "string") return false;
  if (expectedId && norm(m.imdbId) !== norm(expectedId)) return false;
  // pick a couple of fields that should always exist in your shape
  // (adjust these to match your real Movie type guarantees)
  if (!m.title || typeof m.title !== "string") return false;
  return true;
}

function readCache(id: string): Movie | null {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    if (!raw) return null;

    const data = JSON.parse(raw) as Partial<CacheRecord>;

    // validate shape + TTL + movie content
    if (!data || data.ok !== true || typeof data.ts !== "number") return null;
    if (!isValidMovie((data as CacheRecord).movie, id)) return null;

    return (data as CacheRecord).movie;
  } catch {
    return null;
  }
}

// CHANGED: only write if valid; else clear any bad cache
function writeCache(id: string, movie: Movie) {
  try {
    if (!isValidMovie(movie, id)) {
      localStorage.removeItem(cacheKey(id));
      return;
    }
    const rec: CacheRecord = { ok: true, ts: Date.now(), movie };
    localStorage.setItem(cacheKey(id), JSON.stringify(rec));
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

      // 1) Empty list => no work
      if (!ids || ids.length === 0) {
        if (alive) {
          setMovies([]);
          setLoadingMovieInfo(false);
        }
        return;
      }

      const prevSig = localStorage.getItem(IDS_SIG_KEY) ?? "";
      const sameList = prevSig === sig;

      // Try cache first (only valid entries count)
      const cachedValid = ids
        .map(id => readCache(id))
        .filter((m): m is Movie => !!m);

      if (sameList && cachedValid.length === ids.length) {
        if (alive) {
          setMovies(orderToIds(ids, cachedValid));
          setLoadingMovieInfo(false);
        }
        return;
      }

      // Fetch only missing/invalid ones (don’t nuke good cache)
      const needIds = ids.filter((id) => !readCache(id));

      // If we have some valid cache, use it immediately for a fast paint
      if (cachedValid.length > 0 && alive) {
        setMovies(orderToIds(ids, cachedValid));
      }

      // Fetch the gaps
      const fetchedPairs = await Promise.all(
        needIds.map(async (id) => {
          try {
            const m = await getMovieByImdbId(id, controller.signal);
            console.log('made api call')
            if (isValidMovie(m, id)) {
              writeCache(id, m);
              return [id, m] as const;
            } else {
              // ensure we don’t keep a poisoned cache
              localStorage.removeItem(cacheKey(id));
              return null;
            }
          } catch {
            // on failure, remove any existing bad cache so we’ll retry next time
            localStorage.removeItem(cacheKey(id));
            return null;
          }
        })
      );

      if (!alive) return;

      const fetched = fetchedPairs
        .filter(Boolean)
        .map(p => (p as readonly [string, Movie])[1]);

      const allNow = [
        ...cachedValid,
        ...fetched,
      ];

      // Only consider “complete” if we truly have all valid movies
      const complete = allNow.length === ids.length;

      if (complete) {
        localStorage.setItem(IDS_SIG_KEY, sig);
        pruneCache(new Set(ids.map(norm)));
      } else {
        // don’t advance signature; keeps us in “refresh” mode next run
      }

      setMovies(orderToIds(ids, allNow));
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

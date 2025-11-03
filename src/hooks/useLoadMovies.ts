import { useEffect, useState } from "react";
import type { Movie } from "../types/movie";
import { getMovieByTmdbId } from "../utils/api/getMovieByImdbID";

const REQ_TIMEOUT_MS = 12_000;
const CACHE_KEY = "mlib:v4:movieset"; // bump version to invalidate all

type CacheRecord = {
  ok: true;
  idsSig: string;       // exact, order-preserving "1,2,3"
  idsCount: number;     // quick guard
  movies: Movie[];      // ordered to match idsSig
  ts: number;
};

const getSignature = (ids: number[]) => (ids?.length ? ids.join(",") : "");

function toNum(x: unknown): number | undefined {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string" && x.trim() && !Number.isNaN(+x)) return +x;
  return undefined;
}

function isValidMovie(m: any, expectedId?: number | string): m is Movie {
  if (!m || typeof m !== "object") return false;
  const rawId = (m as any).tmdbID ?? (m as any).tmdbId ?? (m as any).id;
  const tmdbID = toNum(rawId);
  if (tmdbID === undefined) return false;
  const title = (m as any).title;
  if (typeof title !== "string" || !title) return false;
  const exp = typeof expectedId === "string" ? toNum(expectedId) : expectedId;
  return exp === undefined ? true : tmdbID === exp;
}

async function withTimeout<T>(p: Promise<T>, ms: number, aborter: AbortController): Promise<T> {
  let t: number | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, rej) => {
        t = window.setTimeout(() => {
          aborter.abort();
          rej(new Error("Request timeout"));
        }, ms);
      }),
    ]);
  } finally {
    if (t) window.clearTimeout(t);
  }
}

function orderToIds(ids: number[], list: Movie[]): Movie[] {
  const byId = new Map<number, Movie>();
  for (const m of list) {
    const id = toNum((m as any).tmdbID ?? (m as any).tmdbId ?? (m as any).id);
    if (id !== undefined) byId.set(id, m);
  }
  return ids.map((id) => byId.get(id)).filter(Boolean) as Movie[];
}

// -------- single-key cache I/O --------
function readCache(ids: number[], sigExact: string): Movie[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw) as CacheRecord | null;
    if (!rec || rec.ok !== true) return null;

    // Use ONLY if the stored signature matches exactly (same ids, same order)
    if (rec.idsSig !== sigExact) return null;
    if (rec.idsCount !== ids.length) return null;
    if (!Array.isArray(rec.movies) || rec.movies.length !== ids.length) return null;

    for (let i = 0; i < ids.length; i++) {
      if (!isValidMovie(rec.movies[i], ids[i])) return null;
    }
    return rec.movies;
  } catch {
    return null;
  }
}

function writeCache(ids: number[], sigExact: string, movies: Movie[]) {
  try {
    if (movies.length !== ids.length) return; // never cache partials
    for (let i = 0; i < ids.length; i++) {
      if (!isValidMovie(movies[i], ids[i])) return;
    }
    const rec: CacheRecord = {
      ok: true,
      idsSig: sigExact,
      idsCount: ids.length,
      movies,
      ts: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(rec));
  } catch {
    /* ignore */
  }
}

export function useLoadMovies(movieIDsRaw: Map<number, number>) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovieInfo, setLoadingMovieInfo] = useState(true);

  const ids = Array.from(movieIDsRaw.keys());

  const sigExact = getSignature(ids);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    (async () => {
      setLoadingMovieInfo(true);

      if (!ids || ids.length === 0) {
        if (alive) {
          setMovies([]);
          setLoadingMovieInfo(false);
        }
        return;
      }

      // 1) strict single-key cache
      const cached = readCache(ids, sigExact);
      if (cached && alive) {
        setMovies(cached);
        setLoadingMovieInfo(false);
        return;
      }

      // 2) fetch ALL ids; no partial writes
      const pairs = await Promise.all(
        ids.map(async (id) => {
          const perIdAbort = new AbortController();
          const onAbort = () => perIdAbort.abort();
          controller.signal.addEventListener("abort", onAbort, { once: true });

          try {
            const m = await withTimeout(getMovieByTmdbId(id, perIdAbort.signal), REQ_TIMEOUT_MS, perIdAbort);
            m.dateAdded = movieIDsRaw.get(m.tmdbID) as number;
            // console.log('made api call')
            if (isValidMovie(m, id)) return [id, m] as const;
          } catch {
            // ignore; treat as miss
          } finally {
            controller.signal.removeEventListener?.("abort", onAbort as any);
          }
          return null;
        })
      );

      if (!alive) return;

      const fetched = pairs.filter(Boolean).map((p) => (p as readonly [number, Movie])[1]);
      const ordered = orderToIds(ids, fetched);

      setMovies(ordered);
      setLoadingMovieInfo(false);

      if (ordered.length === ids.length) {
        writeCache(ids, sigExact, ordered);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [sigExact]); // depends on content signature, not array ref

  return { movies, loadingMovieInfo };
}

import { useEffect, useMemo, useState } from "react";
import type { Movie } from "../types/movie";
// NOTE: your import path says getMovieByImdbID; make sure the fn name & path match:
import { getMovieByTmdbId } from "../utils/api/getMovieByImdbID"; // <-- verify this!

// ----- config
const REQ_TIMEOUT_MS = 12_000; // safeguard against hung requests

// ----- helpers
function isValidMovie(m: any, expectedId?: string | number): m is Movie {
  // if (!m || typeof m !== "object") return false;
  // if (!m.tmdbID || typeof m.tmdbID !== "number") return false;
  // if (expectedId && m.tmdbID !== expectedId) return false;
  // if (!m.title || typeof m.title !== "string") return false;
  // return true;\  const isObject = !!m && typeof m === "object";
  const isObject = !!m && typeof m === "object";
  const tmdbID = isObject ? (m as any).tmdbID : undefined;
  const hasTmdbId = typeof tmdbID === "number";
  const expectedIDParsed = typeof expectedId === "string" ? parseInt(expectedId) : expectedId
  const matchesExpectedId = expectedIDParsed === undefined ? true : tmdbID === expectedIDParsed;
  const title = isObject ? (m as any).title : undefined;
  const hasTitle = typeof title === "string";

  return isObject && hasTmdbId && matchesExpectedId && hasTitle;
}

// per-request timeout wrapper
async function withTimeout<T>(p: Promise<T>, ms: number, aborter: AbortController): Promise<T> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => {
          aborter.abort();
          reject(new Error("Request timeout"));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

// preserve caller-provided order
function orderToIds(ids: number[], list: Movie[]): Movie[] {
  const byId = new Map<number, Movie>();
  for (const m of list) byId.set(m.tmdbID, m);
  return ids.map(id => byId.get(id)).filter(Boolean) as Movie[];
}

export function useLoadMovies(ids: number[]) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovieInfo, setLoadingMovieInfo] = useState<boolean>(true);

  // changing the list should trigger a fresh fetch
  const sig = useMemo(() => ids.slice().sort((a,b)=>a-b).join(","), [ids]);

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

      // Fetch ALL ids every time (no cache)
      const fetchedPairs = await Promise.all(
        ids.map(async (id: number) => {
          const perIdAbort = new AbortController();
          controller.signal.addEventListener("abort", () => perIdAbort.abort(), { once: true });

          try {
            const m = await withTimeout(
              getMovieByTmdbId(id, perIdAbort.signal),
              REQ_TIMEOUT_MS,
              perIdAbort
            );
            console.log("made api call")
            if (isValidMovie(m, id)) {
              return [id, m] as const;
            }
          } catch {
            // swallow; we'll treat as a miss below
          }
          return null;
        })
      );

      if (!alive) return;

      const fetched = fetchedPairs.filter(Boolean).map(p => (p as readonly [number, Movie])[1]);
      const ordered = orderToIds(ids, fetched);

      // If some failed, you'll see partial results; adjust if you prefer "all-or-nothing"
      setMovies(ordered);
      setLoadingMovieInfo(false);
    })();

    return () => { alive = false; controller.abort(); };
  }, [sig]); // depends on sorted signature of ids

  return { movies, loadingMovieInfo };
}

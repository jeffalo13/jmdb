// useFindTmdbIds.ts
import { useCallback, useEffect, useRef, useState } from "react";

export type UseFindTmdbIdsOptions = {
  apiKey?: string;          // override if you don't use Vite env or window.TMDB_KEY
  concurrency?: number;     // parallel requests (default 5)
  retry?: number;           // retries on 429/5xx/network (default 2)
  signal?: AbortSignal;     // optional external abort
};

type Lookup = { imdbId: string; tmdbId: number | null; error?: string };

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_RETRY = 2;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Simple hook:
 *   input  -> imdbIds: ["tt0111161", "tt0068646", ...]
 *   output -> tmdbIds: [278, 238, ...]   // aligned by index; null if not found/error
 */
export function useFindTmdbIds(
  imdbIds: string[] | null,
  options?: UseFindTmdbIdsOptions
) {
  const {
    apiKey = (import.meta as any).env?.VITE_TMDB_KEY ?? (window as any).TMDB_KEY,
    concurrency = DEFAULT_CONCURRENCY,
    retry = DEFAULT_RETRY,
    signal: externalSignal,
  } = options || {};

  const [tmdbIds, setTmdbIds] = useState<(number | null)[]>([]);
  const [loadingIDs, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // internal map (not exposed) so we can fill results out-of-order,
  // then project to an ordered array matching imdbIds
  const resultsRef = useRef<Record<string, Lookup>>({});
  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const lookupOne = async (imdbId: string, signal?: AbortSignal): Promise<Lookup> => {
    const base = "https://api.themoviedb.org/3";
    const url = `${base}/find/${encodeURIComponent(imdbId)}?external_source=imdb_id&api_key=${encodeURIComponent(
      apiKey || ""
    )}`;

    let attempts = 0;
    let lastErr: string | undefined;

    while (attempts <= retry) {
      if (signal?.aborted) return { imdbId, tmdbId: null, error: "aborted" };
      try {
        const resp = await fetch(url, { signal });
        if (resp.status === 429) {
          const backoff = Math.pow(2, attempts) * 500;
          await new Promise((r) => setTimeout(r, backoff));
          attempts++;
          lastErr = `429 rate limited (attempt ${attempts})`;
          continue;
        }
        if (!resp.ok) {
          const txt = await resp.text().catch(() => resp.statusText);
          lastErr = `HTTP ${resp.status}: ${txt}`;
          if (resp.status >= 500 && attempts < retry) {
            attempts++;
            const backoff = Math.pow(2, attempts) * 300;
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }
          return { imdbId, tmdbId: null, error: lastErr };
        }

        const data = await resp.json();
        // Prefer movie, then tv, then person
        const id =
          (Array.isArray(data.movie_results) && data.movie_results[0]?.id) ??
          (Array.isArray(data.tv_results) && data.tv_results[0]?.id) ??
          (Array.isArray(data.person_results) && data.person_results[0]?.id) ??
          null;

        return { imdbId, tmdbId: id };
      } catch (e: any) {
        if (e?.name === "AbortError") return { imdbId, tmdbId: null, error: "aborted" };
        lastErr = e?.message ?? String(e);
        if (attempts < retry) {
          attempts++;
          const backoff = Math.pow(2, attempts) * 300;
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        return { imdbId, tmdbId: null, error: lastErr };
      }
    }
    return { imdbId, tmdbId: null, error: "unknown error" };
  };

  const run = useCallback(
    async (force?: string[] | null) => {
      const ids = (force ?? imdbIds) ?? [];
      if (!ids.length) {
        setTmdbIds([]);
        setProgress({ done: 0, total: 0 });
        setLoading(false);
        setError(null);
        return;
      }
      if (!apiKey) {
        setError(
          "TMDB API key missing. Pass { apiKey } to the hook, set VITE_TMDB_KEY, or define window.TMDB_KEY."
        );
        return;
      }

      abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const mergedSignal = controller.signal;

      if (externalSignal) {
        if (externalSignal.aborted) controller.abort();
        else {
          const onExt = () => controller.abort();
          externalSignal.addEventListener("abort", onExt);
          mergedSignal.addEventListener("abort", () => externalSignal.removeEventListener("abort", onExt));
        }
      }

      resultsRef.current = {};
      setLoading(true);
      setError(null);
      setProgress({ done: 0, total: ids.length });
      setTmdbIds(Array(ids.length).fill(null)); // pre-size output

      const batches = chunk(ids, concurrency);

      try {
        for (const batch of batches) {
          if (mergedSignal.aborted) break;

          await Promise.all(
            batch.map(async (imdbId) => {
              const res = await lookupOne(imdbId, mergedSignal);
              resultsRef.current[imdbId] = res;
              // project to ordered array position(s)
              setProgress((p) => ({ ...p, done: p.done + 1 }));
            })
          );

          // after each batch, rebuild ordered array (cheap)
          setTmdbIds(() => ids.map((id) => resultsRef.current[id]?.tmdbId ?? null));
        }
      } catch (e: any) {
        if (e?.name === "AbortError") setError("aborted");
        else setError(String(e));
      } finally {
        setLoading(false);
        controllerRef.current = null;
        // final projection
        setTmdbIds(ids.map((id) => resultsRef.current[id]?.tmdbId ?? null));
      }
    },
    [imdbIds, apiKey, concurrency, retry, abort, externalSignal]
  );

  useEffect(() => {
    if (!imdbIds || imdbIds.length === 0) {
      setTmdbIds([]);
      setProgress({ done: 0, total: 0 });
      setLoading(false);
      setError(null);
      return;
    }
    run().catch((e) => setError(String(e)));
    return () => abort();
  }, [imdbIds, run, abort]);

  const refetch = useCallback(() => run(null), [run]);

  return {
    tmdbIds,     // <-- THIS is what you want: [number|null] in same order as imdbIds
    loadingIDs,
    progress,    // { done, total }
    error,
    refetch,
    abort,
  };
}

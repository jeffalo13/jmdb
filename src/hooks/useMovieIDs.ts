import { useEffect, useMemo, useRef, useState } from "react";

type JsonShape =
    | string[]                                      // ["tt123", ...]
    | { imdbID: string }[]                          // [{ imdbID: "tt123" }, ...]
    | Record<string, unknown>;                      // { "tt123": {...} } or { "tt123": "tt123", ...}

/** Extract imdb IDs from a few common JSON shapes */
function normalizeToIds(json: JsonShape): string[] {
    if (Array.isArray(json)) {
        if (json.length === 0) return [];
        if (typeof json[0] === "string") return json as string[];
        // array of objects with imdbID
        return (json as Array<{ imdbID?: string }>)
            .map(o => (o && typeof o === "object" ? o.imdbID : undefined))
            .filter((v): v is string => typeof v === "string");
    }
    // object map: keys are ids, or values equal ids
    const entries = Object.entries(json);
    const idsFromKeys = entries.map(([k]) => k).filter(k => k.startsWith("tt"));
    const idsFromValues = entries
        .map(([, v]) => (typeof v === "string" && v.startsWith("tt") ? v : undefined))
        .filter((v): v is string => !!v);
    return idsFromKeys.length >= idsFromValues.length ? idsFromKeys : idsFromValues;
}

export function useMovieIDs(
    url = "https://jmdb-movie-list.s3.us-east-1.amazonaws.com/movies.json"
) {
    const [movieIDs, setMovieIDs] = useState<string[]>([]);
    const [loadingIDs, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const urlRef = useRef(url);

    const reload = useMemo(() => {
        return async () => {
            setLoading(true);
            setError(null);
            const ac = new AbortController();
            try {
                const res = await fetch(urlRef.current, {
                    // avoid stale content while you iterate
                    cache: "no-store",
                    signal: ac.signal
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = (await res.json()) as JsonShape;
                setMovieIDs(normalizeToIds(json));
            } catch (e) {
                setError(e as Error);
                setMovieIDs([]);
            } finally {
                setLoading(false);
            }
            return () => ac.abort();
        };
    }, []);

    useEffect(() => {
        urlRef.current = url;
        // fire and forget
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    return { movieIDs, loadingIDs, error, reload };
}

import type { Movie } from "../../types/movie";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const TMDB_BASE = "https://api.themoviedb.org/3";
const img = (p?: string | null) => (p ? `https://image.tmdb.org/t/p/w500${p}` : "");
const norm = (s: string) => s.trim().toLowerCase();
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export async function tmdbGetMovieByImdbId(imdbId: string, signal?: AbortSignal): Promise<Movie | null> {
  if (!TMDB_KEY) return null;

  // Find TMDb id
  const findUrl = `${TMDB_BASE}/find/${encodeURIComponent(imdbId)}?external_source=imdb_id&api_key=${TMDB_KEY}`;
  const r1 = await fetch(findUrl, { signal });
  if (!r1.ok) return null;
  const d1 = await r1.json();
  const tmdbId: number | undefined = d1?.movie_results?.[0]?.id;
  if (!tmdbId) return null;

  // Details + credits + keywords
  const detUrl = `${TMDB_BASE}/movie/${tmdbId}?append_to_response=credits,keywords&api_key=${TMDB_KEY}`;
  const r2 = await fetch(detUrl, { signal });
  if (!r2.ok) return null;
  const d = await r2.json();

  const rawKeywords: string[] = (d?.keywords?.keywords ?? [])
    .map((k: { name?: string }) => k?.name)
    .filter(Boolean)
    .map((s: string) => norm(s));

  return {
    id: imdbId,
    imdbId,
    title: d?.title ?? imdbId,
    year: d?.release_date ? Number(String(d.release_date).slice(0, 4)) : NaN,
    genres: (d?.genres ?? []).map((g: { name?: string }) => g?.name).filter(Boolean) as string[],
    keywords: uniq(rawKeywords),   // <-- all keywords, normalized + deduped
    flavors: [],                   // <-- leave empty for now
    actors: (d?.credits?.cast ?? []).slice(0, 10).map((c: { name?: string }) => c?.name).filter(Boolean) as string[],
    plot: d?.overview ?? "",
    posterUrl: img(d?.poster_path),
  };
}

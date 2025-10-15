import type { Movie } from "../../types/movie";
import {getFlavorsForKeywords} from "../../data/flavorMappings"

type TmdbImageSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const TMDB_BASE = "https://api.themoviedb.org/3";
const norm = (s: string) => s.trim().toLowerCase();
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const img = (path?: string | null, size: TmdbImageSize = "w500"): string =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

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


    // Primary poster
  const primaryPoster = img(d?.poster_path, "w500");

  const backdropUrl = img(d?.backdrop_path, "original");

    // Alternative posters (sorted by vote_count desc then width desc)
  const posters: string[] = (d?.images?.posters ?? [])
    .slice()
    .sort((a: any, b: any) => (b?.vote_count || 0) - (a?.vote_count || 0) || (b?.width || 0) - (a?.width || 0))
    .map((p: any) => img(p?.file_path, "w500"))
    .filter(Boolean);

  const altPosters = uniq(posters.filter((u: string) => u !== primaryPoster)).slice(0, 4);

  const rawKeywords: string[] = (d?.keywords?.keywords ?? [])
    .map((k: { name?: string }) => k?.name)
    .filter(Boolean)
    .map((s: string) => norm(s));

  const flavors: string[] = getFlavorsForKeywords(rawKeywords);

  const importantCrew = ["Director"]

  const crew = (d?.credits.crew as any[]).filter(c => importantCrew.includes(c.job)).map(d => d.name);

  return {
    id: imdbId,
    imdbId,
    title: d?.title ?? imdbId,
    year: d?.release_date ? Number(String(d.release_date).slice(0, 4)) : NaN,
    genres: (d?.genres ?? []).map((g: { name?: string }) => g?.name).filter(Boolean) as string[],
    keywords: uniq(rawKeywords),  
    flavors: uniq(flavors),               
    actors: (d?.credits?.cast ?? []).slice(0, 10).map((c: { name?: string }) => c?.name).filter(Boolean) as string[],
    crew: uniq(crew),
    plot: d?.overview ?? "",
    posterUrl: img(d?.poster_path),
    backdropUrl,
    altPosters,
    tagline: d?.tagline ?? "",
    runtime: d?.runtime
  };
}

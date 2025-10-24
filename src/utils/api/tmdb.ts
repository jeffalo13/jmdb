import type { Movie } from "../../types/movie";
import { getFlavorsForKeywords } from "../../data/flavorMappingsOG";

type TmdbImageSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";

const tesseractAPI = `https://tesseract-api.com/v1/`

const norm = (s: string) => s.trim().toLowerCase();
const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

const img = (path?: string | null, size: TmdbImageSize = "w500"): string =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

export async function tmdbGetMovieByImdbId(tmdbID: number, signal?: AbortSignal): Promise<Movie | null> {
  try {
    if (!tesseractAPI) throw new Error("Missing VITE_API_BASE for backend.");

    const base = tesseractAPI.replace(/\/$/, "");
    const url =
      `${base}/tmdb/tmdb-movie-get` +
      `?id=${encodeURIComponent(String(tmdbID))}` +
      `&append_to_response=credits,keywords,images` +
      `&language=en-US`;

    const r2 = await fetch(url, { method: "GET", cache: "no-store", signal });
    if (!r2.ok) return null;
    const d = await r2.json();

    const primaryPoster = img(d?.poster_path, "w500");
    const backdropUrl = img(d?.backdrop_path, "original");

    const isUSAPoster = (countryCode?: string, languageCode?: string): boolean =>
      !!countryCode && !!languageCode && countryCode === "US" && languageCode === "en";

    const posters: string[] = (d?.images?.posters ?? [])
      .slice()
      .filter((f: any) => isUSAPoster(f?.iso_3166_1, f?.iso_639_1))
      .sort(
        (a: any, b: any) =>
          (b?.vote_average || 0) - (a?.vote_average || 0) ||
          (b?.width || 0) - (a?.width || 0)
      )
      .map((p: any) => img(p?.file_path, "w500"))
      .filter(Boolean);

    const altPosters = uniq(posters.filter((u: string) => u !== primaryPoster)).slice(0, 2);

    const rawKeywords: string[] = (d?.keywords?.keywords ?? [])
      .map((k: { name?: string }) => k?.name)
      .filter(Boolean)
      .map((s: string) => norm(s));

    const flavors: string[] = getFlavorsForKeywords(rawKeywords);

    const importantCrew = ["Director"];
    const crew = ((d?.credits?.crew ?? []) as any[])
      .filter((c) => importantCrew.includes(c?.job))
      .map((x) => x?.name);

    return {
      tmdbID: d?.id,
      title: d?.title ?? tmdbID,
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
      runtime: d?.runtime,
    };
  } catch {
    return null;
  }
}

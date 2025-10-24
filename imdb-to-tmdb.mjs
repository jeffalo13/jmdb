// imdb-to-tmdb.mjs
// Generates: tmdbIds.mjs  (exports a number[])
// Run (PowerShell):
//   node -r dotenv/config .\imdb-to-tmdb.mjs --module .\imdbIds.mjs

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

const TMDB_KEY = process.env.TMDB_KEY || "";
if (!TMDB_KEY) {
  console.error("ERROR: Set TMDB_KEY in .env or env var.");
  process.exit(1);
}

// ---- Args (just the module path) ----
const args = process.argv.slice(2);
let MODULE = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--module") { MODULE = args[i + 1]; i++; }
  else if (a.startsWith("--module=")) MODULE = a.split("=")[1];
}
if (!MODULE) {
  console.error("Usage: node -r dotenv/config imdb-to-tmdb.mjs --module ./imdbIds.mjs");
  process.exit(1);
}

// ---- Helpers ----
async function readIdsFromModule(modPath) {
  const url = pathToFileURL(resolve(modPath)).href;
  const mod = await import(url);
  const list = (mod.IMDB_IDS ?? mod.default ?? []).map(String);
  if (!Array.isArray(list) || list.length === 0) {
    console.error("No IMDb IDs found in module");
    process.exit(1);
  }
  return list;
}
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
async function findTmdbIdForImdb(imdbId, { signal, retry = 2 }) {
  const url = `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?external_source=imdb_id&api_key=${encodeURIComponent(TMDB_KEY)}`;
  let attempts = 0;
  while (attempts <= retry) {
    if (signal?.aborted) return { imdbId, tmdbId: null, error: "aborted" };
    try {
      const resp = await fetch(url, { signal });
      if (resp.status === 429) { await new Promise(r=>setTimeout(r, Math.pow(2, attempts)*500)); attempts++; continue; }
      if (!resp.ok) {
        if (resp.status >= 500 && attempts < retry) { attempts++; await new Promise(r=>setTimeout(r, Math.pow(2, attempts)*300)); continue; }
        return { imdbId, tmdbId: null, error: `HTTP ${resp.status}` };
      }
      const data = await resp.json();
      const id = (data.movie_results?.[0]?.id) ?? (data.tv_results?.[0]?.id) ?? (data.person_results?.[0]?.id) ?? null;
      return { imdbId, tmdbId: id, error: id ? null : "not found" };
    } catch (e) {
      if (e?.name === "AbortError") return { imdbId, tmdbId: null, error: "aborted" };
      if (attempts < retry) { attempts++; await new Promise(r=>setTimeout(r, Math.pow(2, attempts)*300)); continue; }
      return { imdbId, tmdbId: null, error: String(e?.message ?? e) };
    }
  }
  return { imdbId, tmdbId: null, error: "unknown error" };
}

// ---- Main ----
const imdbIds = await readIdsFromModule(MODULE);
const CONCURRENCY = 6;

const batches = chunk(imdbIds, CONCURRENCY);
const results = new Array(imdbIds.length).fill(null); // ordered
let done = 0;

console.log(`Resolving ${imdbIds.length} IMDb IDs…`);
for (const batch of batches) {
  await Promise.all(batch.map(async (imdbId, idxInBatch) => {
    const index = done + idxInBatch;            // index in this batch window
    const globalIdx = done + idxInBatch;        // safe since we process in order
    const r = await findTmdbIdForImdb(imdbId, { retry: 2 });
    // Only numbers in final array; keep nulls as nulls for now, we’ll filter.
    results[globalIdx] = typeof r.tmdbId === "number" ? r.tmdbId : null;
  }));
  done += batch.length;
  process.stdout.write(`\rProgress: ${done}/${imdbIds.length}`);
}
process.stdout.write("\n");

// Filter out nulls (you asked for just numbers)
const onlyNumbers = results.filter((n) => typeof n === "number");

// Write generated module
const outPath = resolve("./tmdbIds.mjs");
const fileBody =
  "// tmdbIds.mjs (generated)\n" +
  "export const TMDB_IDS = " + JSON.stringify(onlyNumbers, null, 2) + ";\n" +
  "export default TMDB_IDS;\n";

await fs.writeFile(outPath, fileBody, "utf8");

console.log(`Wrote ${outPath} (${onlyNumbers.length} ids).`);
console.log("Done.");

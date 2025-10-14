import React, { useMemo, useState } from "react";
import "./App.css";

import { IMDB_IDS } from "./data/imdbIDs";
import { useCachedMovies } from "./hooks/useCachedMovies";
import type { Movie, SortKey } from "./types/movie";

// use your real components/paths:
import {Dropdown, type DropdownOption} from "./components/Dropdown";
import {SearchBox} from "./components/SearchBox";

const App: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<SortKey>("alpha");

  const { movies, loading } = useCachedMovies(IMDB_IDS as unknown as string[]);

  // derive options
  const genreOptions: DropdownOption[] = useMemo(() => {
    const s = new Set<string>();
    movies.forEach(m => m.genres.forEach(g => s.add(g)));
    return Array.from(s).sort((a, b) => a.localeCompare(b)).map(g => ({ value: g, label: g }));
  }, [movies, selectedFlavors]);

  // TODO: decide your flavor taxonomy; empty for now
   const flavorOptions: DropdownOption[] = useMemo(() => {
  // If genres are selected, restrict to movies matching ANY selected genre; else use all movies
  const pool = selectedGenres.length
    ? movies.filter(m => m.genres.some(g => selectedGenres.includes(g)))
    : movies;

  const set = new Set<string>();
  pool.forEach(m => m.keywords.forEach(k => set.add(k)));

  return Array.from(set)
    .sort((a, b) => a.localeCompare(b))
    .map(k => ({ key: k, value: k, label: k }));
}, [movies, selectedGenres]);

  // filter/search
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return movies.filter((m) => {
      const byGenre = selectedGenres.length ? m.genres.some(g => selectedGenres.includes(g)) : true;
      const byFlavor = selectedFlavors.length ? m.keywords.some(f => selectedFlavors.includes(f)) : true;
      const bySearch = t
        ? m.title.toLowerCase().includes(t)
          // || m.actors.some(a => a.toLowerCase().includes(t))
          // || m.plot.toLowerCase().includes(t)
        : true;
      return byGenre && byFlavor && bySearch;
    });
  }, [movies, selectedGenres, selectedFlavors, term]);

  // sort
  const visible = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "alpha": copy.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "yearAsc": copy.sort((a, b) => (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title)); break;
      case "yearDesc": copy.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title)); break;
    }
    return copy;
  }, [filtered, sort]);

  return (
    <div className="ml-app">
      <header className="ml-topbar">
        <div className="ml-controls ml-left">
          <Dropdown backgroundColor="#161722"
            label="Genre" darkMode
            options={genreOptions}
            selectedKeys={selectedGenres}
            onChange={(v) => setSelectedGenres(Array.isArray(v) ? v.map(String) : [String(v)])}
            multiSelect searchable
          />
          <Dropdown backgroundColor="#161722"
            label="Flavor" darkMode
            options={flavorOptions}
            selectedKeys={selectedFlavors}
            onChange={(v) => setSelectedFlavors(Array.isArray(v) ? v.map(String) : [String(v)])}
            multiSelect searchable
          />
        </div>

        <div className="ml-controls ml-center">
          <SearchBox backgroundColor="#161722" darkMode value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search..." />
        </div>

        <div className="ml-controls ml-right">
          <div className="ml-sort">
            <button className={`ml-sortBtn ${sort === "alpha" ? "is-active" : ""}`} onClick={() => setSort("alpha")}>A–Z</button>
            <button className={`ml-sortBtn ${sort === "yearAsc" ? "is-active" : ""}`} onClick={() => setSort("yearAsc")}>Year ↑</button>
            <button className={`ml-sortBtn ${sort === "yearDesc" ? "is-active" : ""}`} onClick={() => setSort("yearDesc")}>Year ↓</button>
          </div>
        </div>
      </header>

      <main className="ml-grid">
        {loading && <div className="ml-loading">Loading…</div>}
        {!loading && visible.map((m: Movie) => (
          <article key={m.imdbId} className="ml-card">
            <div className="ml-card__posterWrap">
              {m.posterUrl ? (
                <img className="ml-card__poster" src={m.posterUrl} alt={m.title} />
              ) : (
                <div className="ml-card__placeholder">{m.title}</div>
              )}
            </div>
            <div className="ml-card__title">{m.title}</div>
          </article>
        ))}
      </main>
    </div>
  );
};

export default App;

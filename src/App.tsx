import React, { useMemo, useState } from "react";
import "./App.css";

import { IMDB_IDS } from "./data/imdbIDs";
import { useCachedMovies } from "./hooks/useCachedMovies";
import type { Movie, SortKey } from "./types/movie";

import { Dropdown, type DropdownOption } from "./components/Dropdown";
import { SearchBox } from "./components/SearchBox";
import MovieSheet from "./components/Movie/MoviePreview";

const App: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<SortKey>("alpha");
  const [openMovie, setOpenMovie] = useState<Movie | null>(null); // NEW

  const { movies, loading } = useCachedMovies(IMDB_IDS as unknown as string[]);

  const toOptions = (items: string[]): DropdownOption[] => {
    const toArray = Array.from(new Set(items))
      .sort((a, b) => a.localeCompare(b))
      .map((s) => ({ key: s, value: s, label: s }));
    return toArray;
  }


  const genreOptions: DropdownOption[] = useMemo(() => {
    const pool = movies.filter((m) =>
      (selectedFlavors.length ? m.flavors.some((f) => selectedFlavors.includes(f)) : true) &&
      (selectedKeywords.length ? m.keywords.some((k) => selectedKeywords.includes(k)) : true)
    );
    const genres = pool.flatMap((m) => m.genres);
    return toOptions(genres);
  }, [movies, selectedFlavors, selectedKeywords]);

  const flavorOptions: DropdownOption[] = useMemo(() => {
    const pool = movies.filter((m) =>
      (selectedGenres.length ? m.genres.some((g) => selectedGenres.includes(g)) : true) &&
      (selectedKeywords.length ? m.keywords.some((k) => selectedKeywords.includes(k)) : true)
    );
    const flavors = pool.flatMap((m) => m.flavors);
    return toOptions(flavors);
  }, [movies, selectedGenres, selectedKeywords]);

  const keywordOptions: DropdownOption[] = useMemo(() => {
    const pool = movies.filter((m) =>
      (selectedGenres.length ? m.genres.some((g) => selectedGenres.includes(g)) : true) &&
      (selectedFlavors.length ? m.flavors.some((f) => selectedFlavors.includes(f)) : true)
    );
    const keywords = pool.flatMap((m) => m.keywords);
    return toOptions(keywords);
  }, [movies, selectedGenres, selectedFlavors]);


  // filter/search
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return movies.filter((m) => {
      const byGenre = selectedGenres.length ? m.genres.some((g) => selectedGenres.includes(g)) : true;
      const byFlavor = selectedFlavors.length ? m.flavors.some((f) => selectedFlavors.includes(f)) : true;
      const byKeyword = selectedKeywords.length ? m.keywords.some((f) => selectedKeywords.includes(f)) : true;
      const bySearch = t ? m.title.toLowerCase().includes(t) : true; // simplify for now
      return byGenre && byFlavor && bySearch && byKeyword;
    });
  }, [movies, selectedGenres, selectedFlavors, selectedKeywords, term]);

  // sort
  const visible = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "alpha":
        copy.sort((a, b) => {
          const clean = (s: string) => s.replace(/^(the |a )/i, "").trim();
          return clean(a.title).localeCompare(clean(b.title));
        });
        break;
      case "yearAsc":
        copy.sort((a, b) => (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title));
        break;
      case "yearDesc":
        copy.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
        break;
    }
    return copy;
  }, [filtered, sort]);

  return (
    <div className="ml-app">
      {/* Sticky title header */}
      <div className="ml-header">
        <h1 className="ml-title">Jeff&apos;s Movies</h1>
      </div>

      {/* Mobile-first vertical controls */}
      <section className="ml-controlsStack">
        <SearchBox
          backgroundColor="#161722"
          darkMode
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search Movies..."
        />

        <Dropdown
          backgroundColor="#161722"
          label="Genre"
          darkMode
          options={genreOptions}
          selectedKeys={selectedGenres}
          onChange={(v) => setSelectedGenres(Array.isArray(v) ? v.map(String) : [String(v)])}
          multiSelect
          searchable placeholder="Filter Genre..."
          showSelectAll={true}
          style={{ width: "auto" }}
          maxDisplaySelect={2}
        />

        <Dropdown
          backgroundColor="#161722"
          label="Flavor"
          darkMode
          options={flavorOptions}
          selectedKeys={selectedFlavors}
          onChange={(v) => setSelectedFlavors(Array.isArray(v) ? v.map(String) : [String(v)])}
          multiSelect
          searchable placeholder="Filter Flavor..."
          style={{ width: "auto" }}
        />

        <Dropdown
          backgroundColor="#161722"
          label="Keywords"
          darkMode
          options={keywordOptions}
          selectedKeys={selectedKeywords}
          onChange={(v) => setSelectedKeywords(Array.isArray(v) ? v.map(String) : [String(v)])}
          multiSelect
          searchable placeholder="Filter Keyword..."
          style={{ width: "auto" }}
        />

        <div className="ml-sortRow">
          <button className={`ml-sortBtn ${sort === "alpha" ? "is-active" : ""}`} onClick={() => setSort("alpha")}>A–Z</button>
          <button className={`ml-sortBtn ${sort === "yearAsc" ? "is-active" : ""}`} onClick={() => setSort("yearAsc")}>Year ↑</button>
          <button className={`ml-sortBtn ${sort === "yearDesc" ? "is-active" : ""}`} onClick={() => setSort("yearDesc")}>Year ↓</button>
        </div>
      </section>

      {/* Poster grid */}
      <main className="ml-grid">
        {loading && <div className="ml-loading">Loading…</div>}
        {!loading &&
          visible.map((m) => (
            <article key={m.imdbId} className="ml-card" onClick={() => setOpenMovie(m)}>
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

      {/* Mobile sheet with details */}
      <MovieSheet movie={openMovie} onClose={() => setOpenMovie(null)} />
    </div>
  );
};

export default App;

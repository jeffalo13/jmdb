import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

// import { IMDB_IDS } from "./data/imdbIDs";
import { useLoadMovies } from "./hooks/useLoadMovies";
import type { Movie, SortKey } from "./types/movie";

import { Dropdown, type DropdownOption } from "./components/Dropdown";
import { SearchBox } from "./components/SearchBox";
import MovieSheet from "./components/Movie/MoviePreview";
import { SortDropdown } from "./components/SortDropdown";
import { Button } from "./components/Button";
import { useMovieIDs } from "./hooks/useMovieIDs";

const App: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCast, setSelectedCast] = useState<string[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [term, setTerm] = useState("");
  const [openMovie, setOpenMovie] = useState<Movie | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [sortMode, setSortMode] = useState<SortKey>("alpha");
  const [tagText, setTagText] = useState("");

  type TagType = "genre" | "flavor" | "keyword" | "cast" | "crew" | "search" | "tagText";

  const [openKey, setOpenKey] = useState<null | "genre" | "flavor" | "keyword">(null);

  const applyMap: Record<TagType, (v: string) => void> = {
    genre: (v) => setSelectedGenres([v]),
    flavor: (v) => setSelectedFlavors([v]),
    keyword: (v) => setSelectedKeywords([v]),
    cast: (v) => setSelectedCast([v]),
    crew: (v) => setSelectedCrew([v]),
    search: (v) => setTerm(v),
    tagText: (v) => setTagText(v)

  };

  // resets
  const resetFunctions: Array<() => void> = [
    () => setSelectedGenres([]),
    () => setSelectedFlavors([]),
    () => setSelectedKeywords([]),
    () => setSelectedCast([]),
    () => setSelectedCrew([]),
    () => setTerm(""),
    () => setTagText(""),
  ];


  const accentColor = "#f0e68c";

  const { movieIDs, loadingIDs } = useMovieIDs();

  const { movies, loadingMovieInfo } = useLoadMovies(movieIDs as unknown as string[]);

  const loading = loadingIDs || loadingMovieInfo;

  const toOptions = (items: string[]): DropdownOption[] => {
    const toArray = Array.from(new Set(items))
      .sort((a, b) => a.localeCompare(b))
      .map((s) => ({ key: s, value: s, label: s }));
    return toArray;
  }

  const matchesSearchTerm = (movie: Movie, raw: string) => {
    const t = raw.trim().toLowerCase();
    if (!t) return true; // or false, depending on your UX

    const inArr = (arr?: string[]) =>
      Array.isArray(arr) && arr.some(s => s?.toLowerCase().includes(t));

    return (
      movie.title.toLowerCase().includes(t) ||
      inArr(movie.genres) ||
      inArr(movie.flavors) ||
      inArr(movie.keywords) ||
      inArr(movie.actors) ||
      inArr(movie.crew)

    );
  };


  const genreOptions: DropdownOption[] = useMemo(() => {
    const pool = movies.filter((m) =>
      (selectedFlavors.length ? m.flavors.some((f) => selectedFlavors.includes(f)) : true) &&
      (selectedKeywords.length ? m.keywords.some((k) => selectedKeywords.includes(k)) : true) &&
      (!term || matchesSearchTerm(m, term))
    );
    const genres = pool.flatMap((m) => m.genres);
    return toOptions(genres);
  }, [movies, selectedFlavors, selectedKeywords, term]);

  const flavorOptions: DropdownOption[] = useMemo(() => {
    const pool = movies.filter((m) =>
      (selectedGenres.length ? m.genres.some((g) => selectedGenres.includes(g)) : true) &&
      (selectedKeywords.length ? m.keywords.some((k) => selectedKeywords.includes(k)) : true) &&
      (!term || matchesSearchTerm(m, term))
    );
    const flavors = pool.flatMap((m) => m.flavors);
    return toOptions(flavors);
  }, [movies, selectedGenres, selectedKeywords, term]);

  const keywordOptions: DropdownOption[] = useMemo(() => {
    const pool = movies.filter((m) =>
      (selectedGenres.length ? m.genres.some((g) => selectedGenres.includes(g)) : true) &&
      (selectedFlavors.length ? m.flavors.some((f) => selectedFlavors.includes(f)) : true) &&
      (!term || matchesSearchTerm(m, term))
    );
    const keywords = pool.flatMap((m) => m.keywords);
    return toOptions(keywords);
  }, [movies, selectedGenres, selectedFlavors, term]);



  // filter/search
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    return movies.filter((m) => {
      const byGenre = selectedGenres.length ? m.genres.some((g) => selectedGenres.includes(g)) : true;
      const byFlavor = selectedFlavors.length ? m.flavors.some((f) => selectedFlavors.includes(f)) : true;
      const byKeyword = selectedKeywords.length ? m.keywords.some((k) => selectedKeywords.includes(k)) : true;
      const byCast = selectedCast.length ? m.actors.some((a) => selectedCast.includes(a)) : true;
      const byCrew = selectedCrew.length ? m.crew.some((c) => selectedCrew.includes(c)) : true;
      const bySearch = t ? matchesSearchTerm(m, t) : true; // simplify for now
      return byGenre && byFlavor && bySearch && byKeyword && byCast && byCrew;
    });
  }, [movies, selectedGenres, selectedFlavors, selectedKeywords, selectedCast, term]);

  // sort
  const visible = useMemo(() => {
    const copy = [...filtered];

    const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
    const strip = (s = "") => s.replace(/^(?:the|a|an)\s+/i, "").trim();
    const dir = sortAsc ? 1 : -1;
    const rankYear = (y?: number | null) => (y == null ? Infinity : y); // unknown years last
    const rankRuntime = (r?: number | null) => (r == null ? Infinity : r); // unknown years last

    switch (sortMode) {
      case "alpha": {
        copy.sort((a, b) => dir * collator.compare(strip(a.title), strip(b.title)));
        break;
      }
      case "year": {
        copy.sort((a, b) => {
          const primary = rankYear(a.year) - rankYear(b.year);
          if (primary !== 0) return dir * primary;
          // tie-break by title (always ascending for stability)
          return collator.compare(strip(a.title), strip(b.title));
        });
        break;
      }
       case "runtime":
        copy.sort((a, b) => {
          const primary = rankRuntime(a.runtime) - rankRuntime(b.runtime);
          if (primary !== 0) return dir * primary;
          // tie-break by title (always ascending for stability)
          return collator.compare(strip(a.title), strip(b.title));
        });
        break;

      // case "rating":
      //   // add future modes here
      default:
        break;
    }

    return copy;
  }, [filtered, sortMode, sortAsc]);

  const onTagClicked = (type: TagType, value: string) => {
    resetFilters();
    applyMap[type](value);
    setTagText(`${value}`);
    scrollToTop();
  };

  const logoClicked = () => {
    resetFilters();
    resetSort();
    scrollToTop();
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const resetFilters = () => {
    resetFunctions.forEach(fn => fn());
  };

  const resetSort = () => {
    setSortAsc(true);
    setSortMode("alpha")
  }

  const anyDropdownOpen = openKey !== null;

  const dropdownPlaceholder = (tagType: string, optionArray: DropdownOption[]): string => {
    return optionArray.length > 0 ? `Filter ${tagType}...` : `No Results`;
  }

  // Optional: instantly kill keyboard the moment any dropdown opens
  useEffect(() => {
    if (anyDropdownOpen) (document.activeElement as HTMLElement | null)?.blur?.();
  }, [anyDropdownOpen]);

  return (
    <div className="ml-app">
      {/* Sticky title header */}
      <div className="ml-sticky">
        <div className="ml-header" onClick={() => scrollToTop()}>
          <img src="/logo.png" alt="Jeff's Movies" className="ml-logo" height={40} onClick={logoClicked} />
          {/* <Button label="Refresh Movies" accentColor="#242636"
                  borderColor="transparent"
                  // style={{ borderRadius: 4, fontSize: "11px", height: "23px", lineHeight: 1 }} // line-height helps text centering
                  onClick={() => resetFilters()}></Button> */}
        </div>


      </div>
      <div className="ml-shell">
        <section className="ml-controlsStack">
          <SearchBox
            backgroundColor="#0d0e12"
            accentColor={accentColor}
            darkMode
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search Anything..."
            focusOverride={anyDropdownOpen ? "no-pointer-focus" : "normal"}
            onPointerDown={(_e) => {
              // if a dropdown is open, close it and allow this input to focus (don’t preventDefault)
              if (openKey) setOpenKey(null);
            }}
          />

          <Dropdown
            backgroundColor="#0d0e12"
            // searchable
            // label="Genre"
            darkMode
            options={genreOptions}
            accentColor={accentColor}
            selectedKeys={selectedGenres}
            onChange={(v) => setSelectedGenres(Array.isArray(v) ? v.map(String) : [String(v)])}
            multiSelect
            placeholder={dropdownPlaceholder("Genre", genreOptions)}
            showSelectAll={true}
            style={{ width: "auto" }}
            maxDisplaySelect={2}
            isOpen={openKey === "genre"}
            onOpenChange={(next) => setOpenKey(next ? "genre" : null)}
            placeholderColor="#f0f0f0"
          />

          <Dropdown
            backgroundColor="#0d0e12"
            // searchable
            // label="Flavor"
            darkMode
            options={flavorOptions}
            accentColor={accentColor}
            selectedKeys={selectedFlavors}
            onChange={(v) => setSelectedFlavors(Array.isArray(v) ? v.map(String) : [String(v)])}
            multiSelect
            showSelectAll={true}
            placeholder={dropdownPlaceholder("Flavor", flavorOptions)}
            style={{ width: "auto" }}
            isOpen={openKey === "flavor"}
            onOpenChange={(next) => setOpenKey(next ? "flavor" : null)}
            placeholderColor="#f0f0f0"
          />

          <Dropdown
            backgroundColor="#0d0e12"
            // searchable
            // label="Keywords"
            darkMode
            options={keywordOptions}
            accentColor={accentColor}
            selectedKeys={selectedKeywords}
            onChange={(v) => setSelectedKeywords(Array.isArray(v) ? v.map(String) : [String(v)])}
            multiSelect
            showSelectAll={true}
            placeholder={dropdownPlaceholder("Keyword", keywordOptions)}
            style={{ width: "auto" }}
            isOpen={openKey === "keyword"}
            onOpenChange={(next) => setOpenKey(next ? "keyword" : null)}
            placeholderColor="#f0f0f0"
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",      // centers items on the cross-axis
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                label={`Clear Filters`}
                accentColor="#242636"
                borderColor="transparent"
                style={{ borderRadius: 4, fontSize: "11px", height: "23px", lineHeight: 1 }} // line-height helps text centering
                onClick={resetFilters}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {tagText?.length > 0 && (
                <Button
                  label={`${tagText} ✕`}
                  accentColor="#242636"
                  borderColor="#f0e68c"
                  fontColor="#f0e68c"
                  style={{ borderRadius: 4, fontSize: "11px", height: "23px", lineHeight: 1 }} // line-height helps text centering
                  onClick={() => resetFilters()}
                />
              )}
            </div>


            <div style={{ display: "flex", alignItems: "center" }}>
              <SortDropdown
                sortMode={sortMode}
                sortAsc={sortAsc}
                onChange={(mode, asc) => { setSortMode(mode); setSortAsc(asc); }}
              />
            </div>
          </div>

          



        </section>
        <div className="mp-tagline">{`${filtered.length} Movies`}</div>
        {/* Poster grid */}
        <main className="ml-grid">
          {loading && <div className="ml-loading">Loading 4k Blu-ray Collection...</div>}
          {visible.length === 0 && <div className="ml-loading"></div>}
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
                <div className="ml-card__title">{`${m.title}`}</div>
              </article>
            ))}
        </main>

        {/* Mobile sheet with details */}
        <MovieSheet movie={openMovie} onClose={() => setOpenMovie(null)}
          onTagClicked={onTagClicked} />
      </div>

    </div>
  );
};

export default App;

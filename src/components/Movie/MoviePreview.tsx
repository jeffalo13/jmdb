import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Movie } from "../../types/movie";
import "./MoviePreview.css";

type TagType = "genre" | "flavor" | "keyword" | "cast" | "crew" | "search";


interface Props {
  movie: Movie | null;
  onClose: () => void;
  onTagClicked: (type: TagType, tag: string) => void;
}

const SWIPE_PX = 30;

const MoviePreview: React.FC<Props> = ({ movie, onClose, onTagClicked }) => {
  const [idx, setIdx] = useState(0);
  const startX = useRef<number | null>(null);
  const swiping = useRef(false);
  const [showKeywords, setShowKeywords] = useState(false);
  const [showCast, setShowCast] = useState(false);
  const [exiting, setExiting] = useState(false);


  // primary first, then unique alt posters
  const posters = useMemo(() => {
    if (!movie) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    if (movie.posterUrl) {
      list.push(movie.posterUrl);
      seen.add(movie.posterUrl);
    }
    for (const p of movie.altPosters || []) {
      if (p && !seen.has(p)) {
        list.push(p);
        seen.add(p);
      }
    }
    return list;
  }, [movie]);

  useEffect(() => setIdx(0), [movie]);

  useEffect(() => {
    if (movie) setExiting(false);
  }, [movie]);

  const count = posters.length || 1;
  const goTo = (n: number) => {
    const next = ((n % count) + count) % count;
    setIdx(next);
  };
  const next = () => goTo(idx + 1);
  const prev = () => goTo(idx - 1);

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.touches[0].clientX;
    swiping.current = false;
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > SWIPE_PX) swiping.current = true;
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx < 0) next(); else prev();
  };

  const onPosterClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (swiping.current) { swiping.current = false; return; }
    next();
  };

  useLayoutEffect(() => {
    if (!movie) return;

    const y = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    // remember previous inline styles we touch
    const prev = {
      bodyPos: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    // lock
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";   // belt-and-suspenders
    html.style.overflow = "hidden";   // blocks scroll chaining on some browsers

    return () => {
      // unlock & restore
      body.style.position = prev.bodyPos;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, y);          // restore exact scroll
    };
  }, [movie]);

  if (!movie) return null;

  const handleClose = () => {
    setExiting(true);
    setShowKeywords(false);
    setShowCast(false);
    setTimeout(onClose, 250); // matches animation duration
  };

  const handleTagClicked = (tagType: TagType, tag: string) => {

    onTagClicked(tagType, tag);

    handleClose();

  }

  const runtimePretty = (runtime: number) => {
    const hour = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    return `${hour}h ${minutes}m`
  }
  return (
    <>
      <div className={`mp-backdrop ${exiting ? "is-exiting" : "is-open"}`}
        onWheel={(e) => e.preventDefault()}          // eat mousewheel
        onTouchMove={(e) => e.preventDefault()}      // eat touch move
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && exiting) {
            setExiting(false);      // unmount after fade-out
          }
        }} onClick={handleClose} />
      <section className={`mp-container ${exiting ? "is-exiting" : ""}`} role="dialog" aria-modal="true" aria-label={`${movie.title} details`}
        style={{ ['--mp-bg' as any]: `url(${movie.backdropUrl || movie.posterUrl})` }}>
        <header className="mp-header">
          <h2 className="mp-title">
            {movie.title}{" "}
            {Number.isFinite(movie.year) && <span className="mp-year">({movie.year})</span>}
            <span className="mp-runtime">{runtimePretty(movie.runtime)}</span>
          </h2>
          <button className="mp-close" onClick={handleClose} aria-label="Close">✕</button>
        </header>

        {/* Poster carousel */}
        <div
          className="mp-posterWrap"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={onPosterClick}
          role="button"
          aria-label="Change poster"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "Enter" || e.key === " ") next();
          }}
        >
          {posters[idx] ? (
            <img
              className="mp-poster"
              src={posters[idx]}
              alt={`${movie.title} poster ${idx + 1} of ${count}`}
            />
          ) : (
            <div className="mp-posterPlaceholder">{movie.title}</div>
          )}

          {count > 1 && (
            <div className="mp-segments">
              {posters.map((_, i) => (
                <span
                  key={i}
                  className={`mp-segment ${i === idx ? "is-active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); goTo(i); }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mp-tagline">{movie.tagline}</div>

        {/* Meta */}
        <div className="mp-meta">
          {movie.genres.length > 0 && (
            <div className="mp-row">
              {movie.genres.map((g) => (
                <button key={g} className={`mp-chip mp-chip-btn`} onClick={() => handleTagClicked("genre", g)}>{g}</button>
              ))}
            </div>
          )}
          {movie.flavors?.length > 0 && (
            <div className="mp-row">
              {movie.flavors.map((f) => (
                <button key={f} className="mp-chip mp-chip--muted" onClick={() => handleTagClicked("flavor", f)}>{f}</button>
              ))}
            </div>
          )}

          <div className="mp-vrow">
            {/* keyword toggle */}
            <button
              type="button"
              className="mp-chip mp-chip-btn"
              aria-pressed={showKeywords}
              onClick={() => setShowKeywords(!showKeywords)}
            >
              {showKeywords ? "Hide" : "Show"} Keywords
            </button>
          </div>
          {showKeywords && (
            <div className="mp-row">
              {movie.keywords.map((k) => (
                <button key={k} className="mp-chip mp-chip--muted" onClick={() => handleTagClicked("keyword", k)}>
                  {k}
                </button>
              ))}
            </div>
          )}

          {/* cast toggle */}
          <div className="mp-vrow">
            <button
              type="button"
              className="mp-chip mp-chip-btn"
              aria-pressed={showCast}
              onClick={() => setShowCast(!showCast)}
            >
              {showCast ? "Hide" : "Show"} Cast
            </button>
          </div>
          {showCast && (
            <div className="mp-row">
              {movie.crew.map((c) => (
                <button key={c} className="mp-chip mp-chip--special" onClick={() => handleTagClicked("crew", c)}>
                  {c}
                </button>
              ))}
              {movie.actors.map((a) => (
                <button key={a} className="mp-chip mp-chip--muted" onClick={() => handleTagClicked("cast", a)}>
                  {a}
                </button>
              ))}
            </div>
          )}



        </div>

        {movie.plot && <p className="mp-plot">{movie.plot}</p>}






        {/* {movie.actors.length > 0 && (
          <div className="mp-cast">
            <strong>Cast:</strong> <span>{movie.actors.join(", ")}</span>
          </div>
        )} */}

        <div aria-hidden className="mp-spacer" />
      </section>
    </>
  );
};

export default MoviePreview;

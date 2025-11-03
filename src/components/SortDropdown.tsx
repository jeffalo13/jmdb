import { useEffect, useRef, useState } from "react";
import "./SortDropdown.css";
import { Button } from "./Button";

export type SortMode = "alpha" | "year" | "runtime" | "dateAdded";

export function SortDropdown({
  sortMode,
  sortAsc,
  onChange,
}: {
  sortMode: SortMode;
  sortAsc: boolean;
  onChange: (mode: SortMode, asc: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const arrow = sortAsc ? "↑" : "↓";
  const label = sortMode === "alpha" ? "Title" : sortMode === "year" ? "Year" : sortMode === "dateAdded" ? "Date Added" : "Runtime";

  // open/close + outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // flip logic
  useEffect(() => {
    if (!open) return;
    const btn = wrapRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    // allow menu to render first
    requestAnimationFrame(() => {
      const br = btn.getBoundingClientRect();
      const mr = menu.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const padding = 8; // viewport padding

      setAlignEnd(br.left + mr.width > vw - padding); // too far right → align end
      setOpenUp(br.bottom + mr.height > vh - padding); // too far bottom → open up
    });
  }, [open]);

  const select = (mode: SortMode) => {
    if (mode === sortMode) onChange(mode, !sortAsc);
    else onChange(mode, true);
    setOpen(false);
  };

  const sortBtnTxt = `${label} ${arrow}`

  return (
    <div
      ref={wrapRef}
      className={`ml-dd ${open ? "is-open" : ""} ${alignEnd ? "ml-dd--end" : ""} ${openUp ? "ml-dd--up" : ""}`}
    >
      <Button
                    label={sortBtnTxt}
                    accentColor="#242636"
                    borderColor="transparent"
                    style={{ borderRadius: 4, fontSize: "11px", height: "23px", lineHeight: 1, width:"125px" }} // line-height helps text centering
                    onClick={() => setOpen(v => !v)}
                  />

      {/* Always in DOM; CSS toggles visibility/placement */}
      <div role="menu" ref={menuRef} className="ml-dd-menu">
        <button
          type="button"
          role="menuitemradio"
          aria-checked={sortMode === "alpha"}
          className={`ml-dd-item ${sortMode === "alpha" ? "is-active" : ""}`}
          onClick={() => select("alpha")}
        >
          <span>Title</span>
          {sortMode === "alpha" && <span className="ml-dd-itemArrow">{arrow}</span>}
        </button>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={sortMode === "dateAdded"}
          className={`ml-dd-item ${sortMode === "dateAdded" ? "is-active" : ""}`}
          onClick={() => select("dateAdded")}
        >
          <span>Date Added</span>
          {sortMode === "dateAdded" && <span className="ml-dd-itemArrow">{arrow}</span>}
        </button>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={sortMode === "runtime"}
          className={`ml-dd-item ${sortMode === "runtime" ? "is-active" : ""}`}
          onClick={() => select("runtime")}
        >
          <span>Runtime</span>
          {sortMode === "runtime" && <span className="ml-dd-itemArrow">{arrow}</span>}
        </button>
        <button
          type="button"
          role="menuitemradio"
          aria-checked={sortMode === "year"}
          className={`ml-dd-item ${sortMode === "year" ? "is-active" : ""}`}
          onClick={() => select("year")}
        >
          <span>Year</span>
          {sortMode === "year" && <span className="ml-dd-itemArrow">{arrow}</span>}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { hasValues, readSearch, sameValues, writeSearch } from "@/lib/url-filters";

const blank = (keys, initial = {}) => Object.fromEntries(keys.map((key) => [key, initial[key] ?? ""]));

/**
 * Filter values kept in step with the address.
 *
 *   const { values, update, clear, sync, active } = useUrlFilters(KEYS, initial)
 *
 * - `keys` must be a constant array (declare it at module level).
 * - `initial` is what the server already knew from the address (so the first
 *   render matches the server HTML); the real address is read again on mount,
 *   which also covers statically built pages.
 * - `update(patch, { replace })` changes values and writes them to the address
 *   (a new history entry unless `replace`), so Back/Forward restore them.
 * - `sync(search)` re-reads the values after the address changed from outside
 *   (Back/Forward, an in-site link to the same page): pass it to <UrlWatch>.
 */
export function useUrlFilters(keys, initial = {}) {
  const [values, setValues] = useState(() => blank(keys, initial));
  const valuesRef = useRef(values);

  const commit = useCallback((next) => {
    valuesRef.current = next;
    setValues(next);
  }, []);

  const sync = useCallback(
    (search) => {
      const next = readSearch(search, keys);
      if (!sameValues(valuesRef.current, next, keys)) commit(next);
    },
    [keys, commit],
  );

  // A direct open reads exactly the address it was opened with.
  useEffect(() => {
    sync(window.location.search);
  }, [sync]);

  const update = useCallback(
    (patch, options) => {
      const next = { ...valuesRef.current, ...patch };
      if (sameValues(valuesRef.current, next, keys)) return;
      commit(next);
      writeSearch(next, keys, options);
    },
    [keys, commit],
  );

  const clear = useCallback((options) => update(blank(keys), options), [keys, update]);

  return { values, update, clear, sync, active: hasValues(values, keys) };
}

/**
 * Text typed in a search box. The list reacts to every keystroke; the address
 * is only rewritten after a short pause (and replaces the entry, so Back does
 * not step through every letter). A value that arrives from the address
 * (Back, a link) replaces what is typed.
 */
export function useQueryText(query, onCommit, delay = 350) {
  const [text, setText] = useState(query);
  const committed = useRef(query);
  const commit = useRef(onCommit);

  useEffect(() => {
    commit.current = onCommit;
  });

  useEffect(() => {
    if (query !== committed.current) {
      committed.current = query;
      setText(query);
    }
  }, [query]);

  useEffect(() => {
    if (text === committed.current) return undefined;
    const timer = setTimeout(() => {
      committed.current = text;
      commit.current(text);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return [text, setText];
}

/**
 * "Show more" paging that starts over whenever the filters change, whatever
 * changed them (a control, Clear, Back or an incoming link). `signature` is a
 * string describing the current search and rows.
 */
export function usePages(signature) {
  const [state, setState] = useState({ signature, pages: 1 });
  const pages = state.signature === signature ? state.pages : 1;
  const more = useCallback(() => setState({ signature, pages: pages + 1 }), [signature, pages]);
  return [pages, more];
}

/** A filtered view is a convenience, not a page: keep it out of search results. */
export function useNoindex(active) {
  useEffect(() => {
    if (!active) return undefined;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,follow";
    meta.setAttribute("data-filtered-view", "");
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [active]);
}

/** Live `matchMedia` result; `initial` is used for the server render. */
export function useMediaQuery(query, initial = false) {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const list = window.matchMedia(query);
    const on = () => setMatches(list.matches);
    on();
    list.addEventListener("change", on);
    return () => list.removeEventListener("change", on);
  }, [query]);
  return matches;
}

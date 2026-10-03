"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Each page tells the header which language versions really exist, so the
// language switcher never links to a translation that isn't there.
//   alternates: { en: "/en/services/x", hi: "/hi/services/x" | null }
const AlternatesContext = createContext({ alternates: null, setAlternates: () => {} });

export function AlternatesProvider({ children }) {
  const [alternates, setAlternates] = useState(null);
  return <AlternatesContext.Provider value={{ alternates, setAlternates }}>{children}</AlternatesContext.Provider>;
}

export function useAlternates() {
  return useContext(AlternatesContext).alternates;
}

export function PageAlternates({ en, hi }) {
  const { setAlternates } = useContext(AlternatesContext);
  useEffect(() => {
    setAlternates({ en, hi });
    return () => setAlternates(null);
  }, [en, hi, setAlternates]);
  return null;
}

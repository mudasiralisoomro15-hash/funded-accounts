"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type DashTheme = "light" | "dark";

interface DashThemeValue {
  theme: DashTheme;
  toggle: () => void;
}

const DashThemeContext = createContext<DashThemeValue>({ theme: "light", toggle: () => {} });

export function DashThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<DashTheme>("light");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("fx_dash_theme");
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: DashTheme = t === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem("fx_dash_theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <DashThemeContext.Provider value={value}>{children}</DashThemeContext.Provider>;
}

export const useDashTheme = () => useContext(DashThemeContext);

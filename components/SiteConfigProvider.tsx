"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSiteConfig, saveSiteConfig } from "@/lib/db";
import { DEFAULT_SITE_CONFIG, cloneConfig, type SiteConfig } from "@/lib/siteConfig";

interface SiteConfigContextValue {
  config: SiteConfig;
  /** true once the saved config has been loaded (admin must wait for this). */
  ready: boolean;
  error: string | null;
  save: (next: SiteConfig) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: DEFAULT_SITE_CONFIG,
  ready: false,
  error: null,
  save: async () => {},
  resetToDefaults: async () => {},
});

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getSiteConfig()
      .then((c) => {
        if (!alive) return;
        setConfig(c);
        setReady(true);
      })
      .catch((e) => {
        // The public site keeps working on defaults; the admin panel refuses to edit.
        if (alive) setError(e instanceof Error ? e.message : "Could not load site settings.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(async (next: SiteConfig) => {
    await saveSiteConfig(next);
    setConfig(cloneConfig(next));
  }, []);

  const resetToDefaults = useCallback(async () => {
    const fresh = cloneConfig(DEFAULT_SITE_CONFIG);
    await saveSiteConfig(fresh);
    setConfig(fresh);
  }, []);

  const value = useMemo(
    () => ({ config, ready, error, save, resetToDefaults }),
    [config, ready, error, save, resetToDefaults]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export const useSiteConfig = () => useContext(SiteConfigContext);

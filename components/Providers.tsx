"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { SiteConfigProvider } from "./SiteConfigProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteConfigProvider>{children}</SiteConfigProvider>
    </AuthProvider>
  );
}

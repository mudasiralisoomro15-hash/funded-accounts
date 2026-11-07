"use client";

import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { SiteConfigProvider } from "./SiteConfigProvider";
import { captureReferral } from "@/lib/db";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    captureReferral();
  }, []);
  return (
    <AuthProvider>
      <SiteConfigProvider>{children}</SiteConfigProvider>
    </AuthProvider>
  );
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAdminEmail, signOutUser, subscribeAuth } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  /** UI-level admin check. Real protection is enforced by Firestore rules. */
  isAdmin: boolean;
  /** true while Firebase is not configured (data stays in this browser). */
  demoMode: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  demoMode: !isFirebaseConfigured,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      subscribeAuth((u) => {
        setUser(u);
        setLoading(false);
      }),
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      // Demo mode: any signed-in demo user may open /admin (nothing is shared, so it is harmless).
      isAdmin: !!user && (!isFirebaseConfigured || isAdminEmail(user.email)),
      demoMode: !isFirebaseConfigured,
      signOut: signOutUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isAdminEmail, signOutUser, subscribeAuth } from "@/lib/auth";
import { getAdminRole } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { AdminRole, AppUser } from "@/lib/types";

/** "owner" = you (NEXT_PUBLIC_ADMIN_EMAILS); "full" / "approval" = admins you added in the panel. */
export type AdminLevel = "owner" | AdminRole;

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  /** UI-level admin check. Real protection is enforced by Firestore rules. */
  isAdmin: boolean;
  adminRole: AdminLevel | null;
  /** true while Firebase is not configured (data stays in this browser). */
  demoMode: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  adminRole: null,
  demoMode: !isFirebaseConfigured,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleState, setRoleState] = useState<{ uid: string; role: AdminLevel | null } | null>(null);

  useEffect(
    () =>
      subscribeAuth((u) => {
        setUser(u);
        setAuthLoading(false);
      }),
    []
  );

  // Work out the admin level after every login.
  useEffect(() => {
    if (!user) {
      setRoleState(null);
      return;
    }
    // Demo mode: any signed-in demo user may open /admin (nothing is shared, so it is harmless).
    if (!isFirebaseConfigured || isAdminEmail(user.email)) {
      setRoleState({ uid: user.uid, role: "owner" });
      return;
    }
    let alive = true;
    getAdminRole(user.email)
      .then((r) => alive && setRoleState({ uid: user.uid, role: r }))
      .catch(() => alive && setRoleState({ uid: user.uid, role: null }));
    return () => {
      alive = false;
    };
  }, [user]);

  const roleReady = !user || roleState?.uid === user.uid;
  const adminRole = user && roleState?.uid === user.uid ? roleState.role : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading: authLoading || !roleReady,
      isAdmin: adminRole !== null,
      adminRole,
      demoMode: !isFirebaseConfigured,
      signOut: signOutUser,
    }),
    [user, authLoading, roleReady, adminRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

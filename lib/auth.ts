import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";
import { saveUserProfile } from "./db";
import type { AppUser } from "./types";

// Auth has two modes (same function signatures, so the UI never changes):
//  - Firebase configured -> real Google + Email/Password login.
//    Firebase keeps the session, so users stay logged in after closing the tab.
//  - not configured      -> DEMO mode: a fake session kept in this browser only.

export interface AuthResult {
  ok: boolean;
  message: string;
  user?: AppUser;
}

// ───────────────────────── helpers ─────────────────────────

export function isAdminEmail(email: string): boolean {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

function friendlyError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in window was closed before finishing.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google popup. Allow popups and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/unauthorized-domain":
      return "This website domain is not authorized in Firebase (Authentication → Settings → Authorized domains).";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Authentication.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function toAppUser(fb: User, nameOverride?: string): AppUser {
  const email = fb.email ?? "";
  return {
    uid: fb.uid,
    name: nameOverride || fb.displayName || email.split("@")[0] || "Trader",
    email,
    provider: fb.providerData[0]?.providerId === "google.com" ? "google" : "password",
  };
}

async function persistProfile(user: AppUser): Promise<void> {
  try {
    await saveUserProfile(user);
  } catch (err) {
    // Never block a login because the profile write failed (e.g. rules not published yet).
    console.warn("Could not save user profile:", err);
  }
}

// ───────────────────────── DEMO session ─────────────────────────

const SESSION_KEY = "fx_session";
const demoListeners = new Set<(user: AppUser | null) => void>();

function demoGet(): AppUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  } catch {
    return null;
  }
}

function demoSet(user: AppUser | null): void {
  try {
    if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  demoListeners.forEach((cb) => cb(user));
}

async function demoLogin(name: string, email: string, provider: AppUser["provider"]): Promise<AuthResult> {
  const clean = email.trim().toLowerCase();
  const user: AppUser = {
    uid: `demo_${clean}`,
    name: name.trim() || clean.split("@")[0],
    email: clean,
    provider,
  };
  await persistProfile(user);
  demoSet(user);
  return { ok: true, message: "Demo mode: Firebase is not connected yet.", user };
}

// ───────────────────────── public API ─────────────────────────

export function subscribeAuth(cb: (user: AppUser | null) => void): () => void {
  if (!isFirebaseConfigured) {
    cb(demoGet());
    demoListeners.add(cb);
    return () => {
      demoListeners.delete(cb);
    };
  }
  return onAuthStateChanged(getFirebaseAuth(), (fb) => cb(fb ? toAppUser(fb) : null));
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isFirebaseConfigured) {
    return demoLogin("Demo Google User", "demo.google@example.com", "demo");
  }
  try {
    const cred = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    const user = toAppUser(cred.user);
    await persistProfile(user);
    return { ok: true, message: `Welcome ${user.name}!`, user };
  } catch (err) {
    return { ok: false, message: friendlyError(err) };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isFirebaseConfigured) return demoLogin("", email, "demo");
  try {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    const user = toAppUser(cred.user);
    await persistProfile(user);
    return { ok: true, message: `Welcome back, ${user.name}!`, user };
  } catch (err) {
    return { ok: false, message: friendlyError(err) };
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isFirebaseConfigured) return demoLogin(name, email, "demo");
  try {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(cred.user, { displayName: name });
    const user = toAppUser(cred.user, name);
    await persistProfile(user);
    return { ok: true, message: `Account created. Welcome, ${user.name}!`, user };
  } catch (err) {
    return { ok: false, message: friendlyError(err) };
  }
}

export async function signOutUser(): Promise<void> {
  if (!isFirebaseConfigured) {
    demoSet(null);
    return;
  }
  await fbSignOut(getFirebaseAuth());
}

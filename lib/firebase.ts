import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// NEXT_PUBLIC_ variables must be written out literally so Next.js can inline them.
const firebaseConfig = {
  // Fallbacks = the "funded-account-b3bcd" Firebase web config (public client keys, safe to ship).
  // Vercel env variables, when set, take priority.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDlN71eBLnjf64jLWxSx6C58kVJBH1Pjd4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "funded-account-b3bcd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "funded-account-b3bcd",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:987471413586:web:0dec1dfcce5ecae64dfa8b",
};

/** When false the whole site runs in DEMO mode (data kept in this browser only). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

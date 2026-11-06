import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "./firebase";
import { mergeConfig, type SiteConfig } from "./siteConfig";
import type { AppUser, NewOrder, OrderRecord, OrderStatus, UserRecord } from "./types";

// One data layer, two backends:
//  - Firebase configured  -> Firestore (shared, real data)
//  - not configured       -> localStorage (DEMO mode, this browser only)

const KEYS = { config: "fx_config", users: "fx_users", orders: "fx_orders" };

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: ignore */
  }
}

/** Firestore rejects `undefined`; a JSON round-trip strips it. */
function plain<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt);

// ───────────────────────── Site config ─────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!isFirebaseConfigured) {
    return mergeConfig(lsGet<Partial<SiteConfig> | null>(KEYS.config, null));
  }
  const snap = await getDoc(doc(getDb(), "config", "site"));
  return mergeConfig(snap.exists() ? (snap.data() as Partial<SiteConfig>) : null);
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(KEYS.config, config);
    return;
  }
  await setDoc(doc(getDb(), "config", "site"), plain(config));
}

// ───────────────────────── Users ─────────────────────────

/** Called after every login / signup so each visitor is saved. */
export async function saveUserProfile(user: AppUser): Promise<void> {
  const now = new Date().toISOString();

  if (!isFirebaseConfigured) {
    const users = lsGet<UserRecord[]>(KEYS.users, []);
    const i = users.findIndex((u) => u.uid === user.uid);
    if (i >= 0) {
      users[i] = { ...users[i], name: user.name, email: user.email, lastLoginAt: now };
    } else {
      users.push({
        uid: user.uid,
        name: user.name,
        email: user.email,
        provider: user.provider,
        role: "user",
        createdAt: now,
        lastLoginAt: now,
      });
    }
    lsSet(KEYS.users, users);
    return;
  }

  const ref = doc(getDb(), "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { name: user.name, email: user.email, lastLoginAt: now });
  } else {
    await setDoc(ref, {
      uid: user.uid,
      name: user.name,
      email: user.email,
      provider: user.provider,
      role: "user",
      createdAt: now,
      lastLoginAt: now,
    });
  }
}

export async function listUsers(): Promise<UserRecord[]> {
  if (!isFirebaseConfigured) {
    return lsGet<UserRecord[]>(KEYS.users, []).sort(byNewest);
  }
  const snap = await getDocs(collection(getDb(), "users"));
  return snap.docs.map((d) => d.data() as UserRecord).sort(byNewest);
}

// ───────────────────────── Orders ─────────────────────────

export async function createOrder(input: NewOrder): Promise<OrderRecord> {
  const data = {
    ...input,
    status: "pending" as OrderStatus,
    createdAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured) {
    const order: OrderRecord = { id: `ord_${Date.now()}`, ...data };
    lsSet(KEYS.orders, [order, ...lsGet<OrderRecord[]>(KEYS.orders, [])]);
    return order;
  }

  const ref = await addDoc(collection(getDb(), "orders"), data);
  return { id: ref.id, ...data };
}

/** Admin: every order. */
export async function listOrders(): Promise<OrderRecord[]> {
  if (!isFirebaseConfigured) {
    return lsGet<OrderRecord[]>(KEYS.orders, []).sort(byNewest);
  }
  const snap = await getDocs(query(collection(getDb(), "orders"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<OrderRecord, "id">), id: d.id }));
}

/** A client's own orders. */
export async function listMyOrders(uid: string): Promise<OrderRecord[]> {
  if (!isFirebaseConfigured) {
    return lsGet<OrderRecord[]>(KEYS.orders, [])
      .filter((o) => o.userId === uid)
      .sort(byNewest);
  }
  const snap = await getDocs(query(collection(getDb(), "orders"), where("userId", "==", uid)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<OrderRecord, "id">), id: d.id }))
    .sort(byNewest);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  if (!isFirebaseConfigured) {
    const orders = lsGet<OrderRecord[]>(KEYS.orders, []).map((o) =>
      o.id === id ? { ...o, status } : o
    );
    lsSet(KEYS.orders, orders);
    return;
  }
  await updateDoc(doc(getDb(), "orders", id), { status });
}

import {
  addDoc,
  collection,
  deleteDoc,
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
import type {
  AccountStats,
  AdminRecord,
  AdminRole,
  AppUser,
  ChangeRequest,
  CommissionRecord,
  CommissionStatus,
  Coupon,
  KycRecord,
  KycStatus,
  NewOrder,
  NewPayout,
  OrderCredentials,
  OrderRecord,
  OrderStatus,
  PayoutRecord,
  PayoutStatus,
  ReferralRecord,
  UserRecord,
} from "./types";

// One data layer, two backends:
//  - Firebase configured  -> Firestore (shared, real data)
//  - not configured       -> localStorage (DEMO mode, this browser only)

const KEYS = {
  config: "fx_config",
  users: "fx_users",
  orders: "fx_orders",
  coupons: "fx_coupons",
  payouts: "fx_payouts",
  kyc: "fx_kyc",
  referrals: "fx_referrals",
  commissions: "fx_commissions",
  ref: "fx_ref",
  admins: "fx_admins",
  requests: "fx_requests",
};

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
    if (i < 0) await registerReferral(user);
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
    await registerReferral(user);
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

  const ref = await addDoc(collection(getDb(), "orders"), plain(data));
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

/** Customer: sends the payment TXID. Moves the order to "review". */
export async function submitOrderPayment(id: string, txid: string): Promise<void> {
  const patch = {
    status: "review" as OrderStatus,
    txid: txid.trim(),
    txSubmittedAt: new Date().toISOString(),
    declineReason: "",
  };
  if (!isFirebaseConfigured) {
    const orders = lsGet<OrderRecord[]>(KEYS.orders, []).map((o) => (o.id === id ? { ...o, ...patch } : o));
    lsSet(KEYS.orders, orders);
    return;
  }
  await updateDoc(doc(getDb(), "orders", id), patch);
}

/** Admin: permanently deletes the selected orders. */
export async function deleteOrders(ids: string[]): Promise<void> {
  if (!isFirebaseConfigured) {
    const gone = new Set(ids);
    lsSet(KEYS.orders, lsGet<OrderRecord[]>(KEYS.orders, []).filter((o) => !gone.has(o.id)));
    return;
  }
  await Promise.all(ids.map((id) => deleteDoc(doc(getDb(), "orders", id))));
}

/** Customer: cancels their own unpaid / declined order (it disappears from their dashboard). */
export async function cancelMyOrder(id: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const orders = lsGet<OrderRecord[]>(KEYS.orders, []).map((o) =>
      o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o
    );
    lsSet(KEYS.orders, orders);
    return;
  }
  await updateDoc(doc(getDb(), "orders", id), { status: "cancelled" });
}

/** Admin: payment not received. The customer sees the reason and can pay again. */
export async function declineOrderPayment(id: string, reason: string): Promise<void> {
  const patch = {
    status: "declined" as OrderStatus,
    declineReason: reason.trim(),
    declinedAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured) {
    const orders = lsGet<OrderRecord[]>(KEYS.orders, []).map((o) => (o.id === id ? { ...o, ...patch } : o));
    lsSet(KEYS.orders, orders);
    return;
  }
  await updateDoc(doc(getDb(), "orders", id), patch);
}

export async function updateOrderCredentials(id: string, credentials: OrderCredentials): Promise<void> {
  if (!isFirebaseConfigured) {
    const orders = lsGet<OrderRecord[]>(KEYS.orders, []).map((o) =>
      o.id === id ? { ...o, credentials } : o
    );
    lsSet(KEYS.orders, orders);
    return;
  }
  await updateDoc(doc(getDb(), "orders", id), { credentials });
}

/** Admin: balance / equity / phase of one account (shown on the customer's dashboard). */
export async function updateOrderStats(id: string, stats: AccountStats): Promise<void> {
  const value = { ...stats, updatedAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    const orders = lsGet<OrderRecord[]>(KEYS.orders, []).map((o) => (o.id === id ? { ...o, stats: value } : o));
    lsSet(KEYS.orders, orders);
    return;
  }
  await updateDoc(doc(getDb(), "orders", id), { stats: value });
}

// ───────────────────────── Coupons ─────────────────────────

const couponId = (code: string) => code.trim().toUpperCase();

export async function listCoupons(): Promise<Coupon[]> {
  if (!isFirebaseConfigured) return lsGet<Coupon[]>(KEYS.coupons, []).sort(byNewest);
  const snap = await getDocs(collection(getDb(), "coupons"));
  return snap.docs.map((d) => d.data() as Coupon).sort(byNewest);
}

export async function saveCoupon(c: Coupon): Promise<void> {
  const coupon = { ...c, code: couponId(c.code) };
  if (!isFirebaseConfigured) {
    const rest = lsGet<Coupon[]>(KEYS.coupons, []).filter((x) => x.code !== coupon.code);
    lsSet(KEYS.coupons, [coupon, ...rest]);
    return;
  }
  await setDoc(doc(getDb(), "coupons", coupon.code), plain(coupon));
}

export async function deleteCoupon(code: string): Promise<void> {
  const id = couponId(code);
  if (!isFirebaseConfigured) {
    lsSet(KEYS.coupons, lsGet<Coupon[]>(KEYS.coupons, []).filter((x) => x.code !== id));
    return;
  }
  await deleteDoc(doc(getDb(), "coupons", id));
}

/** Customer: look up one code. Returns null when it does not exist or is switched off. */
export async function getCoupon(code: string): Promise<Coupon | null> {
  const id = couponId(code);
  if (!id) return null;
  let found: Coupon | null = null;
  if (!isFirebaseConfigured) {
    found = lsGet<Coupon[]>(KEYS.coupons, []).find((c) => c.code === id) ?? null;
  } else {
    const snap = await getDoc(doc(getDb(), "coupons", id));
    found = snap.exists() ? (snap.data() as Coupon) : null;
  }
  return found && found.enabled && found.percent > 0 ? found : null;
}

// ───────────────────────── Payouts ─────────────────────────

export async function createPayout(input: NewPayout): Promise<void> {
  const data = { ...input, status: "pending" as PayoutStatus, createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    const rec: PayoutRecord = { id: `pay_${Date.now()}`, ...data };
    lsSet(KEYS.payouts, [rec, ...lsGet<PayoutRecord[]>(KEYS.payouts, [])]);
    return;
  }
  await addDoc(collection(getDb(), "payouts"), plain(data));
}

export async function listPayouts(): Promise<PayoutRecord[]> {
  if (!isFirebaseConfigured) return lsGet<PayoutRecord[]>(KEYS.payouts, []).sort(byNewest);
  const snap = await getDocs(collection(getDb(), "payouts"));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<PayoutRecord, "id">), id: d.id }))
    .sort(byNewest);
}

export async function listMyPayouts(uid: string): Promise<PayoutRecord[]> {
  if (!isFirebaseConfigured) {
    return lsGet<PayoutRecord[]>(KEYS.payouts, []).filter((p) => p.userId === uid).sort(byNewest);
  }
  const snap = await getDocs(query(collection(getDb(), "payouts"), where("userId", "==", uid)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<PayoutRecord, "id">), id: d.id }))
    .sort(byNewest);
}

export async function updatePayoutStatus(id: string, status: PayoutStatus): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      KEYS.payouts,
      lsGet<PayoutRecord[]>(KEYS.payouts, []).map((p) => (p.id === id ? { ...p, status } : p))
    );
    return;
  }
  await updateDoc(doc(getDb(), "payouts", id), { status });
}

// ───────────────────────── KYC ─────────────────────────

export async function getMyKyc(uid: string): Promise<KycRecord | null> {
  if (!isFirebaseConfigured) {
    return lsGet<KycRecord[]>(KEYS.kyc, []).find((k) => k.userId === uid) ?? null;
  }
  const snap = await getDoc(doc(getDb(), "kyc", uid));
  return snap.exists() ? (snap.data() as KycRecord) : null;
}

export async function submitKyc(
  input: Omit<KycRecord, "status" | "createdAt" | "note">
): Promise<void> {
  const rec: KycRecord = { ...input, status: "pending", createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    const rest = lsGet<KycRecord[]>(KEYS.kyc, []).filter((k) => k.userId !== rec.userId);
    lsSet(KEYS.kyc, [rec, ...rest]);
    return;
  }
  await setDoc(doc(getDb(), "kyc", rec.userId), plain(rec));
}

export async function listKyc(): Promise<KycRecord[]> {
  if (!isFirebaseConfigured) return lsGet<KycRecord[]>(KEYS.kyc, []).sort(byNewest);
  const snap = await getDocs(collection(getDb(), "kyc"));
  return snap.docs.map((d) => d.data() as KycRecord).sort(byNewest);
}

export async function updateKycStatus(userId: string, status: KycStatus, note = ""): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      KEYS.kyc,
      lsGet<KycRecord[]>(KEYS.kyc, []).map((k) => (k.userId === userId ? { ...k, status, note } : k))
    );
    return;
  }
  await updateDoc(doc(getDb(), "kyc", userId), { status, note });
}

// ───────────────────────── Referrals & commissions ─────────────────────────

/** Remember ?ref=<uid> from the link a visitor arrived with. */
export function captureReferral(): void {
  try {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && /^[A-Za-z0-9_-]{6,128}$/.test(ref)) window.localStorage.setItem(KEYS.ref, ref);
  } catch {
    /* storage blocked */
  }
}

/** Called only for brand-new accounts: links them to whoever referred them. */
async function registerReferral(user: AppUser): Promise<void> {
  let refId: string | null = null;
  try {
    refId = window.localStorage.getItem(KEYS.ref);
  } catch {
    return;
  }
  if (!refId || refId === user.uid) return;
  const rec: ReferralRecord = {
    referredUid: user.uid,
    referrerId: refId,
    name: user.name,
    email: user.email,
    createdAt: new Date().toISOString(),
  };
  try {
    if (!isFirebaseConfigured) {
      const rest = lsGet<ReferralRecord[]>(KEYS.referrals, []).filter((r) => r.referredUid !== user.uid);
      lsSet(KEYS.referrals, [rec, ...rest]);
    } else {
      await setDoc(doc(getDb(), "referrals", user.uid), plain(rec));
    }
  } catch (err) {
    console.warn("Could not save referral:", err);
  }
}

export async function listMyReferrals(uid: string): Promise<ReferralRecord[]> {
  if (!isFirebaseConfigured) {
    return lsGet<ReferralRecord[]>(KEYS.referrals, []).filter((r) => r.referrerId === uid).sort(byNewest);
  }
  const snap = await getDocs(query(collection(getDb(), "referrals"), where("referrerId", "==", uid)));
  return snap.docs.map((d) => d.data() as ReferralRecord).sort(byNewest);
}

export async function listMyCommissions(uid: string): Promise<CommissionRecord[]> {
  if (!isFirebaseConfigured) {
    return lsGet<CommissionRecord[]>(KEYS.commissions, []).filter((c) => c.referrerId === uid).sort(byNewest);
  }
  const snap = await getDocs(query(collection(getDb(), "commissions"), where("referrerId", "==", uid)));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<CommissionRecord, "id">), id: d.id })).sort(byNewest);
}

/** Admin: all commissions. */
export async function listCommissions(): Promise<CommissionRecord[]> {
  if (!isFirebaseConfigured) return lsGet<CommissionRecord[]>(KEYS.commissions, []).sort(byNewest);
  const snap = await getDocs(collection(getDb(), "commissions"));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<CommissionRecord, "id">), id: d.id })).sort(byNewest);
}

export async function updateCommissionStatus(id: string, status: CommissionStatus): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      KEYS.commissions,
      lsGet<CommissionRecord[]>(KEYS.commissions, []).map((c) => (c.id === id ? { ...c, status } : c))
    );
    return;
  }
  await updateDoc(doc(getDb(), "commissions", id), { status });
}

/**
 * Admin: keeps the commission of an order in step with the order status.
 * Paid/active order of a referred trader -> pending commission (ratePct of the price).
 * Cancelled/pending order -> a still-pending commission is cancelled.
 * Returns the commission when one was created or changed.
 */
export async function syncCommissionForOrder(
  order: OrderRecord,
  status: OrderStatus,
  ratePct: number
): Promise<CommissionRecord | null> {
  let referral: ReferralRecord | null;
  let existing: CommissionRecord | null;
  if (!isFirebaseConfigured) {
    referral = lsGet<ReferralRecord[]>(KEYS.referrals, []).find((r) => r.referredUid === order.userId) ?? null;
    existing = lsGet<CommissionRecord[]>(KEYS.commissions, []).find((c) => c.id === order.id) ?? null;
  } else {
    const rs = await getDoc(doc(getDb(), "referrals", order.userId));
    referral = rs.exists() ? (rs.data() as ReferralRecord) : null;
    const cs = await getDoc(doc(getDb(), "commissions", order.id));
    existing = cs.exists() ? ({ ...(cs.data() as Omit<CommissionRecord, "id">), id: order.id }) : null;
  }
  if (!referral) return null;

  const earns = status === "paid" || status === "active";
  if (earns && !existing) {
    const rec: CommissionRecord = {
      id: order.id,
      referrerId: referral.referrerId,
      referredUid: order.userId,
      buyerName: order.name,
      orderId: order.id,
      orderPrice: order.price,
      ratePct,
      amount: Math.round(order.price * ratePct) / 100,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    if (!isFirebaseConfigured) lsSet(KEYS.commissions, [rec, ...lsGet<CommissionRecord[]>(KEYS.commissions, [])]);
    else await setDoc(doc(getDb(), "commissions", rec.id), plain(rec));
    return rec;
  }
  if (earns && existing && existing.status === "cancelled") {
    await updateCommissionStatus(existing.id, "pending");
    return { ...existing, status: "pending" };
  }
  if (!earns && existing && existing.status === "pending") {
    await updateCommissionStatus(existing.id, "cancelled");
    return { ...existing, status: "cancelled" };
  }
  return null;
}

// ───────────────────────── Admin team & change requests ─────────────────────────

const emailId = (email: string) => email.trim().toLowerCase();

/** The role of a non-owner admin, or null when this email is not an admin. */
export async function getAdminRole(email: string): Promise<AdminRole | null> {
  const id = emailId(email);
  if (!isFirebaseConfigured) {
    return lsGet<AdminRecord[]>(KEYS.admins, []).find((a) => a.email === id)?.role ?? null;
  }
  const snap = await getDoc(doc(getDb(), "admins", id));
  return snap.exists() ? ((snap.data() as AdminRecord).role ?? null) : null;
}

export async function listAdmins(): Promise<AdminRecord[]> {
  if (!isFirebaseConfigured) return lsGet<AdminRecord[]>(KEYS.admins, []);
  const snap = await getDocs(collection(getDb(), "admins"));
  return snap.docs.map((d) => d.data() as AdminRecord).sort((a, b) => a.addedAt.localeCompare(b.addedAt));
}

export async function saveAdmin(rec: AdminRecord): Promise<void> {
  const admin = { ...rec, email: emailId(rec.email) };
  if (!isFirebaseConfigured) {
    const rest = lsGet<AdminRecord[]>(KEYS.admins, []).filter((a) => a.email !== admin.email);
    lsSet(KEYS.admins, [...rest, admin]);
    return;
  }
  await setDoc(doc(getDb(), "admins", admin.email), plain(admin));
}

export async function removeAdmin(email: string): Promise<void> {
  const id = emailId(email);
  if (!isFirebaseConfigured) {
    lsSet(KEYS.admins, lsGet<AdminRecord[]>(KEYS.admins, []).filter((a) => a.email !== id));
    return;
  }
  await deleteDoc(doc(getDb(), "admins", id));
}

export async function createChangeRequest(
  input: Omit<ChangeRequest, "id" | "status" | "createdAt">
): Promise<void> {
  const data = { ...input, status: "pending" as const, createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    const rec: ChangeRequest = { id: `req_${Date.now()}`, ...data };
    lsSet(KEYS.requests, [rec, ...lsGet<ChangeRequest[]>(KEYS.requests, [])]);
    return;
  }
  await addDoc(collection(getDb(), "changeRequests"), plain(data));
}

export async function listChangeRequests(): Promise<ChangeRequest[]> {
  if (!isFirebaseConfigured) return lsGet<ChangeRequest[]>(KEYS.requests, []).sort(byNewest);
  const snap = await getDocs(collection(getDb(), "changeRequests"));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<ChangeRequest, "id">), id: d.id }))
    .sort(byNewest);
}

export async function decideChangeRequest(
  id: string,
  status: "approved" | "rejected",
  by: string
): Promise<void> {
  const fields = { status, decidedAt: new Date().toISOString(), decidedBy: by };
  if (!isFirebaseConfigured) {
    lsSet(
      KEYS.requests,
      lsGet<ChangeRequest[]>(KEYS.requests, []).map((r) => (r.id === id ? { ...r, ...fields } : r))
    );
    return;
  }
  await updateDoc(doc(getDb(), "changeRequests", id), fields);
}

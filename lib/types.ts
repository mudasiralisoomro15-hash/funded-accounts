/**
 * pending   = waiting for the customer to pay and send the TXID
 * review    = TXID submitted, admin is checking the wallet
 * paid      = payment approved, account not delivered yet
 * active    = MT5 login delivered
 * declined  = admin did not receive the payment (customer can submit again)
 * cancelled = closed by admin
 */
export type OrderStatus = "pending" | "review" | "paid" | "active" | "declined" | "cancelled";

/** The signed-in user as the UI sees it. */
export interface AppUser {
  uid: string;
  name: string;
  email: string;
  provider: "google" | "password" | "demo";
}

/** A user document saved in the database (shown in the admin panel). */
export interface UserRecord {
  uid: string;
  name: string;
  email: string;
  provider: string;
  role: "user";
  createdAt: string;
  lastLoginAt: string;
}

/** Account numbers the admin types in by hand (until live MetaApi data is connected). */
export interface AccountStats {
  /** "Phase 1" | "Phase 2" | "Funded" */
  phase: string;
  balance: number;
  equity: number;
  todayProfit: number;
  /** Trading days completed so far. */
  tradingDays: number;
  updatedAt?: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  email: string;
  name: string;
  modelId: string;
  modelName: string;
  size: number;
  price: number;
  status: OrderStatus;
  createdAt: string;
  coupon?: string;
  /** Blockchain transaction id the customer typed after paying. */
  txid?: string;
  txSubmittedAt?: string;
  /** Shown to the customer when the payment was declined. */
  declineReason?: string;
  declinedAt?: string;
  /** Balance / equity / phase typed by the admin. Missing = fresh account. */
  stats?: AccountStats;
  /** MT5 login handed over by the admin when the account is delivered. */
  credentials?: OrderCredentials;
}

export interface OrderCredentials {
  login: string;
  password: string;
  server: string;
}

export type NewOrder = Omit<
  OrderRecord,
  "id" | "status" | "createdAt" | "credentials" | "txid" | "txSubmittedAt" | "declineReason" | "declinedAt" | "stats"
>;

export interface Coupon {
  code: string;
  percent: number;
  enabled: boolean;
  createdAt: string;
}

/** Created once when a visitor signs up through someone's referral link. */
export interface ReferralRecord {
  referredUid: string;
  referrerId: string;
  name: string;
  email: string;
  createdAt: string;
}

export type CommissionStatus = "pending" | "released" | "cancelled";

/** One commission per paid order of a referred trader (document id = order id). */
export interface CommissionRecord {
  id: string;
  referrerId: string;
  referredUid: string;
  buyerName: string;
  orderId: string;
  orderPrice: number;
  ratePct: number;
  amount: number;
  status: CommissionStatus;
  createdAt: string;
}

export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";

export interface PayoutRecord {
  id: string;
  userId: string;
  email: string;
  name: string;
  amount: number;
  method: "USDT";
  /** "referral" = withdrawal of referral commission. */
  type?: "profit" | "referral";
  address: string;
  status: PayoutStatus;
  createdAt: string;
}

export type NewPayout = Omit<PayoutRecord, "id" | "status" | "createdAt">;

export type KycStatus = "pending" | "approved" | "rejected";

/** One KYC submission per user (document id = user id). */
export interface KycRecord {
  userId: string;
  email: string;
  name: string;
  fullName: string;
  country: string;
  documentUrl: string;
  status: KycStatus;
  createdAt: string;
  note?: string;
}

/** "full" edits directly; "approval" can only suggest site changes (the owner approves). */
export type AdminRole = "full" | "approval";

export interface AdminRecord {
  email: string;
  role: AdminRole;
  addedAt: string;
  addedBy: string;
}

export type RequestStatus = "pending" | "approved" | "rejected";

/** A site edit made by an "approval" admin, waiting for the owner. */
export interface ChangeRequest {
  id: string;
  requesterEmail: string;
  requesterName: string;
  /** Human-readable list of what changed. */
  summary: string[];
  /** The new values of the changed top-level site settings. */
  patch: Record<string, unknown>;
  status: RequestStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export type OrderStatus = "pending" | "paid" | "active" | "cancelled";

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
  /** MT5 login handed over by the admin when the account is delivered. */
  credentials?: OrderCredentials;
}

export interface OrderCredentials {
  login: string;
  password: string;
  server: string;
}

export type NewOrder = Omit<OrderRecord, "id" | "status" | "createdAt" | "credentials">;

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

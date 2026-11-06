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
}

export type NewOrder = Omit<OrderRecord, "id" | "status" | "createdAt">;

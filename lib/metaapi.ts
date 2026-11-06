import type { PlanSelection } from "./plans";

// ─────────────────────────────────────────────────────────────
// METAAPI STUB — SERVER-SIDE ONLY (call from an API route / webhook,
// never from client components, because METAAPI_TOKEN must stay secret).
//
// Setup:   npm i metaapi.cloud-sdk
// Env:     METAAPI_TOKEN, METAAPI_REGION  (see .env.example)
//
// Typical use: after the payment webhook confirms a purchase, create the
// trading account on your broker server, deploy it, and store the login
// details against the user in your database.
// ─────────────────────────────────────────────────────────────

export interface ProvisionedAccount {
  stub: boolean;
  metaApiAccountId: string | null;
  login: string | null;
  server: string | null;
}

export async function provisionTradingAccount(
  order: PlanSelection,
  userId: string
): Promise<ProvisionedAccount> {
  // TODO(metaapi):
  //   import MetaApi from "metaapi.cloud-sdk";
  //   const api = new MetaApi(process.env.METAAPI_TOKEN!);
  //   const account = await api.metatraderAccountApi.createAccount({
  //     name: `${userId}-${order.modelId}-${order.size}`,
  //     type: "cloud",
  //     login: "<broker login>",
  //     password: "<broker password>",
  //     server: "<broker server>",
  //     platform: "mt5",
  //     magic: 0,
  //   });
  //   await account.deploy();
  //   // Then apply the rules from lib/plans.ts (daily loss, max drawdown, targets)
  //   // via MetaApi's risk-management API / your own monitoring job.
  void order;
  void userId;
  return { stub: true, metaApiAccountId: null, login: null, server: null };
}

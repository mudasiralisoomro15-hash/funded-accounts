import type { PlanSelection } from "./plans";

// ─────────────────────────────────────────────────────────────
// PAYMENT STUB.
// Real flow (recommended):
//   1. Client calls YOUR server route:  POST /api/checkout  { modelId, size }
//   2. The server re-computes the price from lib/plans.ts (never trust a
//      price sent by the browser), creates a session with your gateway
//      (Stripe / Cryptomus / NOWPayments / Coinbase Commerce ...) and
//      returns { checkoutUrl }.
//   3. Client does: window.location.href = checkoutUrl
//   4. The gateway calls POST /api/webhooks/payment on success. Verify the
//      signature with PAYMENT_WEBHOOK_SECRET, then call
//      provisionTradingAccount() from lib/metaapi.ts.
// Secret keys live only on the server (.env, no NEXT_PUBLIC_ prefix).
// ─────────────────────────────────────────────────────────────

export interface CheckoutResult {
  ok: boolean;
  stub: boolean;
  checkoutUrl: string | null;
  message: string;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function createCheckoutSession(
  order: PlanSelection,
  customerEmail?: string
): Promise<CheckoutResult> {
  // TODO(payments):
  //   const res = await fetch("/api/checkout", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ modelId: order.modelId, size: order.size, email: customerEmail }),
  //   });
  //   const data = await res.json();
  //   return { ok: res.ok, stub: false, checkoutUrl: data.checkoutUrl, message: "Redirecting…" };
  void order;
  void customerEmail;
  await wait(500);
  return {
    ok: true,
    stub: true,
    checkoutUrl: null,
    message: "Checkout is a stub. Plug your payment gateway into lib/payments.ts.",
  };
}

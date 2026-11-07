"use client";

import { HandCoins, Wallet } from "lucide-react";
import { useMyOrders } from "@/components/dashboard/useMyOrders";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";

export default function PayoutPage() {
  const { orders } = useMyOrders();
  const hasActive = (orders ?? []).some((o) => o.status === "active");

  return (
    <>
      <PageHeader title="Payout" subtitle="Withdraw your profits via Crypto (USDT) or bank transfer." />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="dash-card p-5">
          <p className="dash-sub flex items-center gap-2 text-xs font-medium">
            <Wallet className="h-4 w-4" /> Available to withdraw
          </p>
          <p className="dash-text mt-2 text-3xl font-bold">$0.00</p>
          <button type="button" disabled className="dash-btn mt-4 w-full">
            Request Payout
          </button>
          <p className="dash-sub mt-2 text-xs">
            {hasActive
              ? "Payouts open once your funded account reaches its first payout date."
              : "Available after you have an active funded account."}
          </p>
        </div>

        <div className="dash-card p-5">
          <h2 className="dash-text text-sm font-semibold">Payout info</h2>
          <ul className="dash-sub mt-3 list-inside list-disc space-y-1.5 text-sm">
            <li>Processed within 48 hours</li>
            <li>Methods: USDT (crypto) and bank transfer</li>
            <li>Daily payouts, minimum $20, paid in crypto after KYC</li>
          </ul>
        </div>
      </div>

      <section className="dash-card mt-6">
        <h2 className="dash-text dash-border border-b px-5 py-4 font-semibold">Payout history</h2>
        <EmptyState
          icon={HandCoins}
          title="No payouts yet"
          text="Your payout requests and their status will be listed here."
        />
      </section>
    </>
  );
}

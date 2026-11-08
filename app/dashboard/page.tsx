"use client";

import Link from "next/link";
import { Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMyOrders } from "@/components/dashboard/useMyOrders";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import AccountCard from "@/components/dashboard/AccountCard";
import { formatSize } from "@/lib/plans";

export default function OverviewPage() {
  const { user } = useAuth();
  const { orders, error, patchOrder } = useMyOrders();

  const list = orders ?? [];
  const accounts = list.filter((o) => o.status !== "cancelled");
  const declined = list.filter((o) => o.status === "declined");

  return (
    <>
      <PageHeader title="Accounts Overview" subtitle={`Welcome, ${user?.name ?? "Trader"}. Your accounts at a glance.`} />

      {declined.map((o) => (
        <p key={o.id} className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <span className="font-semibold">
            Payment declined for {o.modelName} ({formatSize(o.size)}):
          </span>{" "}
          {o.declineReason?.trim() || "We have not received your payment."} Please pay and submit the correct TXID on the account card below.
        </p>
      ))}

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <section className="mt-2">
        {orders === null && !error ? (
          <Loader2 className="dash-primary-text mx-auto my-10 h-6 w-6 animate-spin" />
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            text="Start a challenge. Your accounts appear here, and turn Ongoing once activated."
            action={
              <Link href="/#models" className="dash-btn">
                View Funded Plans
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {accounts.map((o) => (
              <AccountCard key={o.id} order={o} onChange={(patch) => patchOrder(o.id, patch)} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import Link from "next/link";
import { Loader2, Plus, Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMyOrders } from "@/components/dashboard/useMyOrders";
import { DashStatus, EmptyState, PageHeader } from "@/components/dashboard/ui";
import { formatDate } from "@/components/admin/ui";
import AccountCard from "@/components/dashboard/AccountCard";
import { formatSize, formatUSD } from "@/lib/plans";

export default function OverviewPage() {
  const { user } = useAuth();
  const { orders, error, patchOrder } = useMyOrders();

  const list = orders ?? [];
  const active = list.filter((o) => o.status === "active");
  const accounts = list.filter((o) => o.status !== "cancelled");
  const pending = list.filter((o) => o.status === "pending" || o.status === "review").length;
  const declined = list.filter((o) => o.status === "declined");
  const invested = list.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.price, 0);

  const stats = [
    { label: "Total orders", value: String(list.length) },
    { label: "Awaiting payment", value: String(pending) },
    { label: "Active accounts", value: String(active.length) },
    { label: "Total invested", value: formatUSD(invested) },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "Trader"}`}
        subtitle="Your accounts and orders at a glance."
        action={
          <Link href="/#models" className="dash-btn">
            <Plus className="h-4 w-4" /> Start New Challenge
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="dash-card p-4">
            <p className="dash-sub text-xs font-medium">{s.label}</p>
            <p className="dash-text mt-1.5 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

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

      <section className="dash-card mt-6">
        <h2 className="dash-text dash-border border-b px-5 py-4 font-semibold">Accounts Overview</h2>
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
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((o) => (
              <AccountCard key={o.id} order={o} onChange={(patch) => patchOrder(o.id, patch)} />
            ))}
          </div>
        )}
      </section>

      <section className="dash-card mt-6">
        <h2 className="dash-text dash-border border-b px-5 py-4 font-semibold">Recent orders</h2>
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="dash-sub dash-border border-b text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="dash-border border-b last:border-b-0">
                    <td className="dash-sub px-5 py-3">{formatDate(o.createdAt)}</td>
                    <td className="dash-text px-5 py-3 font-medium">{o.modelName}</td>
                    <td className="dash-text px-5 py-3">{formatSize(o.size)}</td>
                    <td className="dash-text px-5 py-3 font-semibold">{formatUSD(o.price)}</td>
                    <td className="px-5 py-3">
                      <DashStatus status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          orders && <p className="dash-sub px-5 py-8 text-center text-sm">No orders yet.</p>
        )}
      </section>
    </>
  );
}

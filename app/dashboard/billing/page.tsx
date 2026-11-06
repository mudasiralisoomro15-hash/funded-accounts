"use client";

import Link from "next/link";
import { Loader2, Receipt } from "lucide-react";
import { useMyOrders } from "@/components/dashboard/useMyOrders";
import { DashStatus, EmptyState, PageHeader } from "@/components/dashboard/ui";
import { formatDate } from "@/components/admin/ui";
import { formatSize, formatUSD } from "@/lib/plans";

export default function BillingPage() {
  const { orders, error } = useMyOrders();

  return (
    <>
      <PageHeader title="Billing" subtitle="Your purchases and payment status." />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <section className="dash-card">
        {orders === null && !error ? (
          <Loader2 className="dash-primary-text mx-auto my-10 h-6 w-6 animate-spin" />
        ) : orders && orders.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No purchases yet"
            text="When you buy an account, it shows up here."
            action={
              <Link href="/#models" className="dash-btn">
                View Funded Plans
              </Link>
            }
          />
        ) : (
          orders && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="dash-sub dash-border border-b text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Size</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="dash-border border-b last:border-b-0">
                      <td className="dash-sub px-5 py-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
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
          )
        )}
      </section>
    </>
  );
}

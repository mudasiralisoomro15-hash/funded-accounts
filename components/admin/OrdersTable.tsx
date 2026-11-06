"use client";

import { useMemo, useState } from "react";
import { formatSize, formatUSD } from "@/lib/plans";
import type { OrderRecord, OrderStatus } from "@/lib/types";
import { Panel, formatDate, inputCls } from "./ui";

const STATUSES: OrderStatus[] = ["pending", "paid", "active", "cancelled"];

interface OrdersTableProps {
  orders: OrderRecord[];
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  return (
    <Panel
      title={`Orders (${orders.length})`}
      subtitle="Every “Buy Account” request. Change the status as you receive payment and deliver the account."
      action={
        <select
          aria-label="Filter by status"
          className={`${inputCls} w-auto`}
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderStatus | "all")}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 text-slate-400">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{o.name}</p>
                  <p className="text-xs text-slate-500">{o.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{o.modelName}</td>
                <td className="px-4 py-3 text-slate-300">{formatSize(o.size)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-400">{formatUSD(o.price)}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Status for order ${o.id}`}
                    className={`${inputCls} w-auto py-1.5`}
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {orders.length === 0 ? "No orders yet." : "No orders with this status."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

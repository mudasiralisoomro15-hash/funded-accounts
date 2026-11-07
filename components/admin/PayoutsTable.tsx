"use client";

import { formatUSD } from "@/lib/plans";
import type { PayoutRecord, PayoutStatus } from "@/lib/types";
import { Panel, formatDate, inputCls } from "./ui";

const STATUSES: PayoutStatus[] = ["pending", "approved", "paid", "rejected"];

export default function PayoutsTable({
  payouts,
  onStatusChange,
}: {
  payouts: PayoutRecord[];
  onStatusChange: (id: string, status: PayoutStatus) => void;
}) {
  return (
    <Panel
      title={`Payout requests (${payouts.length})`}
      subtitle="Send the USDT to the wallet below, then mark the request as paid."
    >
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Trader</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">USDT wallet</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 text-slate-400">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-blue-400">{formatUSD(p.amount)}</td>
                <td className="max-w-[260px] break-all px-4 py-3 font-mono text-xs text-slate-300">{p.address}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Status for payout ${p.id}`}
                    className={`${inputCls} w-auto py-1.5`}
                    value={p.status}
                    onChange={(e) => onStatusChange(p.id, e.target.value as PayoutStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No payout requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

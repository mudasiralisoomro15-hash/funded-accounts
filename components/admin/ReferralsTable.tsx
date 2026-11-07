"use client";

import { formatUSD } from "@/lib/plans";
import type { CommissionRecord, CommissionStatus, UserRecord } from "@/lib/types";
import { Panel, formatDate, inputCls } from "./ui";

const STATUSES: CommissionStatus[] = ["pending", "released", "cancelled"];

export default function ReferralsTable({
  commissions,
  users,
  ratePct,
  onStatusChange,
}: {
  commissions: CommissionRecord[];
  users: UserRecord[];
  ratePct: number;
  onStatusChange: (id: string, status: CommissionStatus) => void;
}) {
  const who = (uid: string) => users.find((u) => u.uid === uid);
  return (
    <Panel
      title={`Referral commissions (${commissions.length})`}
      subtitle={`Created automatically when a referred trader's order is set to paid/active (${ratePct}%). Set "released" to add it to the referrer's wallet balance. Change the % in Site Content.`}
    >
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Referrer</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Commission</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => {
              const r = who(c.referrerId);
              return (
                <tr key={c.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-4 py-3 text-slate-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{r?.name ?? "Unknown"}</p>
                    <p className="text-xs text-slate-500">{r?.email ?? c.referrerId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.buyerName}</td>
                  <td className="px-4 py-3 text-slate-300">{formatUSD(c.orderPrice)}</td>
                  <td className="px-4 py-3 font-semibold text-orange-400">
                    {formatUSD(c.amount)} <span className="text-xs font-normal text-slate-500">({c.ratePct}%)</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status for commission ${c.id}`}
                      className={`${inputCls} w-auto py-1.5`}
                      value={c.status}
                      onChange={(e) => onStatusChange(c.id, e.target.value as CommissionStatus)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {commissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No commissions yet. They appear when a referred trader&apos;s order is marked paid or active.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

"use client";

import { Check, ExternalLink, X } from "lucide-react";
import type { KycRecord, KycStatus } from "@/lib/types";
import { Panel, formatDate } from "./ui";

const TONE: Record<KycStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};

export default function KycTable({
  items,
  onDecision,
}: {
  items: KycRecord[];
  onDecision: (userId: string, status: KycStatus) => void;
}) {
  const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : "");
  return (
    <Panel
      title={`KYC verification (${items.length})`}
      subtitle="Open the document link, check the name matches, then approve or reject. Approved users can request payouts."
    >
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Legal name</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((k) => (
              <tr key={k.userId} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 text-slate-400">{formatDate(k.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{k.name}</p>
                  <p className="text-xs text-slate-500">{k.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{k.fullName}</td>
                <td className="px-4 py-3 text-slate-300">{k.country}</td>
                <td className="px-4 py-3">
                  {safeUrl(k.documentUrl) ? (
                    <a href={safeUrl(k.documentUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-500">invalid link</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${TONE[k.status]}`}>{k.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button type="button" aria-label="Approve" onClick={() => onDecision(k.userId, "approved")} className="rounded-lg border border-emerald-500/30 p-2 text-emerald-300 hover:bg-emerald-500/10">
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Reject" onClick={() => onDecision(k.userId, "rejected")} className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">No KYC submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

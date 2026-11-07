"use client";

import { Check, X } from "lucide-react";
import type { ChangeRequest } from "@/lib/types";
import { Panel, formatDate } from "./ui";

const TONE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};

interface Props {
  requests: ChangeRequest[];
  isOwner: boolean;
  myEmail: string;
  onDecide: (req: ChangeRequest, status: "approved" | "rejected") => Promise<void>;
}

export default function RequestsPanel({ requests, isOwner, myEmail, onDecide }: Props) {
  const list = isOwner ? requests : requests.filter((r) => r.requesterEmail === myEmail);
  return (
    <Panel
      title={isOwner ? `Change requests (${requests.filter((r) => r.status === "pending").length} pending)` : "My requests"}
      subtitle={
        isOwner
          ? "Edits made by admins who need your approval. Approve to publish them on the website, or reject to throw them away."
          : "Your edits are sent to the owner. They go live only after approval."
      }
    >
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{r.requesterName || r.requesterEmail}</p>
                <p className="text-xs text-slate-500">
                  {r.requesterEmail} · {formatDate(r.createdAt)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${TONE[r.status]}`}>{r.status}</span>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-300">
              {r.summary.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            {isOwner && r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => void onDecide(r, "approved")} className="btn-glow px-4 py-2 text-sm">
                  <Check className="h-4 w-4" /> Approve &amp; publish
                </button>
                <button
                  type="button"
                  onClick={() => void onDecide(r, "rejected")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
            {r.status !== "pending" && r.decidedAt && (
              <p className="mt-3 text-xs text-slate-500">
                {r.status} on {formatDate(r.decidedAt)}
                {r.decidedBy ? ` by ${r.decidedBy}` : ""}
              </p>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No requests.</p>}
      </div>
    </Panel>
  );
}

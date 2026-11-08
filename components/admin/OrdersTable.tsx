"use client";

import { Fragment, useMemo, useState } from "react";
import { Check, ExternalLink, KeyRound, X } from "lucide-react";
import { formatSize, formatUSD } from "@/lib/plans";
import type { OrderCredentials, OrderRecord, OrderStatus } from "@/lib/types";
import { Field, Panel, formatDate, inputCls } from "./ui";
import { isChainTxid } from "@/components/PaymentPanel";

const STATUSES: OrderStatus[] = ["pending", "review", "paid", "active", "declined", "cancelled"];

const DEFAULT_DECLINE =
  "We have not received your payment. Please send the exact amount and submit the correct transaction ID.";

interface OrdersTableProps {
  orders: OrderRecord[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  onCredentials: (id: string, creds: OrderCredentials) => Promise<void>;
  onDecline: (id: string, reason: string) => void;
}

function CredentialsForm({
  order,
  onSave,
}: {
  order: OrderRecord;
  onSave: (id: string, creds: OrderCredentials) => Promise<void>;
}) {
  const [c, setC] = useState<OrderCredentials>(order.credentials ?? { login: "", password: "", server: "" });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const set = (k: keyof OrderCredentials, v: string) => setC((x) => ({ ...x, [k]: v }));

  async function save() {
    setState("saving");
    try {
      await onSave(order.id, c);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
      <Field label="MT5 login">
        <input className={inputCls} value={c.login} onChange={(e) => set("login", e.target.value)} />
      </Field>
      <Field label="Password">
        <input className={inputCls} value={c.password} onChange={(e) => set("password", e.target.value)} />
      </Field>
      <Field label="Server">
        <input className={inputCls} value={c.server} onChange={(e) => set("server", e.target.value)} />
      </Field>
      <button type="button" onClick={save} disabled={state === "saving"} className="btn-glow px-4 py-2.5 text-sm">
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : state === "error" ? "Failed, retry" : "Save & show to user"}
      </button>
    </div>
  );
}

export default function OrdersTable({ orders, onStatusChange, onCredentials, onDecline }: OrdersTableProps) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  // A TXID used on more than one order is suspicious (the same payment claimed twice).
  const dupTx = useMemo(() => {
    const count = new Map<string, number>();
    for (const o of orders) {
      const t = o.txid?.trim().toLowerCase();
      if (t) count.set(t, (count.get(t) ?? 0) + 1);
    }
    return new Set([...count].filter(([, n]) => n > 1).map(([t]) => t));
  }, [orders]);

  function decline(o: OrderRecord) {
    const reason = window.prompt(
      `Decline payment of ${o.name}?\nThis message is shown to the customer:`,
      DEFAULT_DECLINE
    );
    if (reason === null) return;
    onDecline(o.id, reason.trim() || DEFAULT_DECLINE);
  }

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  return (
    <Panel
      title={`Orders (${orders.length})`}
      subtitle="Customers send USDT and their TXID. Check the money in your wallet, then press Approve (or Decline), then add the MT5 login."
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
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Payment / TXID</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Account</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <Fragment key={o.id}>
              <tr className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 text-slate-400">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{o.name}</p>
                  <p className="text-xs text-slate-500">{o.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-300">{o.modelName}</td>
                <td className="px-4 py-3 text-slate-300">{formatSize(o.size)}</td>
                <td className="px-4 py-3 font-semibold text-blue-400">{formatUSD(o.price)}{o.coupon && <span className="ml-1.5 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold text-orange-300">{o.coupon}</span>}</td>
                <td className="max-w-[220px] px-4 py-3 align-top">
                  {o.txid ? (
                    <div className="space-y-1.5">
                      <p className="break-all font-mono text-[11px] text-slate-300">{o.txid}</p>
                      {dupTx.has(o.txid.trim().toLowerCase()) && (
                        <p className="text-[11px] font-semibold text-red-400">Same TXID used on another order!</p>
                      )}
                      {isChainTxid(o.txid) && (
                        <a
                          href={`https://bscscan.com/tx/${o.txid.trim()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                        >
                          Check on BscScan <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No TXID yet</span>
                  )}
                  {o.status === "declined" && o.declineReason && (
                    <p className="mt-1.5 text-[11px] text-red-300">Reason: {o.declineReason}</p>
                  )}
                  {(o.status === "review" || o.status === "pending") && (
                    <div className="mt-2 flex gap-1.5">
                      {o.status === "review" && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(o.id, "paid")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => decline(o)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
                      >
                        <X className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
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
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpen(open === o.id ? null : o.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                      o.credentials ? "border-emerald-500/30 text-emerald-300" : "border-white/10 text-slate-300"
                    } hover:bg-white/5`}
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Login
                  </button>
                </td>
              </tr>
              {open === o.id && (
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <td colSpan={8} className="px-4 py-4">
                    <CredentialsForm order={o} onSave={onCredentials} />
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
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

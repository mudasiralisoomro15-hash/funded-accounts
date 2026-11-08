"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import type { AccountView, Objective } from "@/lib/objectives";
import { money, signedMoney } from "@/lib/objectives";
import type { OrderRecord } from "@/lib/types";

const toneCls = (tone?: "good" | "bad") =>
  tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-red-500" : "dash-text";

function Ring({ pct, kind, breached, met }: { pct: number; kind: "used" | "done"; breached: boolean; met: boolean }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const color = breached ? "#ef4444" : met ? "#10b981" : kind === "used" && pct >= 70 ? "#f59e0b" : "#3b82f6";
  return (
    <svg viewBox="0 0 40 40" className="h-11 w-11 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="dash-sub opacity-20" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * Math.min(100, Math.max(0, pct))) / 100}
      />
    </svg>
  );
}

function StatusDot({ o }: { o: Objective }) {
  const label = o.breached ? "Breached" : o.met ? "Completed" : "Ongoing";
  const cls = o.breached ? "bg-red-500" : o.met ? "bg-emerald-500" : "bg-blue-500";
  return (
    <span className="dash-sub inline-flex items-center gap-1.5 text-[11px] font-semibold">
      <span className={`h-1.5 w-1.5 rounded-full ${cls}`} /> {label}
    </span>
  );
}

export function ObjectivesList({ view }: { view: AccountView }) {
  return (
    <div className="space-y-3">
      {view.objectives.map((o) => (
        <div key={o.key} className="dash-border rounded-xl border p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <StatusDot o={o} />
              <h3 className="dash-text mt-1 text-sm font-bold">{o.title}</h3>
            </div>
            <Ring pct={o.pct} kind={o.kind} breached={o.breached} met={o.met} />
          </div>
          <dl className="mt-2 space-y-1 text-xs">
            {o.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-3">
                <dt className="dash-sub">{r.label}</dt>
                <dd className={`font-semibold ${toneCls(r.tone)}`}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

export function StatsList({ view }: { view: AccountView }) {
  const rows: { label: string; value: string; tone?: "good" | "bad" }[] = [
    { label: "Balance", value: money(view.stats.balance) },
    { label: "Equity", value: money(view.stats.equity) },
    { label: "Total PnL", value: signedMoney(view.totalPnl), tone: view.totalPnl > 0 ? "good" : view.totalPnl < 0 ? "bad" : undefined },
    { label: "Floating PnL", value: signedMoney(view.floatingPnl), tone: view.floatingPnl > 0 ? "good" : view.floatingPnl < 0 ? "bad" : undefined },
  ];
  return (
    <div className="dash-border divide-y rounded-xl border [&>*]:dash-border">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span className="dash-sub">{r.label}</span>
          <span className={`font-semibold ${toneCls(r.tone)}`}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      className="dash-sub dash-hover rounded-md p-1.5"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function CredentialsBox({ order, email }: { order: OrderRecord; email?: string }) {
  const [show, setShow] = useState(false);
  const c = order.credentials;
  if (!c) {
    return (
      <p className="dash-sub dash-border rounded-xl border px-4 py-5 text-center text-sm">
        Your MT5 login will appear here once your payment is confirmed and the account is ready.
      </p>
    );
  }
  const rows: { label: string; value: string; secret?: boolean }[] = [
    { label: "Login", value: c.login },
    { label: "Password", value: c.password, secret: true },
    ...(email ? [{ label: "Email", value: email }] : []),
    { label: "Server", value: c.server },
  ];
  return (
    <div className="dash-border divide-y rounded-xl border [&>*]:dash-border">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="dash-sub text-[11px] font-medium uppercase tracking-wider">{r.label}</p>
            <p className="dash-text mt-0.5 break-all font-mono text-sm font-semibold">
              {r.secret && !show ? "••••••••••" : r.value}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            {r.secret && (
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                className="dash-sub dash-hover rounded-md p-1.5"
                onClick={() => setShow((v) => !v)}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            <CopyBtn value={r.value} />
          </div>
        </div>
      ))}
    </div>
  );
}

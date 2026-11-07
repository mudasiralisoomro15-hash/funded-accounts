"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@/lib/types";
import { Field, Panel, Toggle, formatDate, inputCls } from "./ui";

interface Props {
  coupons: Coupon[];
  onSave: (c: Coupon) => Promise<void>;
  onDelete: (code: string) => Promise<void>;
}

export default function CouponsManager({ coupons, onSave, onDelete }: Props) {
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    const c = code.trim().toUpperCase();
    const p = Number(percent);
    if (!/^[A-Z0-9_-]{3,20}$/.test(c)) return setErr("Code: 3-20 letters/numbers (e.g. SAVE10).");
    if (!(p > 0 && p <= 90)) return setErr("Percent must be between 1 and 90.");
    setBusy(true);
    setErr(null);
    try {
      await onSave({ code: c, percent: p, enabled: true, createdAt: new Date().toISOString() });
      setCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save coupon.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title={`Coupons (${coupons.length})`}
      subtitle="Customers enter a code at checkout and get this % off the price shown."
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
        <Field label="Code">
          <input className={inputCls} value={code} placeholder="SAVE10" onChange={(e) => setCode(e.target.value)} />
        </Field>
        <Field label="Discount (%)">
          <input className={inputCls} type="number" min={1} max={90} value={percent} onChange={(e) => setPercent(e.target.value)} />
        </Field>
        <button type="button" onClick={add} disabled={busy} className="btn-glow px-5 py-2.5 text-sm">
          <Plus className="h-4 w-4" /> Add coupon
        </button>
      </div>
      {err && <p className="mt-3 text-sm text-red-300">{err}</p>}

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 font-mono font-semibold text-white">{c.code}</td>
                <td className="px-4 py-3 font-semibold text-orange-400">{c.percent}% off</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <Toggle checked={c.enabled} label={c.enabled ? "On" : "Off"} onChange={(v) => void onSave({ ...c, enabled: v })} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Delete ${c.code}`}
                    onClick={() => window.confirm(`Delete coupon ${c.code}?`) && void onDelete(c.code)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">No coupons yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

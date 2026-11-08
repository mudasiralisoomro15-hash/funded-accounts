"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Copy, Loader2, ShieldAlert } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import { submitOrderPayment } from "@/lib/db";
import { formatUSD } from "@/lib/plans";
import type { OrderRecord } from "@/lib/types";

/** Looks like a blockchain transaction hash (0x + 64 hex characters). */
export const isChainTxid = (v: string) => /^0x[a-fA-F0-9]{64}$/.test(v.trim());

interface PaymentPanelProps {
  order: OrderRecord;
  /** "modal" = dark popup, "dash" = trader dashboard (light/dark theme). */
  variant: "modal" | "dash";
  /** Called after the TXID was saved, with the updated order fields. */
  onSubmitted?: (patch: Partial<OrderRecord>) => void;
}

export default function PaymentPanel({ order, variant, onSubmitted }: PaymentPanelProps) {
  const { config } = useSiteConfig();
  const pay = config.payment;
  const [txid, setTxid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"addr" | "amount" | null>(null);

  const dash = variant === "dash";
  const cls = {
    box: dash ? "dash-border rounded-lg border p-3" : "rounded-xl border border-white/10 bg-white/5 p-4",
    text: dash ? "dash-text" : "text-white",
    sub: dash ? "dash-sub" : "text-slate-400",
    input: dash
      ? "dash-input"
      : "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-blue-500/60 sm:text-sm",
    btn: dash ? "dash-btn w-full" : "btn-glow w-full",
    ghost: dash
      ? "dash-border dash-text dash-hover rounded-lg border px-3 py-1.5 text-xs font-semibold"
      : "rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10",
  };

  async function copy(value: string, which: "addr" | "amount") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked: the value is still selectable */
    }
  }

  async function submit() {
    const value = txid.trim();
    if (value.length < 10) {
      setError("Please paste your full transaction ID (TXID) after sending the payment.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await submitOrderPayment(order.id, value);
      onSubmitted?.({
        status: "review",
        txid: value,
        txSubmittedAt: new Date().toISOString(),
        declineReason: "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your payment details. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // Waiting for the admin
  if (order.status === "review") {
    return (
      <div className={`${cls.box} flex items-start gap-2.5`}>
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="min-w-0 text-sm">
          <p className={`font-semibold ${cls.text}`}>Payment under review</p>
          <p className={`mt-0.5 text-xs ${cls.sub}`}>
            We are checking your payment. Your MT5 login will appear in this dashboard once it is confirmed.
          </p>
          {order.txid && <p className={`mt-1.5 break-all font-mono text-[11px] ${cls.sub}`}>TXID: {order.txid}</p>}
        </div>
      </div>
    );
  }

  if (order.status !== "pending" && order.status !== "declined") return null;

  const amount = String(order.price);
  const noAddress = !pay.address.trim();

  return (
    <div className="space-y-3">
      {order.status === "declined" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Payment not confirmed</p>
            <p className="mt-0.5 text-xs">
              {order.declineReason?.trim() ||
                "We have not received your payment. Please pay and submit the correct transaction ID."}
            </p>
          </div>
        </div>
      )}

      <div className={cls.box}>
        <p className={`text-xs font-semibold uppercase tracking-wider ${cls.sub}`}>Pay with {pay.coin}</p>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div>
            <p className={`text-[11px] ${cls.sub}`}>Amount to send</p>
            <p className={`text-xl font-bold ${cls.text}`}>
              {formatUSD(order.price)} <span className="text-sm font-semibold">{pay.coin}</span>
            </p>
          </div>
          <button type="button" onClick={() => copy(amount, "amount")} className={cls.ghost}>
            {copied === "amount" ? "Copied ✓" : "Copy amount"}
          </button>
        </div>

        <div className="mt-3">
          <p className={`text-[11px] ${cls.sub}`}>Network</p>
          <p className={`text-sm font-semibold ${cls.text}`}>{pay.network}</p>
        </div>

        <div className="mt-3">
          <p className={`text-[11px] ${cls.sub}`}>Wallet address</p>
          {noAddress ? (
            <p className="mt-1 text-sm font-semibold text-amber-500">
              Payment address is not set yet. Please contact support: {config.supportEmail}
            </p>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <code className={`min-w-0 flex-1 select-all break-all rounded-lg px-2.5 py-2 text-xs font-semibold ${dash ? "dash-soft dash-text" : "bg-black/30 text-white"}`}>
                {pay.address}
              </code>
              <button type="button" onClick={() => copy(pay.address, "addr")} className={`${cls.ghost} inline-flex shrink-0 items-center gap-1`}>
                <Copy className="h-3.5 w-3.5" /> {copied === "addr" ? "Copied ✓" : "Copy"}
              </button>
            </div>
          )}
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] font-medium text-amber-500">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Send only {pay.coin} on {pay.network}. Money sent on another network cannot be recovered.
        </p>
        {pay.note && <p className={`mt-2 text-[11px] ${cls.sub}`}>{pay.note}</p>}
      </div>

      <div>
        <label className={`mb-1.5 block text-xs font-medium ${cls.sub}`} htmlFor={`txid-${order.id}`}>
          Transaction ID (TXID)
        </label>
        <input
          id={`txid-${order.id}`}
          value={txid}
          onChange={(e) => setTxid(e.target.value)}
          placeholder="0x…  paste after you have paid"
          autoComplete="off"
          spellCheck={false}
          className={cls.input}
        />
        {txid.trim().length >= 10 && !isChainTxid(txid) && (
          <p className={`mt-1 text-[11px] ${cls.sub}`}>
            A BEP20 transaction ID usually starts with 0x and is 66 characters long. Double-check it.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <button type="button" onClick={submit} disabled={busy || noAddress} className={cls.btn}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        I have paid, confirm
      </button>
    </div>
  );
}

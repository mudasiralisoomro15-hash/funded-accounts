"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Copy, Loader2 } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import { cancelMyOrder, submitOrderPayment } from "@/lib/db";
import type { OrderRecord } from "@/lib/types";

/** Looks like an EVM (BEP20 / ERC20) transaction hash: 0x + 64 hex characters. */
export const isChainTxid = (v: string) => /^0x[a-fA-F0-9]{64}$/.test(v.trim());

/** Link to a block explorer for a TXID, or null when the format is not recognised. */
export function explorerFor(txid: string): { label: string; url: string } | null {
  const t = txid.trim();
  if (isChainTxid(t)) return { label: "Check on BscScan", url: `https://bscscan.com/tx/${t}` };
  if (/^[a-fA-F0-9]{64}$/.test(t)) return { label: "Check on Tronscan", url: `https://tronscan.org/#/transaction/${t}` };
  return null;
}

interface PaymentPanelProps {
  order: OrderRecord;
  /** "modal" = dark popup, "dash" = trader dashboard (light/dark theme). */
  variant: "modal" | "dash";
  /** Called after the TXID was saved, with the updated order fields. */
  onSubmitted?: (patch: Partial<OrderRecord>) => void;
  /**
   * Checkout popup: the order does not exist yet, so this creates it and sends the TXID.
   * Without it the TXID is saved on the existing order.
   */
  onSubmitTxid?: (txid: string) => Promise<void>;
  /** Dashboard: shows a "Cancel this order" button; called after the order was cancelled. */
  onCancelled?: () => void;
}

function StepNo({ n, dash }: { n: number; dash: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        dash ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
      }`}
    >
      {n}
    </span>
  );
}

export default function PaymentPanel({ order, variant, onSubmitted, onSubmitTxid, onCancelled }: PaymentPanelProps) {
  const { config } = useSiteConfig();
  const methods = config.payment.methods.filter((m) => m.enabled && m.address.trim());
  const [methodId, setMethodId] = useState<string | null>(null);
  const [txid, setTxid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"addr" | "amount" | null>(null);

  const dash = variant === "dash";
  const cls = {
    box: dash ? "dash-border rounded-lg border p-3" : "rounded-xl border border-white/10 bg-white/5 p-3.5",
    text: dash ? "dash-text" : "text-white",
    sub: dash ? "dash-sub" : "text-slate-400",
    input: dash
      ? "dash-input"
      : "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-blue-500/60 sm:text-sm",
    btn: dash ? "dash-btn w-full" : "btn-glow w-full",
    ghost: dash
      ? "dash-border dash-text dash-hover inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold"
      : "inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10",
    chipOn: "bg-blue-600 text-white shadow-lg shadow-blue-600/30",
    chipOff: dash ? "dash-border dash-text dash-hover border" : "border border-white/10 text-slate-300 hover:bg-white/10",
    addr: dash ? "dash-soft dash-text" : "bg-black/30 text-white",
  };

  async function copy(value: string, which: "addr" | "amount") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked: the text can still be selected by hand */
    }
  }

  async function submit() {
    const value = txid.trim();
    if (value.length < 10) {
      setError("Please paste your Transaction ID (TXID) first.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      if (onSubmitTxid) await onSubmitTxid(value);
      else await submitOrderPayment(order.id, value);
      onSubmitted?.({ status: "review", txid: value, txSubmittedAt: new Date().toISOString(), declineReason: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your payment details. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder() {
    if (!window.confirm("Cancel this order? It will be removed from your dashboard.")) return;
    setBusy(true);
    setError(null);
    try {
      await cancelMyOrder(order.id);
      onCancelled?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel the order. Try again.");
      setBusy(false);
    }
  }

  // Waiting for the admin
  if (order.status === "review") {
    return (
      <div className={`${cls.box} flex items-start gap-2.5`}>
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div className="min-w-0 text-sm">
          <p className={`font-semibold ${cls.text}`}>We are checking your payment</p>
          <p className={`mt-0.5 text-xs ${cls.sub}`}>
            Your MT5 login will appear here as soon as it is confirmed.
          </p>
          {order.txid && <p className={`mt-1.5 break-all font-mono text-[11px] ${cls.sub}`}>TXID: {order.txid}</p>}
        </div>
      </div>
    );
  }

  if (order.status !== "pending" && order.status !== "declined") return null;

  const method = methods.find((m) => m.id === methodId) ?? methods[0];
  const amount = String(order.price);

  return (
    <div className="space-y-3.5">
      {order.status === "declined" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">We did not receive your payment</p>
            <p className="mt-0.5 text-xs">
              {order.declineReason?.trim() || "Please pay and send the correct transaction ID."}
            </p>
          </div>
        </div>
      )}

      {!method ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm font-medium text-amber-500">
          Payment is not available right now. Please contact us: {config.supportEmail}
        </p>
      ) : (
        <>
          {/* Step 1: choose method (only when there is more than one) */}
          {methods.length > 1 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <StepNo n={1} dash={dash} />
                <p className={`text-sm font-semibold ${cls.text}`}>Choose how you want to pay</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethodId(m.id)}
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      m.id === method.id ? cls.chipOn : cls.chipOff
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: send the money */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <StepNo n={methods.length > 1 ? 2 : 1} dash={dash} />
              <p className={`text-sm font-semibold ${cls.text}`}>
                Send exactly {amount} {method.coin} on {method.network}
              </p>
            </div>
            <div className={`${cls.box} space-y-3`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-[11px] ${cls.sub}`}>Amount</p>
                  <p className={`text-2xl font-bold ${cls.text}`}>
                    {amount} <span className="text-sm font-semibold">{method.coin}</span>
                  </p>
                </div>
                <button type="button" onClick={() => copy(amount, "amount")} className={cls.ghost}>
                  <Copy className="h-3.5 w-3.5" /> {copied === "amount" ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <div>
                <p className={`text-[11px] ${cls.sub}`}>Address ({method.name})</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className={`min-w-0 flex-1 select-all break-all rounded-lg px-2.5 py-2 text-xs font-semibold ${cls.addr}`}>
                    {method.address}
                  </code>
                  <button type="button" onClick={() => copy(method.address, "addr")} className={cls.ghost}>
                    <Copy className="h-3.5 w-3.5" /> {copied === "addr" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>
              <p className="text-[11px] font-medium text-amber-500">
                Send only {method.coin} on {method.network}. Any other coin or network will be lost.
              </p>
            </div>
          </div>

          {/* Step: paste TXID */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <StepNo n={methods.length > 1 ? 3 : 2} dash={dash} />
              <label htmlFor={`txid-${order.id}`} className={`text-sm font-semibold ${cls.text}`}>
                Paste your Transaction ID (TXID)
              </label>
            </div>
            <input
              id={`txid-${order.id}`}
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="Paste TXID here"
              autoComplete="off"
              spellCheck={false}
              className={cls.input}
            />
            <p className={`mt-1.5 text-[11px] ${cls.sub}`}>
              Find it in your wallet or exchange under Withdrawal history, then tap the transaction.
            </p>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          <button type="button" onClick={submit} disabled={busy} className={cls.btn}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            I have paid, confirm
          </button>
          {config.payment.note && <p className={`text-center text-[11px] ${cls.sub}`}>{config.payment.note}</p>}
          {onCancelled && (
            <button
              type="button"
              onClick={cancelOrder}
              disabled={busy}
              className="w-full text-center text-xs font-semibold text-red-500 transition hover:text-red-400 disabled:opacity-50"
            >
              Cancel this order
            </button>
          )}
        </>
      )}
    </div>
  );
}

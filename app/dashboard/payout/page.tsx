"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, HandCoins, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useMyOrders } from "@/components/dashboard/useMyOrders";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { formatDate } from "@/components/admin/ui";
import { createPayout, getMyKyc, listMyPayouts, submitKyc } from "@/lib/db";
import { formatUSD } from "@/lib/plans";
import type { KycRecord, PayoutRecord } from "@/lib/types";

const MIN_PAYOUT = 20;

const PAY_TONE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  approved: "bg-sky-500/15 text-sky-600",
  paid: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-red-500/15 text-red-600",
};

export default function PayoutPage() {
  const { user } = useAuth();
  const { orders } = useMyOrders();
  const hasActive = (orders ?? []).some((o) => o.status === "active");

  const [kyc, setKyc] = useState<KycRecord | null | undefined>(undefined);
  const [payouts, setPayouts] = useState<PayoutRecord[] | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const uid = user?.uid;
  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const [k, p] = await Promise.all([getMyKyc(uid), listMyPayouts(uid)]);
      setKyc(k);
      setPayouts(p.filter((x) => x.type !== "referral"));
    } catch (e) {
      setKyc(null);
      setPayouts([]);
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load payout data." });
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendKyc() {
    if (!user) return;
    if (fullName.trim().length < 3 || country.trim().length < 2) {
      return setMsg({ ok: false, text: "Enter your full legal name and country." });
    }
    if (!/^https?:\/\//i.test(docUrl.trim())) {
      return setMsg({ ok: false, text: "Paste a link (https://...) to your ID document, e.g. a Google Drive share link." });
    }
    setBusy(true);
    setMsg(null);
    try {
      await submitKyc({
        userId: user.uid,
        email: user.email,
        name: user.name,
        fullName: fullName.trim(),
        country: country.trim(),
        documentUrl: docUrl.trim(),
      });
      setMsg({ ok: true, text: "KYC submitted. We will review it shortly." });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not submit KYC." });
    } finally {
      setBusy(false);
    }
  }

  async function sendPayout() {
    if (!user) return;
    const amt = Number(amount);
    if (!(amt >= MIN_PAYOUT)) return setMsg({ ok: false, text: `Minimum payout is ${formatUSD(MIN_PAYOUT)}.` });
    if (address.trim().length < 20) return setMsg({ ok: false, text: "Enter a valid USDT wallet address." });
    setBusy(true);
    setMsg(null);
    try {
      await createPayout({
        userId: user.uid,
        email: user.email,
        name: user.name,
        amount: amt,
        method: "USDT",
        address: address.trim(),
      });
      setAmount("");
      setMsg({ ok: true, text: "Payout request sent. Status will update here." });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not send the request." });
    } finally {
      setBusy(false);
    }
  }

  const kycOk = kyc?.status === "approved";
  const canSubmitKyc = !kyc || kyc.status === "rejected";

  return (
    <>
      <PageHeader title="Payout" subtitle="Daily payouts, minimum $20, paid in USDT after KYC approval." />

      {msg && (
        <p
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            msg.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-red-500/30 bg-red-500/10 text-red-500"
          }`}
        >
          {msg.text}
        </p>
      )}

      {kyc === undefined ? (
        <Loader2 className="dash-primary-text mx-auto my-10 h-6 w-6 animate-spin" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* KYC */}
          <div className="dash-card p-5">
            <h2 className="dash-text flex items-center gap-2 text-sm font-semibold">
              <BadgeCheck className="h-4 w-4" /> Identity verification (KYC)
            </h2>
            {kyc && (
              <p className="mt-2 text-sm">
                Status:{" "}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PAY_TONE[kyc.status]}`}>
                  {kyc.status}
                </span>
              </p>
            )}
            {canSubmitKyc ? (
              <div className="mt-3 space-y-2.5">
                <input className="dash-input" placeholder="Full legal name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                <input className="dash-input" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                <input className="dash-input" placeholder="Link to your ID document (Google Drive share link)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                <button type="button" onClick={sendKyc} disabled={busy} className="dash-btn w-full">
                  Submit KYC
                </button>
              </div>
            ) : (
              <p className="dash-sub mt-3 text-sm">
                {kycOk ? "You are verified. You can request payouts." : "Under review. We will update this page."}
              </p>
            )}
          </div>

          {/* Request */}
          <div className="dash-card p-5">
            <h2 className="dash-text flex items-center gap-2 text-sm font-semibold">
              <Wallet className="h-4 w-4" /> Request payout (USDT)
            </h2>
            <div className="mt-3 space-y-2.5">
              <input className="dash-input" type="number" min={MIN_PAYOUT} placeholder={`Amount (min $${MIN_PAYOUT})`} value={amount} onChange={(e) => setAmount(e.target.value)} />
              <input className="dash-input" placeholder="USDT wallet address (TRC20 / BEP20)" value={address} onChange={(e) => setAddress(e.target.value)} />
              <button type="button" onClick={sendPayout} disabled={busy || !kycOk || !hasActive} className="dash-btn w-full">
                Request Payout
              </button>
              <p className="dash-sub text-xs">
                {!hasActive
                  ? "Available once you have an active funded account."
                  : !kycOk
                    ? "Complete KYC first."
                    : "Make sure the wallet network is correct. Payouts cannot be reversed."}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="dash-card mt-6">
        <h2 className="dash-text dash-border border-b px-5 py-4 font-semibold">Payout history</h2>
        {payouts && payouts.length > 0 ? (
          <ul>
            {payouts.map((p) => (
              <li key={p.id} className="dash-border flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3 last:border-b-0">
                <div>
                  <p className="dash-text text-sm font-semibold">{formatUSD(p.amount)} · USDT</p>
                  <p className="dash-sub text-xs">{formatDate(p.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PAY_TONE[p.status]}`}>{p.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={HandCoins} title="No payouts yet" text="Your payout requests and their status will be listed here." />
        )}
      </section>
    </>
  );
}

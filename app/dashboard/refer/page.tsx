"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Check,
  Clock,
  Copy,
  Loader2,
  Percent,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { createPayout, getMyKyc, listMyCommissions, listMyPayouts, listMyReferrals } from "@/lib/db";
import { formatUSD } from "@/lib/plans";
import type { CommissionRecord, KycRecord, PayoutRecord, ReferralRecord } from "@/lib/types";

const MIN_WITHDRAW = 20;

const maskEmail = (e: string) => {
  const [a, d] = e.split("@");
  return d ? `${a.slice(0, 2)}***@${d}` : e;
};

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="dash-card flex items-center gap-3 p-4">
      <span className="dash-soft dash-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="dash-sub text-[11px] leading-tight">{label}</p>
        <p className="dash-text text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}

/** Daily commission for the last 30 days as a small line chart. */
function CommissionChart({ items }: { items: CommissionRecord[] }) {
  const days = 30;
  const data = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toDateString();
      const value = items
        .filter((c) => c.status !== "cancelled" && new Date(c.createdAt).toDateString() === key)
        .reduce((sum, c) => sum + c.amount, 0);
      out.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value });
    }
    return out;
  }, [items]);

  const max = Math.max(4, ...data.map((d) => d.value));
  const W = 600;
  const H = 180;
  const pad = 28;
  const x = (i: number) => pad + (i * (W - pad - 8)) / (days - 1);
  const y = (v: number) => H - 24 - (v / max) * (H - 44);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Commission earned per day, last 30 days">
      {[0, 1, 2, 3].map((g) => {
        const v = (max / 3) * g;
        return (
          <g key={g}>
            <line x1={pad} x2={W - 8} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity="0.12" />
            <text x={0} y={y(v) + 4} fontSize="10" fill="currentColor" opacity="0.5">
              ${Math.round(v)}
            </text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
      {[0, 10, 20, 29].map((i) => (
        <text key={i} x={x(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5">
          {data[i].label}
        </text>
      ))}
    </svg>
  );
}

function Donut({ made, none }: { made: number; none: number }) {
  const total = made + none;
  const r = 52;
  const c = 2 * Math.PI * r;
  const frac = total === 0 ? 0 : made / total;
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-40 w-40" role="img" aria-label="Referral conversions">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#93c5fd" strokeWidth="18" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#2563eb"
        strokeWidth="18"
        strokeDasharray={`${c * frac} ${c}`}
        transform="rotate(-90 70 70)"
      />
    </svg>
  );
}

export default function ReferPage() {
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const uid = user?.uid;

  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState<"id" | "link" | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[] | null>(null);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [kyc, setKyc] = useState<KycRecord | null>(null);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const [r, c, p, k] = await Promise.all([
        listMyReferrals(uid),
        listMyCommissions(uid),
        listMyPayouts(uid),
        getMyKyc(uid),
      ]);
      setReferrals(r);
      setCommissions(c);
      setPayouts(p.filter((x) => x.type === "referral"));
      setKyc(k);
    } catch (e) {
      setReferrals([]);
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not load referral data." });
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const refId = `REF-${(uid ?? "").slice(0, 6).toUpperCase()}`;
  const link = `${origin}/?ref=${uid ?? ""}`;

  async function copy(text: string, which: "id" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const live = commissions.filter((c) => c.status !== "cancelled");
  const sum = (xs: { amount: number }[]) => xs.reduce((t, x) => t + x.amount, 0);
  const released = sum(live.filter((c) => c.status === "released"));
  const pending = live.filter((c) => c.status === "pending");
  const withdrawn = sum(payouts.filter((p) => p.status === "paid"));
  const locked = sum(payouts.filter((p) => p.status !== "rejected"));
  const balance = Math.max(0, released - locked);
  const buyers = new Set(live.map((c) => c.referredUid));
  const totalReferrals = referrals?.length ?? 0;
  const kycOk = kyc?.status === "approved";

  async function withdraw() {
    if (!user) return;
    const amt = Number(amount);
    if (!(amt >= MIN_WITHDRAW)) return setMsg({ ok: false, text: `Minimum withdrawal is ${formatUSD(MIN_WITHDRAW)}.` });
    if (amt > balance) return setMsg({ ok: false, text: "Amount is higher than your available balance." });
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
        type: "referral",
      });
      setAmount("");
      setMsg({ ok: true, text: "Withdrawal request sent. We will pay it in USDT." });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not send the request." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Refer & Earn"
        subtitle={`Earn ${config.referralPct}% commission every time someone you refer buys a challenge.`}
      />

      {msg && (
        <p
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            msg.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-red-500/30 bg-red-500/10 text-red-500"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="dash-card p-5">
          <p className="dash-sub flex items-center gap-2 text-xs font-medium">
            <Wallet className="h-4 w-4" /> Available balance
          </p>
          <p className="dash-text mt-1 text-3xl font-bold">{formatUSD(balance)}</p>
          <div className="mt-3 space-y-2">
            <input
              className="dash-input"
              type="number"
              min={MIN_WITHDRAW}
              placeholder={`Amount (min $${MIN_WITHDRAW})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              className="dash-input"
              placeholder="USDT wallet address (TRC20 / BEP20)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button type="button" onClick={withdraw} disabled={busy || !kycOk || balance < MIN_WITHDRAW} className="dash-btn w-full">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Withdraw to wallet
            </button>
            <p className="dash-sub text-xs">
              {!kycOk ? "Complete KYC (Payout page) to withdraw." : `Minimum withdrawal: ${formatUSD(MIN_WITHDRAW)}.`}
            </p>
          </div>
        </section>

        <section className="dash-card p-5">
          <p className="dash-sub text-xs font-medium">Your referral ID</p>
          <p className="dash-primary-text mt-1 text-2xl font-bold tracking-wide">{refId}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => copy(refId, "id")} className="dash-btn-outline px-3 py-2 text-sm">
              {copied === "id" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy ID
            </button>
            <button type="button" onClick={() => copy(link, "link")} className="dash-btn px-3 py-2 text-sm">
              {copied === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy link
            </button>
          </div>
          <input readOnly value={link} className="dash-input mt-3" aria-label="Referral link" />
          <p className="dash-sub mt-2 text-xs">
            Anyone who signs up from this link is counted as your referral. You earn on every order they pay for.
          </p>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BadgeDollarSign} label="Total sales amount" value={formatUSD(sum(live.map((c) => ({ amount: c.orderPrice }))))} />
        <Stat icon={TrendingUp} label="Total commission" value={formatUSD(sum(live))} />
        <Stat icon={Clock} label="Pending commission" value={formatUSD(sum(pending))} />
        <Stat icon={Wallet} label="Commission withdrawn" value={formatUSD(withdrawn)} />
        <Stat icon={Users} label="Total referrals" value={String(totalReferrals)} />
        <Stat icon={UserCheck} label="Active referrals" value={String(buyers.size)} />
        <Stat icon={ShoppingBag} label="Total sales" value={String(live.length)} />
        <Stat icon={Percent} label="Commission rate" value={`${config.referralPct}%`} />
      </div>

      {referrals === null ? (
        <Loader2 className="dash-primary-text mx-auto my-10 h-6 w-6 animate-spin" />
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="dash-card">
            <h2 className="dash-text dash-border border-b px-5 py-4 font-semibold">Referrals</h2>
            {referrals.length === 0 ? (
              <EmptyState icon={Users} title="No referrals yet" text="Share your link. People who sign up through it appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="dash-sub text-xs">
                      <th className="px-5 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-5 py-2 text-right font-medium">Accounts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => (
                      <tr key={r.referredUid} className="dash-border border-t">
                        <td className="dash-text px-5 py-2.5 font-medium">{r.name}</td>
                        <td className="dash-sub px-3 py-2.5">{maskEmail(r.email)}</td>
                        <td className="dash-text px-5 py-2.5 text-right">
                          {live.filter((c) => c.referredUid === r.referredUid).length || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="dash-card">
            <h2 className="dash-text dash-border border-b px-5 py-4 font-semibold">Pending commissions</h2>
            {pending.length === 0 ? (
              <EmptyState icon={Clock} title="No pending commissions" text="Commissions appear here while they wait to be released to your wallet." />
            ) : (
              <ul>
                {pending.map((c) => (
                  <li key={c.id} className="dash-border flex items-center justify-between gap-3 border-b px-5 py-3 last:border-b-0">
                    <div>
                      <p className="dash-text text-sm font-medium">{c.buyerName}</p>
                      <p className="dash-sub text-xs">Order {formatUSD(c.orderPrice)} · {c.ratePct}%</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{formatUSD(c.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <section className="dash-card p-5">
          <h2 className="dash-text font-semibold">Commission earned</h2>
          <p className="dash-sub mb-2 text-xs">Daily commission from referral sales (last 30 days)</p>
          <div className="dash-sub">
            <CommissionChart items={commissions} />
          </div>
        </section>
        <section className="dash-card p-5">
          <h2 className="dash-text font-semibold">Referral conversions</h2>
          <p className="dash-sub mb-2 text-xs">
            {totalReferrals === 0 ? 0 : Math.round((buyers.size / totalReferrals) * 100)}% of referrals have made a purchase
          </p>
          <Donut made={buyers.size} none={Math.max(0, totalReferrals - buyers.size)} />
          <ul className="dash-sub mt-3 space-y-1 text-xs">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Made a sale {buyers.size}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-300" /> No sale yet {Math.max(0, totalReferrals - buyers.size)}
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}

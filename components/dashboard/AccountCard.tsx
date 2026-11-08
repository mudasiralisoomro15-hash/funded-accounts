"use client";

import { useState } from "react";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { formatSize, formatUSD, getModel } from "@/lib/plans";
import PaymentPanel from "@/components/PaymentPanel";
import type { OrderRecord } from "@/lib/types";

const TABS = ["Credentials", "Account Stats", "Objectives"] as const;
type Tab = (typeof TABS)[number];

const BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: "Ongoing", cls: "bg-emerald-500/15 text-emerald-600" },
  paid: { label: "Paid", cls: "bg-sky-500/15 text-sky-600" },
  review: { label: "Under review", cls: "bg-violet-500/15 text-violet-500" },
  declined: { label: "Payment declined", cls: "bg-red-500/15 text-red-600" },
  pending: { label: "Awaiting payment", cls: "bg-amber-500/15 text-amber-600" },
  cancelled: { label: "Cancelled", cls: "bg-red-500/15 text-red-600" },
};

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="dash-border rounded-lg border px-3 py-2.5">
      <p className="dash-sub text-[11px]">{label}</p>
      <p
        className={`mt-0.5 text-sm font-bold ${
          tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-red-500" : "dash-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function AccountCard({
  order,
  onChange,
}: {
  order: OrderRecord;
  onChange?: (patch: Partial<OrderRecord>) => void;
}) {
  const { config } = useSiteConfig();
  const [tab, setTab] = useState<Tab | null>(null);
  const model = getModel(order.modelId as never, config.models);
  const badge = BADGE[order.status] ?? BADGE.pending;
  const dailyLoss = (order.size * model.dailyLossPct) / 100;
  const maxLoss = (order.size * model.maxDrawdownPct) / 100;
  const needsPayment = order.status === "pending" || order.status === "review" || order.status === "declined";

  return (
    <div className="dash-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
        <span className="dash-soft dash-primary-text rounded-full px-2.5 py-0.5 text-xs font-semibold">
          {model.name}
        </span>
        <span className="dash-sub ml-auto text-xs">#{order.id.slice(-6).toUpperCase()}</span>
      </div>
      <h3 className="dash-text mt-3 font-semibold">
        {order.modelName} ({formatSize(order.size)})
      </h3>
      <p className="dash-sub mt-0.5 text-xs">
        Balance: {formatUSD(order.size)} · End date: Unlimited
      </p>

      {needsPayment && (
        <div className="mt-3">
          <PaymentPanel
            order={order}
            variant="dash"
            onSubmitted={onChange}
            onCancelled={() => onChange?.({ status: "cancelled" })}
          />
        </div>
      )}

      {!needsPayment && (
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(tab === t ? null : t)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              tab === t ? "dash-soft dash-primary-text border-transparent" : "dash-border dash-text dash-hover"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      )}

      {!needsPayment && tab === "Credentials" && (
        <div className="dash-border mt-3 rounded-lg border p-3 text-sm">
          <p className="dash-text font-medium">MT5 login details</p>
          {order.credentials ? (
            <dl className="mt-2 space-y-1 text-xs">
              {(
                [
                  ["Login", order.credentials.login],
                  ["Password", order.credentials.password],
                  ["Server", order.credentials.server],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="dash-sub">{k}</dt>
                  <dd className="dash-text select-all font-mono font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="dash-sub mt-1 text-xs">
              Available once your order is confirmed and the account is activated.
            </p>
          )}
        </div>
      )}
      {!needsPayment && tab === "Account Stats" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Balance" value={formatUSD(order.size)} />
          <Stat label="Equity" value={formatUSD(order.size)} />
          <Stat label="Daily loss limit" value={`${formatUSD(dailyLoss)} (${model.dailyLossPct}%)`} />
          <Stat label="Max loss limit" value={`${formatUSD(maxLoss)} (${model.maxDrawdownPct}%)`} />
        </div>
      )}
      {!needsPayment && tab === "Objectives" && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Profit target" value={model.profitTarget} />
          <Stat label="Min trading days" value={model.minTradingDays} />
          <Stat label="Max daily loss" value={`${model.dailyLossPct}%`} />
          <Stat label="Max loss" value={`${model.maxDrawdownPct}%`} />
        </div>
      )}

      {!needsPayment && (
      <div className="dash-border mt-4 grid grid-cols-3 gap-2 border-t pt-3">
        <div>
          <p className="dash-sub text-[11px]">Today&apos;s profit</p>
          <p className="dash-text text-sm font-bold">$0.00</p>
        </div>
        <div>
          <p className="dash-sub text-[11px]">Equity</p>
          <p className="dash-text text-sm font-bold">{formatUSD(order.size)}</p>
        </div>
        <div>
          <p className="dash-sub text-[11px]">Unrealized PnL</p>
          <p className="text-sm font-bold text-emerald-500">$0.00</p>
        </div>
      </div>
      )}
    </div>
  );
}

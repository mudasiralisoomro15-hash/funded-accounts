"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import {
  ACCOUNT_SIZES,
  BEST_VALUE_SIZE,
  MODEL_GROUPS,
  formatUSD,
  getListPrice,
  groupOf,
  type AccountSize,
  type ModelId,
  type PlanSelection,
} from "@/lib/plans";

const FEATURES = ["Daily Payouts", "News Trading (Challenge)", "No Max Trading Period", "MetaTrader 5"];

interface PricingSectionProps {
  onBuy: (selection: PlanSelection) => void;
}

function Phases({ value }: { value: string }) {
  const parts = value.split("/").map((p) => p.trim());
  if (parts.length < 2) return <span className="font-semibold text-white">{value}</span>;
  return (
    <div className="space-y-0.5 text-right">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center justify-end gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Phase {i + 1}</span>
          <span className="font-semibold text-white">{p}</span>
        </div>
      ))}
    </div>
  );
}

export default function PricingSection({ onBuy }: PricingSectionProps) {
  const { config } = useSiteConfig();
  const models = config.models.filter((m) => m.enabled);
  const [modelId, setModelId] = useState<ModelId>("one-step");
  const [size, setSize] = useState<AccountSize>(BEST_VALUE_SIZE);

  const model = models.find((m) => m.id === modelId) ?? models[0];
  if (!model) return null;

  const activeGroup = groupOf(model.id);
  const groups = MODEL_GROUPS.filter((g) => models.some((m) => m.id.startsWith(g.prefix)));
  const variants = models.filter((m) => m.id.startsWith(activeGroup.prefix));

  const price = model.prices[size];
  const listPrice = getListPrice(model, size);
  const hasDiscount = model.discountPct > 0 && listPrice > price;
  const funded = size / 10;

  const rows: { label: string; ev: ReactNode; live: ReactNode; liveGood?: boolean }[] = [
    { label: "Profit Target", ev: <Phases value={model.profitTarget} />, live: "None" },
    { label: "Max Daily Loss", ev: `${model.dailyLossPct}%`, live: "n/a" },
    { label: "Max Loss", ev: `${model.maxDrawdownPct}%`, live: `${model.fundedMaxDdPct}%`, liveGood: true },
    { label: "Min Trading Days", ev: model.minTradingDays, live: "None" },
    { label: "Trading Period", ev: "Unlimited", live: "Unlimited" },
    { label: "Leverage", ev: model.leverage, live: model.leverage },
    { label: "Funded Account", ev: formatUSD(funded), live: formatUSD(funded), liveGood: true },
    { label: "Profit Split", ev: model.profitSplit, live: model.profitSplit },
    { label: "Payouts", ev: model.payouts, live: model.payouts, liveGood: true },
  ];

  return (
    <section id="models" className="relative scroll-mt-16 bg-[#0a0d13] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Funded Models
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Choose Your Challenge
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Pick your evaluation and account size. You get a live funded account at one-tenth of the evaluation size.
          </p>
        </div>

        {/* Group tabs */}
        <div
          role="tablist"
          aria-label="Challenge type"
          className="mt-10 grid gap-1.5 rounded-2xl border border-white/10 bg-[#10141c] p-1.5"
          style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}
        >
          {groups.map((g) => {
            const active = g.key === activeGroup.key;
            return (
              <button
                key={g.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  const first = models.find((m) => m.id.startsWith(g.prefix));
                  if (first) setModelId(first.id);
                }}
                className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Variant tabs */}
        {variants.length > 1 && (
          <div role="tablist" aria-label="Variant" className="mt-3 flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#10141c] p-1.5">
            {variants.map((m, i) => {
              const active = m.id === model.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setModelId(m.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    active ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {m.name}
                  {i > 0 && (
                    <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">New</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-5 text-center text-sm text-slate-400">{model.tagline}</p>

        {/* Sizes */}
        <div role="radiogroup" aria-label="Account size" className="mt-6 grid grid-cols-3 gap-2.5">
          {ACCOUNT_SIZES.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSize(s)}
                className={`relative rounded-xl border px-3 py-4 text-base font-semibold transition-all ${
                  active
                    ? "border-blue-500 bg-blue-500/10 text-white ring-2 ring-blue-500/40"
                    : "border-white/10 bg-[#10141c] text-slate-300 hover:border-white/25"
                }`}
              >
                {s === BEST_VALUE_SIZE && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Best value
                  </span>
                )}
                {formatUSD(s)}
              </button>
            );
          })}
        </div>

        {/* Comparison card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#10141c]">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] items-end gap-2 border-b border-white/10 px-4 py-4 sm:px-6">
            <span />
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evaluation</p>
              <p className="text-lg font-bold text-white">{formatUSD(size)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live funded</p>
              <p className="text-lg font-bold text-white">{formatUSD(funded)}</p>
            </div>
          </div>
          <dl className="divide-y divide-white/10">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-2 px-4 py-3.5 text-sm sm:px-6">
                <dt className="text-slate-400">{r.label}</dt>
                <dd className="text-right font-semibold text-white">{r.ev}</dd>
                <dd className={`text-right font-semibold ${r.liveGood ? "text-emerald-400" : "text-slate-300"}`}>{r.live}</dd>
              </div>
            ))}
          </dl>

          {/* Price + CTA */}
          <div className="border-t border-white/10 bg-gradient-to-b from-blue-600/10 to-transparent px-4 py-6 text-center sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">One-time evaluation fee</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {hasDiscount && <span className="text-lg text-slate-500 line-through">{formatUSD(listPrice)}</span>}
              <span className="font-display text-5xl font-bold text-white">{formatUSD(price)}</span>
              {hasDiscount && (
                <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold uppercase text-white">
                  {model.discountPct}% off
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onBuy({ modelId: model.id, size, price })}
              className="btn-glow mt-5 w-full sm:w-auto sm:min-w-[260px]"
            >
              Start now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          {FEATURES.map((f) => (
            <li key={f} className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-blue-400" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

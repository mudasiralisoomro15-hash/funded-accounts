"use client";

import { useState } from "react";
import { MoveLeft, MoveRight, Plus, Trash2 } from "lucide-react";
import { ACCOUNT_SIZES, formatSize, formatUSD, getListPrice, makeBlankModel, type AccountSize, type DrawdownType, type ModelConfig } from "@/lib/plans";
import type { SiteConfig } from "@/lib/siteConfig";
import { Field, Panel, Toggle, inputCls } from "./ui";

interface PlansEditorProps {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
}

const num = (v: string, max = 100000) => Math.min(max, Math.max(0, Number(v) || 0));

export default function PlansEditor({ config, onChange: onConfig }: PlansEditorProps) {
  const models = config.models;
  const onChange = (next: ModelConfig[]) => onConfig({ ...config, models: next });
  const [selectedId, setSelectedId] = useState(models[0]?.id ?? "");
  const m = models.find((x) => x.id === selectedId) ?? models[0];
  if (!m) return null;

  const enabledCount = models.filter((x) => x.enabled).length;

  const patch = (p: Partial<ModelConfig>) =>
    onChange(models.map((x) => (x.id === m.id ? { ...x, ...p } : x)));

  const setPrice = (size: AccountSize, value: number) =>
    patch({ prices: { ...m.prices, [size]: value } });

  const groups = Array.from(new Set(models.map((x) => x.group)));
  const index = models.findIndex((x) => x.id === m.id);

  function addPlan() {
    const fresh = makeBlankModel(m, `${m.name} Copy`);
    onChange([...models, fresh]);
    setSelectedId(fresh.id);
  }

  function removePlan() {
    if (models.length <= 1) return;
    if (!window.confirm(`Delete the plan "${m.name}"? This cannot be undone after you save.`)) return;
    const rest = models.filter((x) => x.id !== m.id);
    onChange(rest);
    setSelectedId(rest[0].id);
  }

  function move(dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= models.length) return;
    const next = [...models];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-5">
      <Panel title="Pricing section" subtitle='Which account size shows the orange "Best value" badge.'>
        <select
          className={`${inputCls} max-w-xs`}
          value={config.bestValueSize}
          onChange={(e) => onConfig({ ...config, bestValueSize: Number(e.target.value) })}
        >
          <option value={0}>No badge</option>
          {ACCOUNT_SIZES.map((sz) => (
            <option key={sz} value={sz}>
              {formatSize(sz)}
            </option>
          ))}
        </select>
      </Panel>

      {/* Model picker */}
      <div className="flex flex-wrap gap-2">
        {models.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setSelectedId(x.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              x.id === m.id
                ? "border-blue-400 bg-blue-500/20 text-blue-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/40"
            }`}
          >
            {x.name}
            {!x.enabled && <span className="ml-2 text-[10px] uppercase text-amber-300">hidden</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={addPlan} className="btn-glow px-4 py-2 text-sm">
          <Plus className="h-4 w-4" /> Add new plan <span className="hidden sm:inline">(copy of this one)</span>
        </button>
        <button type="button" onClick={() => move(-1)} disabled={index <= 0} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40">
          <MoveLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => move(1)} disabled={index >= models.length - 1} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40">
          <MoveRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={removePlan} disabled={models.length <= 1} className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-40">
          <Trash2 className="h-4 w-4" /> Delete this plan
        </button>
        <span className="text-xs text-slate-500">Changes go live after “Save changes”.</span>
      </div>

      <Panel
        title={`Prices · ${m.name}`}
        subtitle="Price the customer pays for each account size (USD). The struck-through old price is calculated from the discount."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ACCOUNT_SIZES.map((size) => (
            <div key={size} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-blue-300">{formatSize(size)}</p>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={m.prices[size] ?? 0}
                  onChange={(e) => setPrice(size, num(e.target.value))}
                  className={`${inputCls} pl-6`}
                  aria-label={`${m.name} ${formatSize(size)} price`}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Was {formatUSD(getListPrice(m, size))}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={`Rules & details · ${m.name}`} subtitle="These show in the plan card and the comparison table.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Model name">
            <input className={inputCls} value={m.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label="Group (top tab)" hint='Plans with the same group share one tab, e.g. "2 Step". Type a new name to create a new tab.'>
            <input className={inputCls} list="plan-groups" value={m.group} onChange={(e) => patch({ group: e.target.value })} />
            <datalist id="plan-groups">
              {groups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </Field>
          <Field label="Orange tag text" hint='Optional, e.g. "New" or "Hot". Empty = none.'>
            <input className={inputCls} maxLength={12} value={m.badge ?? ""} onChange={(e) => patch({ badge: e.target.value })} />
          </Field>
          <Field label="Drawdown type">
            <select
              className={inputCls}
              value={m.drawdownType}
              onChange={(e) => patch({ drawdownType: e.target.value as DrawdownType })}
            >
              <option value="Static">Static</option>
              <option value="Trailing">Trailing</option>
            </select>
          </Field>

          <Field label="Daily loss limit (%)">
            <input
              type="number"
              min={0}
              step="0.5"
              className={inputCls}
              value={m.dailyLossPct}
              onChange={(e) => patch({ dailyLossPct: num(e.target.value, 100) })}
            />
          </Field>
          <Field label="Max drawdown (%)">
            <input
              type="number"
              min={0}
              step="0.5"
              className={inputCls}
              value={m.maxDrawdownPct}
              onChange={(e) => patch({ maxDrawdownPct: num(e.target.value, 100) })}
            />
          </Field>
          <Field label="Funded max drawdown (%)">
            <input
              type="number"
              min={0}
              step="0.5"
              className={inputCls}
              value={m.fundedMaxDdPct}
              onChange={(e) => patch({ fundedMaxDdPct: num(e.target.value, 100) })}
            />
          </Field>
          <Field label="Discount (%)" hint="0 hides the discount pill and old price.">
            <input
              type="number"
              min={0}
              max={90}
              className={inputCls}
              value={m.discountPct}
              onChange={(e) => patch({ discountPct: num(e.target.value, 90) })}
            />
          </Field>

          <Field label="Leverage">
            <input className={inputCls} value={m.leverage} onChange={(e) => patch({ leverage: e.target.value })} />
          </Field>
          <Field label="Profit target" hint='Use "None" for instant accounts.'>
            <input className={inputCls} value={m.profitTarget} onChange={(e) => patch({ profitTarget: e.target.value })} />
          </Field>
          <Field label="Minimum trading days">
            <input className={inputCls} value={m.minTradingDays} onChange={(e) => patch({ minTradingDays: e.target.value })} />
          </Field>

          <Field label="Profit split">
            <input className={inputCls} value={m.profitSplit} onChange={(e) => patch({ profitSplit: e.target.value })} />
          </Field>
          <Field label="Payouts">
            <input className={inputCls} value={m.payouts} onChange={(e) => patch({ payouts: e.target.value })} />
          </Field>
          <div />

          <Field label="Short description" className="sm:col-span-2 lg:col-span-3">
            <textarea
              rows={2}
              className={inputCls}
              value={m.tagline}
              onChange={(e) => patch({ tagline: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5">
          <Toggle
            checked={m.enabled}
            onChange={(v) => patch({ enabled: v })}
            label="Show this model on the website"
            disabled={m.enabled && enabledCount === 1}
          />
          <Toggle
            checked={!!m.popular}
            onChange={(v) => patch({ popular: v })}
            label='Mark as Popular (opens first + orange "Popular" tag)'
          />
        </div>
      </Panel>
    </div>
  );
}

"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { FAQ_CATEGORIES, addressProblem, type FaqItem, type PaymentMethod, type SiteConfig } from "@/lib/siteConfig";
import { Field, Panel, Toggle, inputCls } from "./ui";

interface ContentEditorProps {
  config: SiteConfig;
  onChange: (next: SiteConfig) => void;
}

export default function ContentEditor({ config, onChange }: ContentEditorProps) {
  const setHero = (p: Partial<SiteConfig["hero"]>) => onChange({ ...config, hero: { ...config.hero, ...p } });
  const setAnn = (p: Partial<SiteConfig["announcement"]>) =>
    onChange({ ...config, announcement: { ...config.announcement, ...p } });

  const setPay = (p: Partial<SiteConfig["payment"]>) =>
    onChange({ ...config, payment: { ...config.payment, ...p } });
  const editMethod = (id: string, p: Partial<PaymentMethod>) =>
    setPay({ methods: config.payment.methods.map((m) => (m.id === id ? { ...m, ...p } : m)) });
  const addMethod = () =>
    setPay({
      methods: [
        ...config.payment.methods,
        { id: `m_${Date.now()}`, name: "TRC20 USDT", coin: "USDT", network: "TRC20", address: "", enabled: true },
      ],
    });
  const removeMethod = (id: string, name: string) => {
    if (!window.confirm(`Remove “${name}”? Customers will no longer see it.`)) return;
    setPay({ methods: config.payment.methods.filter((m) => m.id !== id) });
  };

  const setFaqs = (faqs: FaqItem[]) => onChange({ ...config, faqs });
  const editFaq = (i: number, p: Partial<FaqItem>) =>
    setFaqs(config.faqs.map((f, idx) => (idx === i ? { ...f, ...p } : f)));
  const moveFaq = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= config.faqs.length) return;
    const next = [...config.faqs];
    [next[i], next[j]] = [next[j], next[i]];
    setFaqs(next);
  };

  return (
    <div className="space-y-5">
      <Panel title="Brand" subtitle="Shown in the logo, footer and copyright.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name">
            <input
              className={inputCls}
              value={config.brandName}
              onChange={(e) => onChange({ ...config, brandName: e.target.value })}
            />
          </Field>
          <Field label="Support email" hint="Shown in the trader dashboard Support page.">
            <input
              type="email"
              className={inputCls}
              value={config.supportEmail}
              onChange={(e) => onChange({ ...config, supportEmail: e.target.value })}
            />
          </Field>
          <Field label="Referral commission (%)" hint="Earned by a trader on every paid order of someone they referred.">
            <input
              type="number"
              min={0}
              max={90}
              className={inputCls}
              value={config.referralPct}
              onChange={(e) =>
                onChange({ ...config, referralPct: Math.min(90, Math.max(0, Number(e.target.value) || 0)) })
              }
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Payment methods"
        subtitle="What the customer sees after pressing Buy. Add a method for every network you accept (BEP20, TRC20…). Press Save at the bottom after any change."
        action={
          <button
            type="button"
            onClick={addMethod}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add payment method
          </button>
        }
      >
        <div className="space-y-4">
          {config.payment.methods.length === 0 && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-300">
              No payment method. Customers will see “Payment is not available”. Add one.
            </p>
          )}
          {config.payment.methods.map((m) => {
            const problem = m.address.trim() ? addressProblem(m) : null;
            return (
              <div key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Toggle checked={m.enabled} onChange={(v) => editMethod(m.id, { enabled: v })} label={m.enabled ? "Shown to customers" : "Hidden"} />
                  <button
                    type="button"
                    onClick={() => removeMethod(m.id, m.name)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Name customers see" hint="Example: BEP20 USDT">
                    <input className={inputCls} value={m.name} onChange={(e) => editMethod(m.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Coin" hint="Example: USDT">
                    <input className={inputCls} value={m.coin} onChange={(e) => editMethod(m.id, { coin: e.target.value })} />
                  </Field>
                  <Field label="Network" hint="Example: BEP20 or TRC20">
                    <input className={inputCls} value={m.network} onChange={(e) => editMethod(m.id, { network: e.target.value })} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Your wallet address">
                    <input
                      className={`${inputCls} font-mono`}
                      value={m.address}
                      placeholder="Paste your deposit address"
                      spellCheck={false}
                      onChange={(e) => editMethod(m.id, { address: e.target.value.trim() })}
                    />
                  </Field>
                  {!m.address.trim() && <p className="mt-1 text-[11px] text-amber-400">No address yet: this method is hidden from customers until you add one.</p>}
                  {problem && <p className="mt-1 text-[11px] text-red-400">{problem} Double-check before saving.</p>}
                </div>
              </div>
            );
          })}
          <Field label="Extra note under the steps (optional)">
            <input
              className={inputCls}
              value={config.payment.note}
              onChange={(e) => setPay({ note: e.target.value })}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Top announcement bar" subtitle="A coloured strip above the navbar. Good for offers.">
        <div className="space-y-4">
          <Toggle
            checked={config.announcement.enabled}
            onChange={(v) => setAnn({ enabled: v })}
            label="Show announcement bar"
          />
          <Field label="Text">
            <input
              className={inputCls}
              value={config.announcement.text}
              onChange={(e) => setAnn({ text: e.target.value })}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Hero section" subtitle="The first thing visitors see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Top badge" className="sm:col-span-2">
            <input className={inputCls} value={config.hero.badge} onChange={(e) => setHero({ badge: e.target.value })} />
          </Field>
          <Field label="Headline (white)">
            <input
              className={inputCls}
              value={config.hero.headlineTop}
              onChange={(e) => setHero({ headlineTop: e.target.value })}
            />
          </Field>
          <Field label="Headline (green highlight)">
            <input
              className={inputCls}
              value={config.hero.headlineAccent}
              onChange={(e) => setHero({ headlineAccent: e.target.value })}
            />
          </Field>
          <Field label="Subheadline" className="sm:col-span-2">
            <textarea
              rows={2}
              className={inputCls}
              value={config.hero.subheadline}
              onChange={(e) => setHero({ subheadline: e.target.value })}
            />
          </Field>
        </div>
      </Panel>

      <Panel
        title="FAQ"
        subtitle="Questions shown in the Rules & FAQ accordion."
        action={
          <button
            type="button"
            onClick={() => setFaqs([...config.faqs, { q: "New question?", a: "Answer here." }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
          >
            <Plus className="h-4 w-4" /> Add question
          </button>
        }
      >
        <div className="space-y-4">
          {config.faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <Field label={`Question ${i + 1}`}>
                    <input className={inputCls} value={f.q} onChange={(e) => editFaq(i, { q: e.target.value })} />
                  </Field>
                  <Field label="Category">
                    <select
                      className={inputCls}
                      value={f.cat ?? "General"}
                      onChange={(e) => editFaq(i, { cat: e.target.value })}
                    >
                      {FAQ_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Answer">
                    <textarea
                      rows={3}
                      className={inputCls}
                      value={f.a}
                      onChange={(e) => editFaq(i, { a: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => moveFaq(i, -1)}
                    disabled={i === 0}
                    className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => moveFaq(i, 1)}
                    disabled={i === config.faqs.length - 1}
                    className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete question"
                    onClick={() => setFaqs(config.faqs.filter((_, idx) => idx !== i))}
                    className="rounded-lg border border-red-500/30 p-2 text-red-300 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {config.faqs.length === 0 && (
            <p className="text-sm text-slate-500">No questions yet. Click “Add question”.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

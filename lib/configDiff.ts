import { ACCOUNT_SIZES, formatSize, type ModelConfig } from "./plans";
import type { SiteConfig } from "./siteConfig";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function fmt(v: unknown): string {
  if (typeof v === "string") return `"${v.length > 70 ? v.slice(0, 70) + "…" : v}"`;
  if (typeof v === "boolean") return v ? "on" : "off";
  if (v === undefined || v === null || v === "") return "(empty)";
  return String(v);
}

const SCALARS: { key: "brandName" | "supportEmail" | "bestValueSize" | "referralPct"; label: string }[] = [
  { key: "brandName", label: "Brand name" },
  { key: "supportEmail", label: "Support email" },
  { key: "bestValueSize", label: "Best value size" },
  { key: "referralPct", label: "Referral commission %" },
];

/** What changed between two site configs: a readable list + the minimal patch to apply. */
export function diffConfig(before: SiteConfig, after: SiteConfig): { summary: string[]; patch: Record<string, unknown> } {
  const summary: string[] = [];
  const patch: Record<string, unknown> = {};

  for (const { key, label } of SCALARS) {
    if (!same(before[key], after[key])) {
      patch[key] = after[key];
      summary.push(`${label}: ${fmt(before[key])} → ${fmt(after[key])}`);
    }
  }

  for (const group of ["announcement", "hero"] as const) {
    if (same(before[group], after[group])) continue;
    patch[group] = after[group];
    const b = before[group] as unknown as Record<string, unknown>;
    const a = after[group] as unknown as Record<string, unknown>;
    for (const k of Object.keys(a)) {
      if (!same(b[k], a[k])) summary.push(`${group === "hero" ? "Hero" : "Announcement"} · ${k}: ${fmt(b[k])} → ${fmt(a[k])}`);
    }
  }

  if (!same(before.models, after.models)) {
    patch.models = after.models;
    const bm = new Map(before.models.map((m) => [m.id, m]));
    const am = new Map(after.models.map((m) => [m.id, m]));
    for (const m of before.models) if (!am.has(m.id)) summary.push(`Plan removed: ${m.name}`);
    for (const m of after.models) {
      const old = bm.get(m.id);
      if (!old) {
        summary.push(`New plan added: ${m.name} (${m.group})`);
        continue;
      }
      const o = old as unknown as Record<string, unknown>;
      const n = m as ModelConfig as unknown as Record<string, unknown>;
      for (const k of Object.keys(n)) {
        if (k === "prices" || same(o[k], n[k])) continue;
        summary.push(`${m.name} · ${k}: ${fmt(o[k])} → ${fmt(n[k])}`);
      }
      for (const size of ACCOUNT_SIZES) {
        if (old.prices[size] !== m.prices[size]) {
          summary.push(`${m.name} · ${formatSize(size)} price: $${old.prices[size]} → $${m.prices[size]}`);
        }
      }
    }
    const ob = before.models.filter((m) => am.has(m.id)).map((m) => m.id);
    const oa = after.models.filter((m) => bm.has(m.id)).map((m) => m.id);
    if (!same(ob, oa)) summary.push("Plan order changed");
  }

  if (!same(before.faqs, after.faqs)) {
    patch.faqs = after.faqs;
    const bq = new Set(before.faqs.map((f) => f.q));
    const aq = new Set(after.faqs.map((f) => f.q));
    const added = after.faqs.filter((f) => !bq.has(f.q)).length;
    const removed = before.faqs.filter((f) => !aq.has(f.q)).length;
    summary.push(`FAQ changed (${added} new/edited questions, ${removed} removed or renamed)`);
  }

  return { summary: summary.length > 40 ? [...summary.slice(0, 40), `…and ${summary.length - 40} more`] : summary, patch };
}

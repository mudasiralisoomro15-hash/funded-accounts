// ─────────────────────────────────────────────────────────────
// Plan data. All numbers below are PLACEHOLDERS — replace them with
// your real rules and prices. The whole UI reads from this file only.
// ─────────────────────────────────────────────────────────────

export const ACCOUNT_SIZES = [2500, 5000, 10000, 25000, 50000, 100000] as const;
export type AccountSize = (typeof ACCOUNT_SIZES)[number];

export type ModelId = "instant-flex" | "instant-lite" | "one-step" | "two-step";
export type DrawdownType = "Static" | "Trailing";

export interface ModelConfig {
  id: ModelId;
  name: string;
  tabLabel: string;
  tagline: string;
  drawdownType: DrawdownType;
  dailyLossPct: number;
  maxDrawdownPct: number;
  leverage: string;
  profitTarget: string;
  minTradingDays: string;
  profitSplit: string;
  payouts: string;
  discountPct: number;
  popular?: boolean;
  enabled: boolean;
  prices: Record<AccountSize, number>;
}

/** What the user picked on a pricing card (passed to auth modal / checkout). */
export interface PlanSelection {
  modelId: ModelId;
  size: AccountSize;
  price: number;
}

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: "instant-flex",
    name: "Instant Flex",
    tabLabel: "Instant Flex (Static)",
    tagline: "Funded from day one. Fixed drawdown floor, zero profit target.",
    drawdownType: "Static",
    dailyLossPct: 3,
    maxDrawdownPct: 6,
    leverage: "1:50",
    profitTarget: "None",
    minTradingDays: "0 Days / Instant",
    profitSplit: "Up to 90%",
    payouts: "On-Demand",
    discountPct: 20,
    popular: true,
    enabled: true,
    prices: { 2500: 39, 5000: 69, 10000: 129, 25000: 299, 50000: 549, 100000: 999 },
  },
  {
    id: "instant-lite",
    name: "Instant Lite",
    tabLabel: "Instant Lite (Trailing)",
    tagline: "Lowest entry price. Instant funding with a trailing drawdown.",
    drawdownType: "Trailing",
    dailyLossPct: 3,
    maxDrawdownPct: 4,
    leverage: "1:50",
    profitTarget: "None",
    minTradingDays: "0 Days / Instant",
    profitSplit: "Up to 80%",
    payouts: "Bi-Weekly",
    discountPct: 20,
    enabled: true,
    prices: { 2500: 29, 5000: 49, 10000: 89, 25000: 209, 50000: 389, 100000: 699 },
  },
  {
    id: "one-step",
    name: "1-Step Challenge",
    tabLabel: "1-Step Challenge",
    tagline: "Hit a single profit target and get funded.",
    drawdownType: "Static",
    dailyLossPct: 4,
    maxDrawdownPct: 8,
    leverage: "1:100",
    profitTarget: "10%",
    minTradingDays: "3 Days",
    profitSplit: "Up to 100%",
    payouts: "Bi-Weekly / On-Demand",
    discountPct: 25,
    enabled: true,
    prices: { 2500: 22, 5000: 39, 10000: 69, 25000: 169, 50000: 299, 100000: 549 },
  },
  {
    id: "two-step",
    name: "2-Step Challenge",
    tabLabel: "2-Step Challenge",
    tagline: "Two phases with the most room to breathe.",
    drawdownType: "Static",
    dailyLossPct: 5,
    maxDrawdownPct: 10,
    leverage: "1:100",
    profitTarget: "8% / 5%",
    minTradingDays: "5 Days",
    profitSplit: "Up to 100%",
    payouts: "Bi-Weekly / On-Demand",
    discountPct: 25,
    enabled: true,
    prices: { 2500: 19, 5000: 32, 10000: 55, 25000: 139, 50000: 249, 100000: 459 },
  },
];

export const MODEL_LIST = DEFAULT_MODELS;

export function getModel(id: ModelId, models: ModelConfig[] = DEFAULT_MODELS): ModelConfig {
  return models.find((m) => m.id === id) ?? models[0] ?? DEFAULT_MODELS[0];
}

/** Struck-through "before discount" price shown next to the discount pill. */
export function getListPrice(model: ModelConfig, size: AccountSize): number {
  const price = model.prices[size] ?? 0;
  if (model.discountPct <= 0 || model.discountPct >= 95) return price;
  return Math.round(price / (1 - model.discountPct / 100));
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatUSD = (n: number): string => usd.format(n);

/** 2500 -> "$2.5K", 100000 -> "$100K" */
export const formatSize = (n: number): string =>
  n >= 1000 ? `$${n / 1000}K` : `$${n}`;

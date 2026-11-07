// ─────────────────────────────────────────────────────────────
// Plan data. Rules follow EZE Funded's published FAQ; prices are
// estimates — set your real prices in /admin → Plans. The whole UI reads from this file only.
// ─────────────────────────────────────────────────────────────

export const ACCOUNT_SIZES = [2500, 5000, 10000, 20000, 50000, 100000] as const;
export type AccountSize = (typeof ACCOUNT_SIZES)[number];

export type ModelId =
  | "one-step"
  | "one-step-pro"
  | "two-step"
  | "two-step-prime"
  | "two-step-pro"
  | "three-step";
export type DrawdownType = "Static" | "Trailing";

export interface ModelConfig {
  id: ModelId;
  name: string;
  tabLabel: string;
  tagline: string;
  drawdownType: DrawdownType;
  dailyLossPct: number;
  maxDrawdownPct: number;
  /** Max drawdown on the live funded account (%). */
  fundedMaxDdPct: number;
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

const COMMON = {
  leverage: "Forex 1:100 · Gold/Crypto 1:50",
  minTradingDays: "5 profitable days (0.5%+ each)",
  profitSplit: "80% (up to 100%)",
  payouts: "Daily (min $20, crypto)",
  drawdownType: "Static" as DrawdownType,
  discountPct: 20,
  enabled: true,
};

export const DEFAULT_MODELS: ModelConfig[] = [
  {
    ...COMMON,
    id: "one-step",
    fundedMaxDdPct: 45,
    name: "1 Step",
    tabLabel: "1 Step",
    tagline: "One phase, one 12% target. Funded max drawdown 45%, no daily loss on funded.",
    dailyLossPct: 4,
    maxDrawdownPct: 8,
    profitTarget: "12%",
    popular: true,
    prices: { 2500: 40, 5000: 60, 10000: 100, 20000: 180, 50000: 380, 100000: 650 },
  },
  {
    ...COMMON,
    id: "one-step-pro",
    fundedMaxDdPct: 60,
    name: "1 Step Pro",
    tabLabel: "1 Step Pro",
    tagline: "Tighter challenge limits, much bigger funded drawdown (60%).",
    dailyLossPct: 3,
    maxDrawdownPct: 6,
    profitTarget: "12%",
    prices: { 2500: 45, 5000: 70, 10000: 115, 20000: 205, 50000: 430, 100000: 740 },
  },
  {
    ...COMMON,
    id: "two-step",
    fundedMaxDdPct: 35,
    name: "2 Step",
    tabLabel: "2 Step",
    tagline: "Two phases (10% + 5%) with room to breathe. Funded max drawdown 35%.",
    dailyLossPct: 5,
    maxDrawdownPct: 10,
    profitTarget: "10% / 5%",
    prices: { 2500: 30, 5000: 45, 10000: 75, 20000: 140, 50000: 290, 100000: 520 },
  },
  {
    ...COMMON,
    id: "two-step-prime",
    fundedMaxDdPct: 50,
    name: "2 Step Prime",
    tabLabel: "2 Step Prime",
    tagline: "Two phases (10% + 5%) with a 50% funded max drawdown.",
    dailyLossPct: 5,
    maxDrawdownPct: 10,
    profitTarget: "10% / 5%",
    prices: { 2500: 35, 5000: 55, 10000: 90, 20000: 165, 50000: 340, 100000: 600 },
  },
  {
    ...COMMON,
    id: "two-step-pro",
    fundedMaxDdPct: 60,
    name: "2 Step Pro",
    tabLabel: "2 Step Pro",
    tagline: "Smaller targets (5% + 8%) and a 60% funded max drawdown.",
    dailyLossPct: 5,
    maxDrawdownPct: 8,
    profitTarget: "5% / 8%",
    prices: { 2500: 38, 5000: 58, 10000: 95, 20000: 170, 50000: 350, 100000: 620 },
  },
  {
    ...COMMON,
    id: "three-step",
    fundedMaxDdPct: 80,
    name: "3 Step",
    tabLabel: "3 Step",
    tagline: "Three small steps (4% + 5% + 8%). Funded max drawdown up to 80%.",
    dailyLossPct: 3,
    maxDrawdownPct: 8,
    minTradingDays: "2 / 2 / 3 profitable days per phase",
    profitTarget: "4% / 5% / 8%",
    prices: { 2500: 25, 5000: 38, 10000: 62, 20000: 115, 50000: 240, 100000: 430 },
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

/** Top-level tabs on the pricing section (1 Step / 2 Step / 3 Step). */
export const MODEL_GROUPS = [
  { key: "one", label: "1 Step", prefix: "one-step" },
  { key: "two", label: "2 Step", prefix: "two-step" },
  { key: "three", label: "3 Step", prefix: "three-step" },
] as const;

export const groupOf = (id: string) => MODEL_GROUPS.find((g) => id.startsWith(g.prefix)) ?? MODEL_GROUPS[0];

/** The size that gets the orange "Best value" badge. */
export const BEST_VALUE_SIZE: AccountSize = 50000;

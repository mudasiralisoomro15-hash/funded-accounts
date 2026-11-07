import { DEFAULT_MODELS, type ModelConfig } from "./plans";

// Everything the admin panel can change lives in this one object.
// It is saved as a single document (Firestore: config/site).

export interface FaqItem {
  q: string;
  a: string;
  cat?: string;
}

export const FAQ_CATEGORIES = ["Challenge", "Payouts", "Trading Rules", "General"];

export interface SiteConfig {
  brandName: string;
  supportEmail: string;
  announcement: { enabled: boolean; text: string };
  hero: {
    badge: string;
    headlineTop: string;
    headlineAccent: string;
    subheadline: string;
  };
  models: ModelConfig[];
  /** Account size that gets the orange "Best value" badge (0 = none). */
  bestValueSize: number;
  faqs: FaqItem[];
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "What is the difference between Static and Trailing Drawdown?",
    cat: "Trading Rules",
    a: "With Static Drawdown your loss floor is fixed below your starting balance and never moves. On a $10,000 account with an 8% static drawdown, the floor is always $9,200. With Trailing Drawdown the floor follows your equity upward as you reach new highs, which locks in progress but leaves less room to give profits back. All our models use Static drawdown.",
  },
  {
    q: "Are Expert Advisors (EAs) allowed?",
    cat: "Trading Rules",
    a: "No. EAs, bots and any automated trading systems are not allowed. All trades must be placed manually.",
  },
  {
    q: "How fast are payouts processed?",
    cat: "Payouts",
    a: "Payouts are available daily, and you can request multiple times a day. The minimum payout is $20, paid in crypto, and KYC must be completed first. You keep 80% of eligible profit from the first dollar.",
  },
  {
    q: "What is the minimum number of trading days?",
    cat: "Challenge",
    a: "Most models need 5 profitable days, each with at least 0.5% profit. The 3 Step model needs 2, 2 and 3 profitable days across its three phases. There is no maximum trading period.",
  },
  {
    q: "Can I trade during high-impact news?",
    cat: "Trading Rules",
    a: "Yes, during challenge phases. On funded accounts, opening or closing trades within 5 minutes of a high-impact (red-folder) news event is a breach.",
  },
  {
    q: "What leverage do I get?",
    cat: "Trading Rules",
    a: "Forex 1:100, Gold 1:50 and Crypto 1:50. Swing accounts may hold trades over the weekend; Scalping accounts must close all trades and pending orders before the weekend close.",
  },
  {
    q: "Which challenge models are available?",
    cat: "Challenge",
    a: "1 Step and 1 Step Pro, 2 Step, 2 Step Prime and 2 Step Pro, and 3 Step. Fewer steps mean a bigger single target; more steps mean smaller targets and a larger funded drawdown. There is no daily loss limit on funded accounts.",
  },
  {
    q: "What happens if I hit the daily loss limit or max drawdown?",
    cat: "Trading Rules",
    a: "The account is closed once a limit is breached. You can start again with a new account at any time.",
  },  {
    q: "How do I contact support?",
    cat: "General",
    a: "Open the Support page in your trader dashboard or email us. We usually reply within 24 hours.",
  },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: "FundedX",
  supportEmail: "support@yourdomain.com",
  announcement: {
    enabled: false,
    text: "🔥 Launch offer: extra discount on all challenges this week!",
  },
  hero: {
    badge: "⚡ Up to 100% Profit Split & Daily Payouts",
    headlineTop: "Trade Firm Capital.",
    headlineAccent: "Keep Up To 100% Of The Profits.",
    subheadline:
      "1, 2 and 3 Step challenges, accounts up to $100K, daily payouts and no maximum trading period.",
  },
  models: DEFAULT_MODELS,
  bestValueSize: 50000,
  faqs: DEFAULT_FAQS,
};

export function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Fills any missing field with defaults so old/partial saves never break the site. */
export function mergeConfig(saved: Partial<SiteConfig> | null | undefined): SiteConfig {
  const base = cloneConfig(DEFAULT_SITE_CONFIG);
  if (!saved) return base;

  const tpl = base.models[0];
  const models =
    Array.isArray(saved.models) && saved.models.length > 0
      ? saved.models.map((sm) => {
          const def = base.models.find((d) => d.id === sm.id) ?? tpl;
          return {
            ...def,
            ...sm,
            group: sm.group || def.group,
            prices: { ...def.prices, ...(sm.prices ?? {}) },
          };
        })
      : base.models;

  return {
    brandName: saved.brandName?.trim() || base.brandName,
    supportEmail: saved.supportEmail?.trim() || base.supportEmail,
    announcement: { ...base.announcement, ...(saved.announcement ?? {}) },
    hero: { ...base.hero, ...(saved.hero ?? {}) },
    models,
    bestValueSize: typeof saved.bestValueSize === "number" ? saved.bestValueSize : base.bestValueSize,
    faqs: Array.isArray(saved.faqs) ? saved.faqs : base.faqs,
  };
}

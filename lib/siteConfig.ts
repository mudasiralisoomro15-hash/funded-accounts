import { DEFAULT_MODELS, type ModelConfig } from "./plans";

// Everything the admin panel can change lives in this one object.
// It is saved as a single document (Firestore: config/site).

export interface FaqItem {
  q: string;
  a: string;
}

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
  faqs: FaqItem[];
}

export const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "What is the difference between Static and Trailing Drawdown?",
    a: "With Static Drawdown your loss floor is fixed below your starting balance and never moves. On a $10,000 account with a 6% static drawdown, the floor is always $9,400. With Trailing Drawdown the floor follows your equity upward as you reach new highs, which locks in progress but leaves less room to give profits back. Instant Flex uses Static, Instant Lite uses Trailing.",
  },
  {
    q: "Are Expert Advisors (EAs) allowed?",
    a: "Yes. EAs and trading bots are allowed on every account model. We only ask that they are not used for abusive practices such as latency arbitrage or exploiting platform errors.",
  },
  {
    q: "How fast are payouts processed?",
    a: "Most payout requests are processed within 48 hours. You can withdraw via Crypto (USDT) or bank transfer, on-demand or bi-weekly depending on your model.",
  },
  {
    q: "Is there a consistency rule?",
    a: "No. There is no consistency rule on any account model. Trade your own strategy and keep your edge.",
  },
  {
    q: "Can I trade during high-impact news?",
    a: "Yes, news trading is allowed on all models. Keep in mind that spreads can widen and slippage can occur around major releases.",
  },
  {
    q: "What is the difference between Instant and Challenge models?",
    a: "Instant models (Flex and Lite) fund you from day one with no profit target and no minimum trading days. Challenge models (1-Step and 2-Step) require you to reach a profit target first, and come with higher drawdown limits and leverage.",
  },
  {
    q: "What happens if I hit the daily loss limit or max drawdown?",
    a: "The account is closed once a limit is breached. You can start again with a new account at any time.",
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
    badge: "⚡ Up to 100% Profit Split & On-Demand Payouts",
    headlineTop: "Trade Firm Capital.",
    headlineAccent: "Keep Up To 100% Of The Profits.",
    subheadline:
      "No complex rules. High leverage, static & trailing drawdown options, fast withdrawals via Crypto & Bank.",
  },
  models: DEFAULT_MODELS,
  faqs: DEFAULT_FAQS,
};

export function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Fills any missing field with defaults so old/partial saves never break the site. */
export function mergeConfig(saved: Partial<SiteConfig> | null | undefined): SiteConfig {
  const base = cloneConfig(DEFAULT_SITE_CONFIG);
  if (!saved) return base;

  const models = base.models.map((def) => {
    const s = saved.models?.find((m) => m.id === def.id);
    if (!s) return def;
    return { ...def, ...s, prices: { ...def.prices, ...(s.prices ?? {}) } };
  });

  return {
    brandName: saved.brandName?.trim() || base.brandName,
    supportEmail: saved.supportEmail?.trim() || base.supportEmail,
    announcement: { ...base.announcement, ...(saved.announcement ?? {}) },
    hero: { ...base.hero, ...(saved.hero ?? {}) },
    models,
    faqs: Array.isArray(saved.faqs) ? saved.faqs : base.faqs,
  };
}

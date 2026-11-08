import type { ModelConfig } from "./plans";
import type { AccountStats, OrderRecord } from "./types";

export const PHASES = ["Phase 1", "Phase 2", "Funded"] as const;

/** $10,082.20 (always two decimals, like a trading account). */
export const money = (n: number): string =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "+$82.20" / "-$457.40" */
export const signedMoney = (n: number): string => `${n > 0 ? "+" : n < 0 ? "-" : ""}${money(Math.abs(n))}`;

/** Stats with defaults for an account the admin has not updated yet. */
export function resolveStats(order: OrderRecord): AccountStats {
  const s = order.stats;
  return {
    phase: s?.phase ?? "Phase 1",
    balance: s?.balance ?? order.size,
    equity: s?.equity ?? s?.balance ?? order.size,
    todayProfit: s?.todayProfit ?? 0,
    tradingDays: s?.tradingDays ?? 0,
    updatedAt: s?.updatedAt,
  };
}

/** Profit target % for the phase, from the plan text ("8% / 5%" -> 8 for Phase 1, 5 for Phase 2). */
function targetPct(model: ModelConfig, phase: string): number | null {
  if (phase === "Funded") return null;
  const nums = (model.profitTarget.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  if (nums.length === 0) return null;
  return nums[Math.min(phase === "Phase 2" ? 1 : 0, nums.length - 1)];
}

/** "5 profitable days (0.5%+ each)" -> 5 */
function requiredDays(model: ModelConfig): number {
  const m = model.minTradingDays.match(/\d+/);
  return m ? Number(m[0]) : 0;
}

export interface Objective {
  key: string;
  title: string;
  /** 0-100 for the ring. */
  pct: number;
  /** "used" fills up when you lose (drawdown); "done" fills up when you progress (target, days). */
  kind: "used" | "done";
  rows: { label: string; value: string; tone?: "good" | "bad" }[];
  /** Limit reached. */
  breached: boolean;
  met: boolean;
}

export interface AccountView {
  stats: AccountStats;
  totalPnl: number;
  floatingPnl: number;
  objectives: Objective[];
  violated: boolean;
  /** Profit target reached and enough trading days. */
  passed: boolean;
}

export function computeAccount(order: OrderRecord, model: ModelConfig): AccountView {
  const stats = resolveStats(order);
  const size = order.size;

  const totalPnl = stats.balance - size;
  const floatingPnl = stats.equity - stats.balance;
  const overall = stats.equity - size;

  const dailyLimit = (size * model.dailyLossPct) / 100;
  const dailyLoss = Math.max(0, -stats.todayProfit);
  const dailyLeft = Math.max(0, dailyLimit - dailyLoss);

  const maxLimit = (size * model.maxDrawdownPct) / 100;
  const maxLeft = Math.max(0, maxLimit + overall);
  const maxUsed = Math.min(100, Math.max(0, ((maxLimit - maxLeft) / maxLimit) * 100));

  const objectives: Objective[] = [
    {
      key: "daily",
      title: "Daily Drawdown",
      kind: "used",
      pct: dailyLimit > 0 ? Math.min(100, (dailyLoss / dailyLimit) * 100) : 0,
      breached: dailyLimit > 0 && dailyLoss >= dailyLimit,
      met: false,
      rows: [
        { label: "Total Limit", value: money(dailyLimit) },
        { label: "Today's PnL", value: signedMoney(stats.todayProfit), tone: stats.todayProfit > 0 ? "good" : stats.todayProfit < 0 ? "bad" : undefined },
        { label: "Remaining Loss Limit", value: money(dailyLeft) },
      ],
    },
    {
      key: "max",
      title: "Maximum Drawdown",
      kind: "used",
      pct: maxUsed,
      breached: maxLimit > 0 && maxLeft <= 0,
      met: false,
      rows: [
        { label: "Total Limit", value: money(maxLimit) },
        { label: "Overall PnL", value: signedMoney(overall), tone: overall > 0 ? "good" : overall < 0 ? "bad" : undefined },
        { label: "Remaining Loss Limit", value: money(maxLeft) },
      ],
    },
  ];

  const tPct = targetPct(model, stats.phase);
  let targetMet = true;
  if (tPct !== null) {
    const total = (size * tPct) / 100;
    const achieved = Math.max(0, totalPnl);
    targetMet = total > 0 && achieved >= total;
    objectives.push({
      key: "target",
      title: "Profit Target",
      kind: "done",
      pct: total > 0 ? Math.min(100, (achieved / total) * 100) : 0,
      breached: false,
      met: targetMet,
      rows: [
        { label: "Total Profit Target", value: money(total) },
        { label: "Achieved PnL", value: signedMoney(achieved), tone: achieved > 0 ? "good" : undefined },
        { label: "Remaining Profit Target", value: money(Math.max(0, total - achieved)) },
      ],
    });
  }

  const reqDays = stats.phase === "Funded" ? 0 : requiredDays(model);
  let daysMet = true;
  if (reqDays > 0) {
    daysMet = stats.tradingDays >= reqDays;
    objectives.push({
      key: "days",
      title: "Minimum Trading Days",
      kind: "done",
      pct: Math.min(100, (stats.tradingDays / reqDays) * 100),
      breached: false,
      met: daysMet,
      rows: [
        { label: "Required Trading Days", value: String(reqDays) },
        { label: "Current Trading Days", value: String(stats.tradingDays) },
        { label: "Remaining Trading Days", value: String(Math.max(0, reqDays - stats.tradingDays)) },
      ],
    });
  }

  const violated = objectives.some((o) => o.breached);
  return {
    stats,
    totalPnl,
    floatingPnl,
    objectives,
    violated,
    passed: !violated && tPct !== null && targetMet && daysMet,
  };
}

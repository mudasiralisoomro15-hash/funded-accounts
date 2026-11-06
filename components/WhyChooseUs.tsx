import { Bot, CalendarClock, Scale, Zap } from "lucide-react";

const ITEMS = [
  {
    icon: Zap,
    title: "Fast <48h Payouts",
    text: "Request a withdrawal and get paid within 48 hours via Crypto (USDT) or bank transfer.",
  },
  {
    icon: Bot,
    title: "EAs & Bots Allowed",
    text: "Run your Expert Advisors and trading bots on every account model.",
  },
  {
    icon: Scale,
    title: "No Consistency Rules",
    text: "Trade your own strategy. No consistency rule limiting how your profits are made.",
  },
  {
    icon: CalendarClock,
    title: "Bi-Weekly / On-Demand Payouts",
    text: "Pick the payout rhythm that suits your trading, bi-weekly or on-demand on eligible models.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="payouts" className="relative scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Why Traders Choose <span className="text-gradient">FundedX</span>
          </h2>
          <p className="mt-3 text-slate-400">
            Simple rules, fast payouts, and the freedom to trade your way.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-emerald-500/20 bg-card/70 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/30 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:shadow-glow">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

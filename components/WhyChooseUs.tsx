import { CalendarClock, Layers, ShieldCheck, Zap } from "lucide-react";

const ITEMS = [
  {
    icon: Zap,
    title: "Daily Payouts",
    text: "Request payouts every day, multiple times a day. Minimum $20, paid in crypto after KYC.",
  },
  {
    icon: Layers,
    title: "1, 2 & 3 Step Models",
    text: "Pick the path that suits you, from one 12% target to three small steps, up to $100K.",
  },
  {
    icon: ShieldCheck,
    title: "No Daily Loss on Funded",
    text: "Funded accounts have no daily loss limit and a large max drawdown, with no maximum trading period.",
  },
  {
    icon: CalendarClock,
    title: "80% Split, Up To 100%",
    text: "Keep 80% of eligible profit from the first dollar, with scaling that can raise it up to 100%.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="payouts" className="relative scroll-mt-16 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Why Traders Choose <span className="text-gradient">Us</span>
          </h2>
          <p className="mt-3 text-slate-600">Simple rules, fast payouts, and the freedom to trade your way.</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

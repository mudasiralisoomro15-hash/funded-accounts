import { Banknote, MousePointerClick, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Choose your account",
    text: "Pick a model and an account size, then buy in a minute. No long forms.",
  },
  {
    icon: TrendingUp,
    title: "Trade your way",
    text: "Trade manually on MetaTrader 5 with your own strategy. Stay inside the daily loss and drawdown limits.",
  },
  {
    icon: Banknote,
    title: "Get paid",
    text: "Request a payout from your dashboard and receive it by crypto or bank transfer.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 bg-[#07090d] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-3 text-slate-400">Three simple steps from sign-up to payout.</p>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/10 bg-[#10141c] p-7 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10"
            >
              <span className="absolute right-5 top-4 font-display text-5xl font-bold text-white/5 transition-colors group-hover:text-white/10">
                0{i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 font-display text-xl font-semibold text-white">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

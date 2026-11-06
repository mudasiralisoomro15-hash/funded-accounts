import { Award, CheckCircle2, Lock, Target, Trophy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";

const STEPS = [
  { icon: Target, title: "Pass a Challenge", text: "Complete a funded challenge and meet all trading objectives." },
  { icon: Trophy, title: "Hit Your Profit Target", text: "Reach the required profit target while staying within drawdown limits." },
  { icon: Award, title: "Receive Your Certificate", text: "Your achievement certificate is issued and available to download here." },
];

const CERTS = [
  { title: "Passed Evaluation", text: "Awarded when a trader successfully passes the evaluation phase." },
  { title: "Passed Verification", text: "Awarded when a trader completes the verification (challenge) phase." },
  { title: "Payout", text: "Issued when the customer receives a payout." },
];

export default function CertificatesPage() {
  return (
    <>
      <PageHeader title="Certificates" subtitle="Your achievements as a funded trader." />

      <section className="dash-card p-5">
        <h2 className="dash-text flex items-center gap-2 font-semibold">
          <Trophy className="dash-primary-text h-5 w-5" /> How to Earn Certificates
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="flex gap-3">
              <span className="dash-soft dash-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="dash-sub text-xs">Step {i + 1}</p>
                <p className="dash-text text-sm font-semibold">{title}</p>
                <p className="dash-sub mt-0.5 text-xs leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <h2 className="dash-sub mt-8 mb-3 flex items-center gap-2 text-sm font-semibold">
        <Lock className="h-4 w-4" /> Locked
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CERTS.map((c) => (
          <div key={c.title} className="dash-card overflow-hidden">
            <div className="dash-soft flex h-36 flex-col items-center justify-center gap-2">
              <span className="dash-surface dash-primary-text flex h-11 w-11 items-center justify-center rounded-full shadow">
                <Lock className="h-5 w-5" />
              </span>
              <span className="dash-surface dash-sub rounded-full px-3 py-0.5 text-xs">Locked</span>
            </div>
            <div className="p-4">
              <p className="dash-text flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="dash-sub h-4 w-4" /> {c.title}
              </p>
              <p className="dash-sub mt-1 text-xs leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

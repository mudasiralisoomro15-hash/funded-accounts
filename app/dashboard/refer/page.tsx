"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, Share2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PageHeader } from "@/components/dashboard/ui";

export default function ReferPage() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const link = `${origin}/?ref=${user?.uid ?? ""}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  const steps = [
    { icon: Share2, title: "Share your link", text: "Send your personal link to friends and your audience." },
    { icon: UserPlus, title: "They buy an account", text: "When someone signs up and buys through your link." },
    { icon: Gift, title: "You earn a reward", text: "Commission is added to your balance." },
  ];

  return (
    <>
      <PageHeader title="Refer & Earn" subtitle="Invite traders and earn a commission on every purchase." />

      <section className="dash-card p-5">
        <p className="dash-text text-sm font-semibold">Your referral link</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={link} className="dash-input flex-1" aria-label="Referral link" />
          <button type="button" onClick={copy} className="dash-btn sm:w-32">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="dash-sub mt-3 text-xs">
          Referral tracking and payouts are activated together with the payment system.
        </p>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Referred", value: "0" },
          { label: "Purchases", value: "0" },
          { label: "Earned", value: "$0" },
        ].map((s) => (
          <div key={s.label} className="dash-card p-4 text-center">
            <p className="dash-sub text-xs">{s.label}</p>
            <p className="dash-text mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="dash-card mt-6 p-5">
        <h2 className="dash-text font-semibold">How it works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="dash-soft dash-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="dash-text text-sm font-semibold">{title}</p>
                <p className="dash-sub mt-0.5 text-xs leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

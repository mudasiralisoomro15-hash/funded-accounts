"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, Mail, Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { PageHeader } from "@/components/dashboard/ui";

export default function SupportPage() {
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailto =
    `mailto:${config.supportEmail}` +
    `?subject=${encodeURIComponent(subject || "Support request")}` +
    `&body=${encodeURIComponent(`${message}\n\n---\nAccount: ${user?.email ?? ""}`)}`;

  return (
    <>
      <PageHeader title="Support" subtitle="We usually reply within 24 hours." />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="dash-card p-5 lg:col-span-2">
          <h2 className="dash-text font-semibold">Send us a message</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="dash-sub mb-1.5 block text-xs font-medium">Subject</span>
              <input className="dash-input" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="block">
              <span className="dash-sub mb-1.5 block text-xs font-medium">Message</span>
              <textarea
                rows={5}
                className="dash-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <a href={mailto} className="dash-btn">
              <Send className="h-4 w-4" /> Send via email
            </a>
          </div>
        </section>

        <div className="space-y-4">
          <div className="dash-card p-5">
            <Mail className="dash-primary-text h-5 w-5" />
            <p className="dash-text mt-2 text-sm font-semibold">Email</p>
            <a href={`mailto:${config.supportEmail}`} className="dash-sub break-all text-sm hover:underline">
              {config.supportEmail}
            </a>
          </div>
          <div className="dash-card p-5">
            <HelpCircle className="dash-primary-text h-5 w-5" />
            <p className="dash-text mt-2 text-sm font-semibold">FAQ</p>
            <Link href="/#faq" className="dash-sub text-sm hover:underline">
              Read the rules and common questions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

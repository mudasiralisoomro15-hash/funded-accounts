"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useDashTheme } from "@/components/dashboard/DashContext";
import { PageHeader } from "@/components/dashboard/ui";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useDashTheme();

  const rows = [
    { label: "Full name", value: user?.name ?? "-" },
    { label: "Email", value: user?.email ?? "-" },
    { label: "Login method", value: user?.provider === "google" ? "Google" : user?.provider === "password" ? "Email & password" : "Demo" },
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile and preferences." />

      <div className="grid max-w-3xl gap-4">
        <section className="dash-card p-5">
          <h2 className="dash-text font-semibold">Profile</h2>
          <dl className="mt-3">
            {rows.map((r) => (
              <div key={r.label} className="dash-border flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
                <dt className="dash-sub text-sm">{r.label}</dt>
                <dd className="dash-text text-sm font-medium">{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="dash-card p-5">
          <h2 className="dash-text font-semibold">Appearance</h2>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="dash-sub text-sm">Switch between light and dark mode.</p>
            <button type="button" onClick={toggle} className="dash-btn-outline">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </section>

        <section className="dash-card p-5">
          <h2 className="dash-text font-semibold">Identity verification (KYC)</h2>
          <p className="dash-sub mt-1 text-sm">
            Identity verification is requested before your first payout. This feature is coming soon.
          </p>
        </section>

        <section className="dash-card p-5">
          <h2 className="dash-text font-semibold">Session</h2>
          <button type="button" onClick={() => void signOut()} className="dash-btn-outline mt-3 text-red-500">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </section>
      </div>
    </>
  );
}

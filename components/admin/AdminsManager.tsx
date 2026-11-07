"use client";

import { useState } from "react";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import type { AdminRecord, AdminRole } from "@/lib/types";
import { Field, Panel, formatDate, inputCls } from "./ui";

const ROLE_LABEL: Record<AdminRole, string> = {
  full: "Full access (edits go live directly)",
  approval: "Needs my approval (edits come to me first)",
};

interface Props {
  admins: AdminRecord[];
  ownerEmail: string;
  onSave: (rec: AdminRecord) => Promise<void>;
  onRemove: (email: string) => Promise<void>;
}

export default function AdminsManager({ admins, ownerEmail, onSave, onRemove }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("approval");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function add() {
    const e = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e)) return setErr("Enter a valid Gmail / email address.");
    if (e === ownerEmail.toLowerCase()) return setErr("That is your own (owner) email.");
    setBusy(true);
    setErr(null);
    try {
      await onSave({ email: e, role, addedAt: new Date().toISOString(), addedBy: ownerEmail });
      setEmail("");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Could not add the admin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title={`Admin team (${admins.length + 1})`}
      subtitle="Add someone by email. They must sign in with this exact email (Google login works best). They then see the Admin Panel button."
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_auto] lg:items-end">
        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            placeholder="name@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Access level">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
            <option value="approval">{ROLE_LABEL.approval}</option>
            <option value="full">{ROLE_LABEL.full}</option>
          </select>
        </Field>
        <button type="button" onClick={add} disabled={busy} className="btn-glow px-5 py-2.5 text-sm">
          <UserPlus className="h-4 w-4" /> Add admin
        </button>
      </div>
      {err && <p className="mt-3 text-sm text-red-300">{err}</p>}

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Access</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="px-4 py-3 font-medium text-white">{ownerEmail}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold text-orange-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Owner
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">—</td>
              <td />
            </tr>
            {admins.map((a) => (
              <tr key={a.email} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 font-medium text-white">{a.email}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Access for ${a.email}`}
                    className={`${inputCls} w-auto py-1.5`}
                    value={a.role}
                    onChange={(e) => void onSave({ ...a, role: e.target.value as AdminRole })}
                  >
                    <option value="approval">Needs my approval</option>
                    <option value="full">Full access</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(a.addedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Remove ${a.email}`}
                    onClick={() => window.confirm(`Remove admin ${a.email}?`) && void onRemove(a.email)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No other admins yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

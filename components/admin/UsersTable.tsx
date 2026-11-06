"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import type { UserRecord } from "@/lib/types";
import { Panel, formatDate, inputCls } from "./ui";

function downloadCsv(users: UserRecord[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["Name", "Email", "Provider", "Joined", "Last login"],
    ...users.map((u) => [u.name, u.email, u.provider, u.createdAt, u.lastLoginAt]),
  ];
  const csv = rows.map((r) => r.map((c) => esc(String(c ?? ""))).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UsersTable({ users }: { users: UserRecord[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  }, [users, q]);

  return (
    <Panel
      title={`Users (${users.length})`}
      subtitle="Everyone who signed up or logged in on your website."
      action={
        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      }
    >
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          className={`${inputCls} pl-9`}
          placeholder="Search name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Login type</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last login</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.uid} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-300">{u.email}</td>
                <td className="px-4 py-3 capitalize text-slate-400">{u.provider}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(u.lastLoginAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {users.length === 0 ? "No users yet." : "No match."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

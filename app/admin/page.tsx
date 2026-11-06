"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Receipt,
  RotateCcw,
  Save,
  ShieldAlert,
  Tags,
  Users,
} from "lucide-react";
import Logo from "@/components/Logo";
import AuthModal, { type AuthMode } from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import PlansEditor from "@/components/admin/PlansEditor";
import ContentEditor from "@/components/admin/ContentEditor";
import UsersTable from "@/components/admin/UsersTable";
import OrdersTable from "@/components/admin/OrdersTable";
import StatusBadge from "@/components/StatusBadge";
import { Panel, formatDate } from "@/components/admin/ui";
import { listOrders, listUsers, updateOrderStatus } from "@/lib/db";
import { DEFAULT_SITE_CONFIG, cloneConfig, type SiteConfig } from "@/lib/siteConfig";
import { formatSize, formatUSD } from "@/lib/plans";
import type { OrderRecord, OrderStatus, UserRecord } from "@/lib/types";

type Tab = "overview" | "plans" | "content" | "users" | "orders";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "plans", label: "Plans & Prices", icon: Tags },
  { id: "content", label: "Site Content", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "Orders", icon: Receipt },
];

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">{children}</div>
    </main>
  );
}

export default function AdminPage() {
  const { user, loading, isAdmin, demoMode, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  if (loading) {
    return (
      <FullScreen>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-400" />
      </FullScreen>
    );
  }

  if (!user) {
    return (
      <FullScreen>
        <Logo className="mb-6" />
        <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in with your admin account to continue.</p>
        <button type="button" onClick={() => setAuthOpen(true)} className="btn-glow mt-6 w-full">
          Sign In
        </button>
        <AuthModal
          open={authOpen}
          mode={authMode}
          order={null}
          onClose={closeAuth}
          onModeChange={setAuthMode}
        />
      </FullScreen>
    );
  }

  if (!isAdmin) {
    return (
      <FullScreen>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-white">No admin access</h1>
        <p className="mt-2 text-sm text-slate-400">
          {user.email} is not in the admin list. Add it to <code>NEXT_PUBLIC_ADMIN_EMAILS</code> and
          redeploy.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Back to site
          </Link>
          <button type="button" onClick={() => void signOut()} className="btn-glow flex-1 py-3 text-sm">
            Sign out
          </button>
        </div>
      </FullScreen>
    );
  }

  return <AdminPanel email={user.email} demoMode={demoMode} onSignOut={() => void signOut()} />;
}

// ─────────────────────────────────────────────────────────────

function AdminPanel({
  email,
  demoMode,
  onSignOut,
}: {
  email: string;
  demoMode: boolean;
  onSignOut: () => void;
}) {
  const { ready, error } = useSiteConfig();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-obsidian/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 md:inline">{email}</span>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {demoMode && (
        <div className="border-b border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-200 sm:text-sm">
          <AlertTriangle className="mr-1.5 inline h-4 w-4 align-text-bottom" />
          <strong>DEMO MODE</strong> — Firebase is not connected, so everything is saved only in this
          browser. Connect Firebase (see FIREBASE_SETUP.md) to save real users and make changes live for
          everyone.
        </div>
      )}

      {!ready ? (
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          {error ? (
            <>
              <ShieldAlert className="mx-auto h-10 w-10 text-red-300" />
              <h2 className="mt-4 font-display text-xl font-bold text-white">
                Could not load site settings
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {error} Editing is disabled so saved settings are not overwritten. Check that the
                Firestore rules are published, then refresh.
              </p>
            </>
          ) : (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-400" />
          )}
        </div>
      ) : (
        <Workspace />
      )}
    </div>
  );
}

// Mounted only after the saved config has loaded, so the draft always starts from real data.
function Workspace() {
  const { config, save, resetToDefaults } = useSiteConfig();
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<SiteConfig>(() => cloneConfig(config));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(config), [draft, config]);

  useEffect(() => {
    let alive = true;
    Promise.all([listUsers(), listOrders()])
      .then(([u, o]) => {
        if (!alive) return;
        setUsers(u);
        setOrders(o);
      })
      .catch((e) => {
        if (alive) setDataError(e instanceof Error ? e.message : "Could not load users/orders.");
      });
    return () => {
      alive = false;
    };
  }, []);

  // Success messages disappear by themselves.
  useEffect(() => {
    if (notice?.type !== "ok") return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  async function handleSave() {
    setSaving(true);
    setNotice(null);
    try {
      await save(draft);
      setNotice({ type: "ok", text: "Saved. Your website is updated." });
    } catch (e) {
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset ALL plans, prices and content back to the original defaults?")) return;
    setSaving(true);
    setNotice(null);
    try {
      await resetToDefaults();
      setDraft(cloneConfig(DEFAULT_SITE_CONFIG));
      setNotice({ type: "ok", text: "Reset to defaults." });
    } catch (e) {
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Reset failed." });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(id: string, status: OrderStatus) {
    const previous = orders;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(id, status);
    } catch (e) {
      setOrders(previous);
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not update order." });
    }
  }

  const pending = orders.filter((o) => o.status === "pending").length;
  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "active")
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
      {/* Tabs */}
      <nav className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" aria-label="Admin sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/40 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-6 space-y-5">
        {dataError && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {dataError}
          </p>
        )}

        {tab === "overview" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total users", value: String(users.length) },
                { label: "Total orders", value: String(orders.length) },
                { label: "Pending orders", value: String(pending) },
                { label: "Confirmed revenue", value: formatUSD(revenue) },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-emerald-500/20 bg-card/70 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <Panel title="Recent orders">
              {orders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders yet.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {orders.slice(0, 6).map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{o.name}</p>
                        <p className="text-xs text-slate-500">
                          {o.modelName} · {formatSize(o.size)} · {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-emerald-400">{formatUSD(o.price)}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Quick guide">
              <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-400">
                <li>
                  <strong className="text-slate-200">Plans & Prices:</strong> change prices, rules, discounts,
                  or hide a model.
                </li>
                <li>
                  <strong className="text-slate-200">Site Content:</strong> brand name, announcement bar, hero
                  text and FAQ.
                </li>
                <li>
                  <strong className="text-slate-200">Orders:</strong> after a customer pays, set the order to
                  “paid”, then “active” once you deliver the account.
                </li>
                <li>Changes go live only after you press “Save changes”.</li>
              </ul>
            </Panel>

            <Panel title="Danger zone" subtitle="Puts every plan, price and text back to the original defaults.">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset everything to defaults
              </button>
            </Panel>
          </>
        )}

        {tab === "plans" && (
          <PlansEditor models={draft.models} onChange={(models) => setDraft({ ...draft, models })} />
        )}
        {tab === "content" && <ContentEditor config={draft} onChange={setDraft} />}
        {tab === "users" && <UsersTable users={users} />}
        {tab === "orders" && <OrdersTable orders={orders} onStatusChange={handleStatus} />}
      </div>

      {/* Sticky save bar */}
      {(dirty || notice) && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-500/30 bg-obsidian/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <p
              className={`flex items-center gap-2 text-sm ${
                notice?.type === "err" ? "text-red-300" : dirty ? "text-amber-200" : "text-emerald-300"
              }`}
            >
              {notice?.type === "err" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : dirty ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {notice && !dirty ? notice.text : notice?.type === "err" ? notice.text : "You have unsaved changes."}
            </p>
            <div className="flex gap-2">
              {dirty && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(cloneConfig(config));
                    setNotice(null);
                  }}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Discard
                </button>
              )}
              {dirty && (
                <button type="button" onClick={handleSave} disabled={saving} className="btn-glow px-5 py-2.5 text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Gift,
  Inbox,
  UserCog,
  Ticket,
  Wallet,
  BadgeCheck,
  RotateCcw,
  Save,
  ShieldAlert,
  Tags,
  Users,
} from "lucide-react";
import Logo from "@/components/Logo";
import AuthModal, { type AuthMode } from "@/components/AuthModal";
import { useAuth, type AdminLevel } from "@/components/AuthProvider";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import PlansEditor from "@/components/admin/PlansEditor";
import ContentEditor from "@/components/admin/ContentEditor";
import UsersTable from "@/components/admin/UsersTable";
import OrdersTable from "@/components/admin/OrdersTable";
import CouponsManager from "@/components/admin/CouponsManager";
import PayoutsTable from "@/components/admin/PayoutsTable";
import KycTable from "@/components/admin/KycTable";
import ReferralsTable from "@/components/admin/ReferralsTable";
import AdminsManager from "@/components/admin/AdminsManager";
import RequestsPanel from "@/components/admin/RequestsPanel";
import StatusBadge from "@/components/StatusBadge";
import { Panel, formatDate } from "@/components/admin/ui";
import {
  createChangeRequest,
  decideChangeRequest,
  deleteCoupon,
  listAdmins,
  listChangeRequests,
  removeAdmin,
  saveAdmin,
  listCommissions,
  syncCommissionForOrder,
  updateCommissionStatus,
  listCoupons,
  listKyc,
  listOrders,
  listPayouts,
  listUsers,
  saveCoupon,
  updateKycStatus,
  updateOrderCredentials,
  updateOrderStatus,
  declineOrderPayment,
  deleteOrders,
  updatePayoutStatus,
} from "@/lib/db";
import { diffConfig } from "@/lib/configDiff";
import { DEFAULT_SITE_CONFIG, cloneConfig, mergeConfig, type SiteConfig } from "@/lib/siteConfig";
import { formatSize, formatUSD } from "@/lib/plans";
import type {
  AdminRecord,
  ChangeRequest,
  CommissionRecord,
  CommissionStatus,
  Coupon,
  KycRecord,
  KycStatus,
  OrderCredentials,
  OrderRecord,
  OrderStatus,
  PayoutRecord,
  PayoutStatus,
  UserRecord,
} from "@/lib/types";

type Tab =
  | "overview"
  | "plans"
  | "content"
  | "users"
  | "orders"
  | "coupons"
  | "payouts"
  | "kyc"
  | "referrals"
  | "requests"
  | "admins";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "plans", label: "Plans & Prices", icon: Tags },
  { id: "content", label: "Site Content", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "Orders", icon: Receipt },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "payouts", label: "Payouts", icon: Wallet },
  { id: "kyc", label: "KYC", icon: BadgeCheck },
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "requests", label: "Requests", icon: Inbox },
  { id: "admins", label: "Admins", icon: UserCog },
];

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">{children}</div>
    </main>
  );
}

export default function AdminPage() {
  const { user, loading, isAdmin, adminRole, demoMode, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  if (loading) {
    return (
      <FullScreen>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />
      </FullScreen>
    );
  }

  if (!user) {
    return (
      <FullScreen>
        <Logo onDark className="mb-6" />
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

  return (
    <AdminPanel
      email={user.email}
      role={adminRole ?? "approval"}
      demoMode={demoMode}
      onSignOut={() => void signOut()}
    />
  );
}

// ─────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<AdminLevel, string> = {
  owner: "Owner",
  full: "Full access",
  approval: "Needs approval",
};

function AdminPanel({
  email,
  role,
  demoMode,
  onSignOut,
}: {
  email: string;
  role: AdminLevel;
  demoMode: boolean;
  onSignOut: () => void;
}) {
  const { ready, error } = useSiteConfig();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-obsidian/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo onDark />
            <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30">
              {ROLE_BADGE[role]}
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
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400" />
          )}
        </div>
      ) : (
        <Workspace role={role} email={email} />
      )}
    </div>
  );
}

// Mounted only after the saved config has loaded, so the draft always starts from real data.
function Workspace({ role, email }: { role: AdminLevel; email: string }) {
  const { user } = useAuth();
  const { config, save, resetToDefaults } = useSiteConfig();
  const isOwner = role === "owner";
  const needsApproval = role === "approval";
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<SiteConfig>(() => cloneConfig(config));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [kyc, setKyc] = useState<KycRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(config), [draft, config]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      listUsers(),
      listOrders(),
      listCoupons(),
      listPayouts(),
      listKyc(),
      // Newer collections: if their rules are not published yet, the rest of the panel still works.
      listCommissions().catch(() => [] as CommissionRecord[]),
      listAdmins().catch(() => [] as AdminRecord[]),
      listChangeRequests().catch(() => [] as ChangeRequest[]),
    ])
      .then(([u, o, c, p, k, cm, ad, rq]) => {
        if (!alive) return;
        setUsers(u);
        setOrders(o);
        setCoupons(c);
        setPayouts(p);
        setKyc(k);
        setCommissions(cm);
        setAdmins(ad);
        setRequests(rq);
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

  /** Approval-level admins cannot change operational data (orders, payouts, ...). */
  function blocked(): boolean {
    if (!needsApproval) return false;
    setNotice({ type: "err", text: "Your access level can only suggest website edits (the owner approves them)." });
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setNotice(null);
    try {
      if (needsApproval) {
        const { summary, patch } = diffConfig(config, draft);
        if (summary.length === 0) {
          setNotice({ type: "err", text: "Nothing changed." });
          return;
        }
        await createChangeRequest({
          requesterEmail: email,
          requesterName: user?.name ?? email,
          summary,
          patch,
        });
        setRequests(await listChangeRequests());
        setDraft(cloneConfig(config));
        setNotice({ type: "ok", text: "Sent to the owner for approval. It goes live once approved." });
        return;
      }
      await save(draft);
      setNotice({ type: "ok", text: "Saved. Your website is updated." });
    } catch (e) {
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (blocked()) return;
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
    if (blocked()) return;
    const previous = orders;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(id, status);
      const order = previous.find((o) => o.id === id);
      if (order) {
        const changed = await syncCommissionForOrder(order, status, config.referralPct).catch(() => null);
        if (changed) setCommissions(await listCommissions());
      }
    } catch (e) {
      setOrders(previous);
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not update order." });
    }
  }

  async function handleDecline(id: string, reason: string) {
    if (blocked()) return;
    const previous = orders;
    const patch = { status: "declined" as OrderStatus, declineReason: reason, declinedAt: new Date().toISOString() };
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    try {
      await declineOrderPayment(id, reason);
    } catch (e) {
      setOrders(previous);
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not decline the payment." });
    }
  }

  async function handleDeleteOrders(ids: string[]) {
    if (blocked()) return;
    try {
      await deleteOrders(ids);
      const gone = new Set(ids);
      setOrders((list) => list.filter((o) => !gone.has(o.id)));
      setNotice({ type: "ok", text: `${ids.length} order${ids.length === 1 ? "" : "s"} deleted.` });
    } catch (e) {
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not delete the orders." });
    }
  }

  async function handleCredentials(id: string, credentials: OrderCredentials) {
    if (needsApproval) throw new Error("Not allowed");
    await updateOrderCredentials(id, credentials);
    // Delivering the login on an approved order makes it Active.
    const deliver = orders.find((o) => o.id === id)?.status === "paid";
    if (deliver) await updateOrderStatus(id, "active");
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, credentials, ...(deliver ? { status: "active" as OrderStatus } : {}) } : o))
    );
  }

  async function handleCouponSave(c: Coupon) {
    if (needsApproval) throw new Error("Your access level cannot change coupons.");
    await saveCoupon(c);
    setCoupons(await listCoupons());
  }

  async function handleCouponDelete(code: string) {
    if (needsApproval) return;
    await deleteCoupon(code);
    setCoupons((list) => list.filter((c) => c.code !== code));
  }

  async function handlePayout(id: string, status: PayoutStatus) {
    if (blocked()) return;
    const previous = payouts;
    setPayouts((list) => list.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      await updatePayoutStatus(id, status);
    } catch (e) {
      setPayouts(previous);
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not update payout." });
    }
  }

  async function handleCommission(id: string, status: CommissionStatus) {
    if (blocked()) return;
    const previous = commissions;
    setCommissions((list) => list.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await updateCommissionStatus(id, status);
    } catch (e) {
      setCommissions(previous);
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not update commission." });
    }
  }

  async function handleKyc(userId: string, status: KycStatus) {
    if (blocked()) return;
    const previous = kyc;
    setKyc((list) => list.map((k) => (k.userId === userId ? { ...k, status } : k)));
    try {
      await updateKycStatus(userId, status);
    } catch (e) {
      setKyc(previous);
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not update KYC." });
    }
  }

  async function handleDecide(req: ChangeRequest, status: "approved" | "rejected") {
    try {
      if (status === "approved") {
        const next = mergeConfig({ ...config, ...req.patch } as Partial<SiteConfig>);
        await save(next);
        if (!dirty) setDraft(cloneConfig(next));
      }
      await decideChangeRequest(req.id, status, email);
      setRequests(await listChangeRequests());
      setNotice({ type: "ok", text: status === "approved" ? "Approved and published." : "Request rejected." });
    } catch (e) {
      setNotice({ type: "err", text: e instanceof Error ? e.message : "Could not process the request." });
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  // Orders still waiting for the customer to pay are not shown as requests.
  const requested = orders.filter((o) => o.status !== "pending");
  const pending = orders.filter((o) => o.status === "review").length;
  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "active")
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
      {/* Tabs */}
      <nav className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible" aria-label="Admin sections">
        {TABS.filter((t) => t.id !== "admins" || isOwner).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? "border-blue-400 bg-blue-500/20 text-blue-300"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/40 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "requests" && isOwner && pendingRequests > 0 && (
              <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingRequests}</span>
            )}
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
                { label: "Total orders", value: String(requested.length) },
                { label: "Payments to review", value: String(pending) },
                { label: "Confirmed revenue", value: formatUSD(revenue) },
                { label: "Active accounts", value: String(orders.filter((o) => o.status === "active").length) },
                { label: "Pending payouts", value: String(payouts.filter((p) => p.status === "pending").length) },
                { label: "KYC to review", value: String(kyc.filter((k) => k.status === "pending").length) },
                { label: "Coupons on", value: String(coupons.filter((c) => c.enabled).length) },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-blue-500/20 bg-card/70 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <Panel title="Recent orders">
              {requested.length === 0 ? (
                <p className="text-sm text-slate-500">No orders yet.</p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {requested.slice(0, 6).map((o) => (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">{o.name}</p>
                        <p className="text-xs text-slate-500">
                          {o.modelName} · {formatSize(o.size)} · {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-400">{formatUSD(o.price)}</span>
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
                <li>
                  <strong className="text-slate-200">Orders → Login:</strong> enter the MT5 login, password
                  and server; the trader sees it in their dashboard.
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
          <PlansEditor config={draft} onChange={setDraft} />
        )}
        {tab === "content" && <ContentEditor config={draft} onChange={setDraft} />}
        {tab === "users" && <UsersTable users={users} />}
        {tab === "orders" && (
          <OrdersTable orders={orders} onStatusChange={handleStatus} onCredentials={handleCredentials} onDecline={handleDecline} onDelete={handleDeleteOrders} />
        )}
        {tab === "coupons" && (
          <CouponsManager coupons={coupons} onSave={handleCouponSave} onDelete={handleCouponDelete} />
        )}
        {tab === "payouts" && <PayoutsTable payouts={payouts} onStatusChange={handlePayout} />}
        {tab === "kyc" && <KycTable items={kyc} onDecision={handleKyc} />}
        {tab === "requests" && (
          <RequestsPanel requests={requests} isOwner={isOwner} myEmail={email} onDecide={handleDecide} />
        )}
        {tab === "admins" && isOwner && (
          <AdminsManager
            admins={admins}
            ownerEmail={email}
            onSave={async (rec) => {
              await saveAdmin(rec);
              setAdmins(await listAdmins());
            }}
            onRemove={async (e) => {
              await removeAdmin(e);
              setAdmins((list) => list.filter((a) => a.email !== e));
            }}
          />
        )}
        {tab === "referrals" && (
          <ReferralsTable commissions={commissions} users={users} ratePct={config.referralPct} onStatusChange={handleCommission} />
        )}
      </div>

      {/* Sticky save bar */}
      {(dirty || notice) && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-500/30 bg-obsidian/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <p
              className={`flex items-center gap-2 text-sm ${
                notice?.type === "err" ? "text-red-300" : dirty ? "text-amber-200" : "text-blue-300"
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
                  {needsApproval ? "Send for approval" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

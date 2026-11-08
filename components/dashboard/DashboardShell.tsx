"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  Headphones,
  Home,
  Loader2,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Receipt,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import AuthModal, { type AuthMode } from "@/components/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { DashThemeProvider, useDashTheme } from "./DashContext";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/refer", label: "Refer & Earn", icon: Users },
  { href: "/dashboard/contracts", label: "Contracts", icon: FileText },
  { href: "/dashboard/payout", label: "Payout", icon: Wallet },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/tools", label: "Tools", icon: Wrench },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/support", label: "Support", icon: Headphones },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function BrandBlock() {
  const { config } = useSiteConfig();
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
        <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" aria-hidden="true">
          <path d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z" stroke="#10B981" strokeWidth="2" />
          <path d="M17.5 8 11 17h4.5l-1 7 6.5-9h-4.5l1-7Z" fill="#22C55E" />
        </svg>
      </span>
      <span>
        <span className="dash-text block text-sm font-bold leading-tight">{config.brandName}</span>
        <span className="dash-sub block text-xs">Trader Dashboard</span>
      </span>
    </Link>
  );
}

function SidebarNav({
  pathname,
  isAdmin,
  onCollapse,
}: {
  pathname: string;
  isAdmin: boolean;
  /** Desktop only: closes the sidebar. */
  onCollapse?: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col">
      {onCollapse && (
        <button
          type="button"
          aria-label="Close sidebar"
          title="Close sidebar"
          onClick={onCollapse}
          className="dash-sub dash-hover absolute right-2 top-4 rounded-lg p-2"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      )}
      <BrandBlock />
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3" aria-label="Dashboard">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active ? "dash-soft dash-primary-text" : "dash-sub dash-hover"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="dash-sub dash-hover flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
          >
            <ShieldCheck className="h-[18px] w-[18px]" />
            Admin Panel
          </Link>
        )}
      </nav>
      <div className="p-3">
        <Link href="/#models" className="dash-btn w-full">
          <Plus className="h-4 w-4" /> Start New Challenge
        </Link>
      </div>
    </div>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, demoMode, signOut } = useAuth();
  const { config } = useSiteConfig();
  const { theme, toggle } = useDashTheme();
  const pathname = usePathname();

  const [drawer, setDrawer] = useState(false);
  // Desktop sidebar: always open on load; the user can close it with the button.
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menu, setMenu] = useState(false);
  const [banner, setBanner] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const closeAuth = useCallback(() => setAuthOpen(false), []);

  // Closing the sidebar lasts only until the page is reloaded: it is always open when the dashboard opens.
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  useEffect(() => {
    setDrawer(false);
    setMenu(false);
  }, [pathname]);

  // On a phone the sidebar is a slide-in panel: show it when the dashboard opens.
  useEffect(() => {
    try {
      localStorage.removeItem("fx_sidebar");
    } catch {
      /* ignore */
    }
    if (window.innerWidth < 1024) setDrawer(true);
  }, []);

  const root = `dash-root ${theme === "dark" ? "dash-dark" : "dash-light"}`;

  if (loading) {
    return (
      <div className={`${root} flex items-center justify-center`}>
        <Loader2 className="dash-primary-text h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${root} flex items-center justify-center px-4`}>
        <div className="dash-card w-full max-w-sm p-8 text-center">
          <h1 className="dash-text text-xl font-bold">Trader Dashboard</h1>
          <p className="dash-sub mt-2 text-sm">Sign in to see your accounts, payouts and tools.</p>
          <button type="button" onClick={() => setAuthOpen(true)} className="dash-btn mt-6 w-full">
            Sign In
          </button>
          <Link href="/" className="dash-sub mt-3 block text-sm hover:underline">
            ← Back to website
          </Link>
        </div>
        <AuthModal
          open={authOpen}
          mode={authMode}
          order={null}
          onClose={closeAuth}
          onModeChange={setAuthMode}
        />
      </div>
    );
  }

  const initials =
    user.name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const announcement = config.announcement;

  return (
    <div className={root}>
      {/* Desktop sidebar */}
      <aside
        className={`dash-surface dash-border fixed inset-y-0 left-0 z-30 hidden w-64 border-r ${
          sidebarOpen ? "lg:block" : ""
        }`}
      >
        <SidebarNav pathname={pathname} isAdmin={isAdmin} onCollapse={toggleSidebar} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawer(false)}
          />
          <aside className="dash-surface relative h-full w-64 shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawer(false)}
              className="dash-sub dash-hover absolute right-2 top-3 rounded-lg p-2"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNav pathname={pathname} isAdmin={isAdmin} />
          </aside>
        </div>
      )}

      <div className={sidebarOpen ? "lg:pl-64" : ""}>
        {announcement.enabled && announcement.text && banner && (
          <div className="flex items-start justify-between gap-3 bg-blue-600 px-4 py-2 text-xs font-semibold text-white sm:text-sm">
            <span className="flex-1 text-center">{announcement.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setBanner(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Top bar */}
        <header className="dash-surface dash-border sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawer(true)}
            className="dash-sub dash-hover rounded-lg p-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleSidebar}
            className="dash-sub dash-hover hidden rounded-lg p-2 lg:block"
          >
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="dash-sub dash-hover rounded-lg p-2"
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menu}
                className="dash-hover flex items-center gap-2 rounded-lg px-2 py-1.5"
              >
                <span className="dash-soft dash-primary-text flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                  {initials}
                </span>
                <span className="dash-text hidden max-w-[140px] truncate text-sm font-medium sm:block">
                  {user.name}
                </span>
                <ChevronDown className="dash-sub h-4 w-4" />
              </button>

              {menu && (
                <>
                  <button
                    type="button"
                    aria-label="Close user menu"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setMenu(false)}
                  />
                  <div className="dash-card absolute right-0 z-40 mt-2 w-56 p-1.5 shadow-lg" role="menu">
                    <p className="dash-sub truncate px-3 py-2 text-xs">{user.email}</p>
                    <Link href="/dashboard/settings" className="dash-text dash-hover block rounded-lg px-3 py-2 text-sm">
                      Settings
                    </Link>
                    <Link href="/" className="dash-text dash-hover block rounded-lg px-3 py-2 text-sm">
                      Back to website
                    </Link>
                    <button
                      type="button"
                      onClick={() => void signOut()}
                      className="dash-hover flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          {demoMode && (
            <p className="mb-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-600">
              Demo mode: Firebase is not connected, so this data lives only in this browser.
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <DashThemeProvider>
      <ShellInner>{children}</ShellInner>
    </DashThemeProvider>
  );
}

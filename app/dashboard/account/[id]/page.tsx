"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { useMyOrders } from "@/components/dashboard/useMyOrders";
import { accountBadge } from "@/components/dashboard/AccountCard";
import { CredentialsBox, ObjectivesList } from "@/components/dashboard/AccountParts";
import { formatDate } from "@/components/admin/ui";
import { formatSize, formatUSD, getModel } from "@/lib/plans";
import { computeAccount, money, signedMoney } from "@/lib/objectives";

function Tile({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="dash-card p-4">
      <p className="dash-sub text-xs font-medium">{label}</p>
      <p
        className={`mt-1.5 text-lg font-bold ${
          tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-red-500" : "dash-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="dash-sub">{label}</span>
      <span className="dash-text text-right font-semibold">{value}</span>
    </div>
  );
}

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const { orders, error } = useMyOrders();

  const back = (
    <Link href="/dashboard" className="dash-sub inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
      <ArrowLeft className="h-4 w-4" /> Back to accounts
    </Link>
  );

  if (orders === null && !error) {
    return <Loader2 className="dash-primary-text mx-auto my-16 h-6 w-6 animate-spin" />;
  }

  const order = orders?.find((o) => o.id === params.id);
  if (!order) {
    return (
      <>
        {back}
        <p className="dash-card dash-sub mt-4 px-5 py-10 text-center text-sm">
          {error ?? "This account was not found."}
        </p>
      </>
    );
  }

  const model = getModel(order.modelId as never, config.models);
  const view = computeAccount(order, model);
  const badge = accountBadge(order, view.violated, view.passed);
  const ready = order.status === "paid" || order.status === "active";

  return (
    <>
      {back}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
        <span className="dash-soft dash-primary-text rounded-full px-2.5 py-0.5 text-xs font-semibold">
          {order.modelName}
        </span>
      </div>
      <h1 className="dash-text mt-2 text-xl font-bold sm:text-2xl">
        <span className="dash-sub mr-2 font-medium">#{order.id.slice(-6).toUpperCase()}</span>
        {config.brandName} {order.modelName}, {view.stats.phase} ({formatSize(order.size)})
      </h1>

      {!ready ? (
        <p className="dash-card dash-sub mt-5 px-5 py-8 text-center text-sm">
          This account is not active yet. Finish the payment on the Accounts page.
        </p>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Tile label="Balance" value={money(view.stats.balance)} />
            <Tile label="Equity" value={money(view.stats.equity)} />
            <Tile
              label="Total PnL"
              value={signedMoney(view.totalPnl)}
              tone={view.totalPnl > 0 ? "good" : view.totalPnl < 0 ? "bad" : undefined}
            />
            <Tile
              label="Floating PnL"
              value={signedMoney(view.floatingPnl)}
              tone={view.floatingPnl > 0 ? "good" : view.floatingPnl < 0 ? "bad" : undefined}
            />
            <Tile label="Today's profit" value={money(view.stats.todayProfit)} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section>
              <h2 className="dash-text mb-3 font-semibold">Trading Objectives</h2>
              <ObjectivesList view={view} />
            </section>

            <div className="space-y-6">
              <section>
                <h2 className="dash-text mb-3 font-semibold">Login Credentials</h2>
                <CredentialsBox order={order} email={user?.email} />
              </section>

              <section className="dash-card p-5">
                <h2 className="dash-text mb-1 font-semibold">Plan &amp; Phase</h2>
                <div className="dash-border divide-y [&>*]:dash-border">
                  <Row label="Plan" value={`${config.brandName} ${order.modelName}`} />
                  <Row label="Package" value={`${formatUSD(order.size)} Initial Funds`} />
                  <Row label="Phase" value={view.stats.phase} />
                  <Row label="Started at" value={formatDate(order.createdAt)} />
                  <Row label="Ended at" value="-" />
                  <Row label="Status" value={badge.label} />
                  {view.stats.updatedAt && <Row label="Stats updated" value={formatDate(view.stats.updatedAt)} />}
                </div>
              </section>

              <section className="dash-card p-5">
                <h2 className="dash-text font-semibold">Positions &amp; History</h2>
                <p className="dash-sub mt-2 text-sm">
                  Live trades and the equity history will appear here once live account data is connected.
                </p>
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, ChevronRight, KeyRound, Target } from "lucide-react";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { formatSize, getModel } from "@/lib/plans";
import { computeAccount, money, signedMoney } from "@/lib/objectives";
import PaymentPanel from "@/components/PaymentPanel";
import { useAuth } from "@/components/AuthProvider";
import Modal from "./Modal";
import { CredentialsBox, ObjectivesList, StatsList } from "./AccountParts";
import type { OrderRecord } from "@/lib/types";

type Popup = "credentials" | "stats" | "objectives" | null;

export function accountBadge(order: OrderRecord, violated: boolean, passed: boolean): { label: string; cls: string } {
  switch (order.status) {
    case "pending":
      return { label: "Awaiting payment", cls: "bg-amber-500/15 text-amber-600" };
    case "review":
      return { label: "Under review", cls: "bg-violet-500/15 text-violet-500" };
    case "declined":
      return { label: "Payment declined", cls: "bg-red-500/15 text-red-600" };
    case "cancelled":
      return { label: "Cancelled", cls: "bg-red-500/15 text-red-600" };
    case "paid":
      return { label: "Paid", cls: "bg-sky-500/15 text-sky-600" };
    default:
      if (violated) return { label: "Violated", cls: "bg-red-500/15 text-red-600" };
      if (passed) return { label: "Target reached", cls: "bg-emerald-500/15 text-emerald-600" };
      return { label: "Ongoing", cls: "bg-emerald-500/15 text-emerald-600" };
  }
}

export default function AccountCard({
  order,
  onChange,
}: {
  order: OrderRecord;
  onChange?: (patch: Partial<OrderRecord>) => void;
}) {
  const { config } = useSiteConfig();
  const { user } = useAuth();
  const [popup, setPopup] = useState<Popup>(null);
  const model = getModel(order.modelId as never, config.models);
  const view = computeAccount(order, model);
  const needsPayment = order.status === "pending" || order.status === "review" || order.status === "declined";
  const badge = accountBadge(order, view.violated, view.passed);
  const shortId = order.id.slice(-6).toUpperCase();
  const title = `${config.brandName} ${order.modelName}, ${view.stats.phase} (${formatSize(order.size)})`;
  const floating = view.floatingPnl;

  const btn =
    "dash-border dash-text dash-hover inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold";

  return (
    <div className="dash-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
        <span className="dash-soft dash-primary-text rounded-full px-2.5 py-0.5 text-xs font-semibold">
          {order.modelName}
        </span>
      </div>
      <h3 className="dash-text mt-3 text-base font-semibold sm:text-lg">
        <span className="dash-sub mr-1.5 font-medium">#{shortId}</span>
        {title}
      </h3>
      <div className="dash-border mt-3 border-t pt-3">
        <p className="dash-sub text-xs">
          Balance: <span className="dash-text font-semibold">{money(view.stats.balance)}</span>
          <span className="mx-2.5">·</span>
          End: <span className="dash-text font-semibold">Unlimited</span>
        </p>
      </div>

      {needsPayment ? (
        <div className="mt-3">
          <PaymentPanel
            order={order}
            variant="dash"
            onSubmitted={onChange}
            onCancelled={() => onChange?.({ status: "cancelled" })}
          />
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setPopup("credentials")} className={btn}>
              <KeyRound className="h-3.5 w-3.5" /> Credentials
            </button>
            <button type="button" onClick={() => setPopup("stats")} className={btn}>
              <BarChart3 className="h-3.5 w-3.5" /> Account Stats
            </button>
            <button type="button" onClick={() => setPopup("objectives")} className={btn}>
              <Target className="h-3.5 w-3.5" /> Objectives
            </button>
            <Link href={`/dashboard/account/${order.id}`} className={`${btn} sm:ml-auto`}>
              Detail <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div>
              <p className="dash-sub mb-1.5 text-[11px] font-medium">Today&apos;s profit</p>
              <p className="dash-soft dash-text rounded-lg px-2 py-2.5 text-center text-sm font-semibold">
                {money(view.stats.todayProfit)}
              </p>
            </div>
            <div>
              <p className="dash-sub mb-1.5 text-[11px] font-medium">Equity</p>
              <p className="dash-soft dash-text rounded-lg px-2 py-2.5 text-center text-sm font-semibold">
                {money(view.stats.equity)}
              </p>
            </div>
            <div>
              <p className="dash-sub mb-1.5 text-[11px] font-medium">Unrealized PnL</p>
              <p
                className={`rounded-lg px-2 py-2.5 text-center text-sm font-semibold ${
                  floating < 0
                    ? "bg-red-500/15 text-red-500"
                    : floating > 0
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "dash-soft dash-sub"
                }`}
              >
                {floating === 0 ? "No open trades" : signedMoney(floating)}
              </p>
            </div>
          </div>
        </>
      )}

      {popup === "credentials" && (
        <Modal title={`Credentials #${shortId}`} onClose={() => setPopup(null)}>
          <CredentialsBox order={order} email={user?.email} />
        </Modal>
      )}
      {popup === "stats" && (
        <Modal title={`Account Stats #${shortId}`} onClose={() => setPopup(null)}>
          <StatsList view={view} />
        </Modal>
      )}
      {popup === "objectives" && (
        <Modal title={`Trading Objectives #${shortId}`} onClose={() => setPopup(null)}>
          <ObjectivesList view={view} />
        </Modal>
      )}
    </div>
  );
}

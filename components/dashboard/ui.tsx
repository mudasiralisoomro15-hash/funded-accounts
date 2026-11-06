import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="dash-text text-2xl font-bold">{title}</h1>
        {subtitle && <p className="dash-sub mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="dash-soft dash-primary-text mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="dash-text mt-4 font-semibold">{title}</h3>
      <p className="dash-sub mx-auto mt-1 max-w-sm text-sm">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  paid: "bg-sky-500/15 text-sky-600",
  active: "bg-emerald-500/15 text-emerald-600",
  cancelled: "bg-red-500/15 text-red-600",
};

export function DashStatus({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] ?? STATUS_STYLES.pending
      }`}
    >
      {status}
    </span>
  );
}

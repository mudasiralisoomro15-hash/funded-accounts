import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  paid: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  active: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  cancelled: "bg-red-500/15 text-red-300 ring-red-400/30",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ${STYLES[status] ?? STYLES.pending}`}
    >
      {status}
    </span>
  );
}

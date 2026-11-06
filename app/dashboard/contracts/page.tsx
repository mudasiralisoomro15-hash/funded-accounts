import { FileText } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";

export default function ContractsPage() {
  return (
    <>
      <PageHeader title="Contracts" subtitle="Your funded trader agreements." />
      <div className="dash-card">
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          text="Your funded account agreement appears here once you pass your challenge and become a funded trader."
        />
      </div>
    </>
  );
}

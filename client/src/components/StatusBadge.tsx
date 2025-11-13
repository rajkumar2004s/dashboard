import { Badge } from "@/components/ui/badge";
import type { ContributionStatus } from "@/types/domain";

interface StatusBadgeProps {
  status: ContributionStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (value: ContributionStatus | string) => {
    switch (value) {
      case "submitted_to_manager":
        return { className: "bg-chart-1/20 text-chart-1 border-chart-1/30", label: "Pending Manager Review" };
      case "approved_by_manager":
        return { className: "bg-chart-2/20 text-chart-2 border-chart-2/30", label: "Manager Approved" };
      case "approved_by_director":
        return { className: "bg-chart-3/20 text-chart-3 border-chart-3/30", label: "Director Approved" };
      case "approved_by_ceo":
        return { className: "bg-chart-4/20 text-chart-4 border-chart-4/30", label: "CEO Approved" };
      case "overridden_by_ceo":
        return { className: "bg-chart-5/20 text-chart-5 border-chart-5/30", label: "CEO Override" };
      case "rejected_by_manager":
      case "rejected_by_director":
        return { className: "bg-destructive/20 text-destructive border-destructive/30", label: "Rejected" };
      default:
        return { className: "bg-muted text-muted-foreground border-border", label: value };
    }
  };

  const config = getStatusConfig(status);

  return <Badge className={`${config.className} border`}>{config.label}</Badge>;
}

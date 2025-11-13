import { Badge } from '@/components/ui/badge';
import type { ContributionStatus } from '@shared/schema';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'submitted_to_manager':
        return { className: 'bg-chart-1/20 text-chart-1 border-chart-1/30', label: 'Pending Review' };
      case 'approved_by_manager':
        return { className: 'bg-chart-2/20 text-chart-2 border-chart-2/30', label: 'Approved' };
      case 'approved_by_director':
        return { className: 'bg-chart-3/20 text-chart-3 border-chart-3/30', label: 'Director Approved' };
      case 'rejected_by_manager':
      case 'rejected_by_director':
        return { className: 'bg-destructive/20 text-destructive border-destructive/30', label: 'Rejected' };
      default:
        return { className: 'bg-muted text-muted-foreground border-border', label: status };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <Badge className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
}

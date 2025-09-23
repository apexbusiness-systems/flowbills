import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  status?: "pending" | "approved" | "rejected" | "processing";
  description?: string;
}

const StatusCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon, 
  status,
  description 
}: StatusCardProps) => {
  const getStatusBadgeClass = () => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "processing":
        return "status-processing";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getChangeClass = () => {
    switch (changeType) {
      case "increase":
        return "text-status-approved";
      case "decrease":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="card-enterprise">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
        {status && (
          <Badge className={`${getStatusBadgeClass()} capitalize`}>
            {status}
          </Badge>
        )}
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        {change && (
          <span className={`text-sm font-medium ${getChangeClass()}`}>
            {change}
          </span>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatusCard;
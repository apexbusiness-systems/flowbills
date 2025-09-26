import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Shield
} from "lucide-react";
import { KPIMetrics } from "@/hooks/useAnalytics";

interface KPICardsProps {
  metrics?: KPIMetrics;
  loading?: boolean;
}

const KPICards = ({ metrics, loading }: KPICardsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Total Invoices",
      value: metrics?.totalInvoices || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subtitle: `${metrics?.pendingInvoices || 0} pending`,
      trend: (metrics?.approvedInvoices || 0) > (metrics?.pendingInvoices || 0) ? "up" : "down"
    },
    {
      title: "Pending Review",
      value: metrics?.pendingInvoices || 0,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      subtitle: "Awaiting approval",
      trend: "neutral"
    },
    {
      title: "Approved",
      value: metrics?.approvedInvoices || 0,
      icon: CheckCircle,
      color: "text-status-approved",
      bgColor: "bg-status-approved/10",
      subtitle: "Successfully processed",
      trend: "up"
    },
    {
      title: "Rejected",
      value: metrics?.rejectedInvoices || 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subtitle: "Requires attention",
      trend: "down"
    },
    {
      title: "Efficiency Rate",
      value: `${metrics?.efficiencyRate || 0}%`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      subtitle: "Processing efficiency",
      trend: (metrics?.efficiencyRate || 0) >= 85 ? "up" : "down"
    },
    {
      title: "Compliance Score",
      value: `${metrics?.complianceScore || 0}%`,
      icon: Shield,
      color: "text-info",
      bgColor: "bg-info/10",
      subtitle: "Regulatory compliance",
      trend: (metrics?.complianceScore || 0) >= 90 ? "up" : "down"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUp : card.trend === "down" ? TrendingDown : null;
        
        return (
          <Card key={index} className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
                {TrendIcon && (
                  <TrendIcon 
                    className={`h-4 w-4 ${
                      card.trend === "up" ? "text-success" : "text-destructive"
                    }`} 
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;
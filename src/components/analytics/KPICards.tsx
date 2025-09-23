import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Shield
} from "lucide-react";
import { KPIMetrics } from "@/hooks/useAnalytics";
import AnimatedCounter from "@/components/ui/animated-counter";

interface KPICardsProps {
  metrics: KPIMetrics;
  loading: boolean;
}

const KPICards = ({ metrics, loading }: KPICardsProps) => {
  const kpiCards = [
    {
      title: "Total Invoices",
      value: metrics.total_invoices,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subtitle: `${metrics.pending_invoices} pending`,
      trend: metrics.processed_invoices > metrics.pending_invoices ? "up" : "down"
    },
    {
      title: "Active Exceptions", 
      value: metrics.open_exceptions,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subtitle: `${metrics.resolved_exceptions} resolved`,
      trend: metrics.resolved_exceptions > metrics.open_exceptions ? "up" : "down"
    },
    {
      title: "Exception Rate",
      value: `${metrics.exception_rate}%`,
      icon: TrendingUp,
      color: metrics.exception_rate > 15 ? "text-destructive" : "text-status-approved",
      bgColor: metrics.exception_rate > 15 ? "bg-destructive/10" : "bg-status-approved/10",
      subtitle: "of total invoices",
      trend: metrics.exception_rate > 15 ? "down" : "up"
    },
    {
      title: "Avg Processing Time",
      value: `${metrics.avg_processing_time}d`,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10", 
      subtitle: "days to resolve",
      trend: metrics.avg_processing_time < 3 ? "up" : "down"
    },
    {
      title: "Compliance Score",
      value: `${metrics.compliance_score}%`,
      icon: Shield,
      color: metrics.compliance_score >= 90 ? "text-status-approved" : 
             metrics.compliance_score >= 70 ? "text-status-processing" : "text-destructive",
      bgColor: metrics.compliance_score >= 90 ? "bg-status-approved/10" : 
               metrics.compliance_score >= 70 ? "bg-status-processing/10" : "bg-destructive/10",
      subtitle: `${metrics.overdue_compliance} overdue`,
      trend: metrics.compliance_score >= 90 ? "up" : "down"
    },
    {
      title: "Processed Today",
      value: metrics.processed_invoices,
      icon: CheckCircle,
      color: "text-status-approved",
      bgColor: "bg-status-approved/10",
      subtitle: "invoices completed", 
      trend: "up"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {typeof card.value === 'string' ? (
                      card.value
                    ) : (
                      <AnimatedCounter value={card.value} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                </div>
                <Badge 
                  variant={card.trend === "up" ? "default" : "secondary"}
                  className="gap-1"
                >
                  <TrendIcon className="h-3 w-3" />
                  {card.trend === "up" ? "Good" : "Alert"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default KPICards;
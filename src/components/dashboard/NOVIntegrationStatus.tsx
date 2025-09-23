import { 
  Database, 
  FileText, 
  Network, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const integrations = [
  {
    id: "nov-access",
    name: "NOV AccessNOV",
    type: "Portal Access",
    status: "connected",
    lastSync: "5 minutes ago",
    icon: Network,
    description: "MYNOV portal integration active"
  },
  {
    id: "oracle-ebs",
    name: "Oracle E-Business Suite",
    type: "ERP Integration",
    status: "connected",
    lastSync: "2 hours ago", 
    icon: Database,
    description: "JIB CSV import/export operational"
  },
  {
    id: "edi-x12",
    name: "EDI X12 810/820",
    type: "Electronic Data Interchange",
    status: "processing",
    lastSync: "15 minutes ago",
    icon: FileText,
    description: "Processing invoice batch INV-240315"
  },
  {
    id: "openinvoice",
    name: "OpenInvoice API",
    type: "Invoice Automation",
    status: "attention",
    lastSync: "4 hours ago",
    icon: AlertTriangle,
    description: "Connection timeout detected"
  }
];

const NOVIntegrationStatus = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-status-approved" />;
      case "processing":
        return <Clock className="h-4 w-4 text-status-processing" />;
      case "attention":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="status-approved">Online</Badge>;
      case "processing":
        return <Badge className="status-processing">Processing</Badge>;
      case "attention":
        return <Badge className="status-rejected">Attention</Badge>;
      default:
        return <Badge variant="secondary">Offline</Badge>;
    }
  };

  const connectedCount = integrations.filter(i => i.status === "connected").length;

  return (
    <div className="card-enterprise">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            NOV & System Integrations
          </h3>
          <Badge className="status-approved">
            {connectedCount}/{integrations.length} Active
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          National Oilwell Varco and enterprise system connectivity
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div 
              key={integration.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {integration.name}
                    </h4>
                    {getStatusIcon(integration.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {integration.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">
                    Last sync
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    {integration.lastSync}
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            NOV certification status: 
            <span className="font-medium text-status-approved ml-1">Active</span>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            Manage Integrations
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NOVIntegrationStatus;
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusCard from "@/components/dashboard/StatusCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickUpload from "@/components/dashboard/QuickUpload";
import WorkflowPipeline from "@/components/dashboard/WorkflowPipeline";
import ExceptionQueue from "@/components/dashboard/ExceptionQueue";
import CompliancePanel from "@/components/dashboard/CompliancePanel";
import SecurityDashboard from "@/components/dashboard/SecurityDashboard";
import SystemHealthCheck from "@/components/dashboard/SystemHealthCheck";
import PerformanceMonitor from "@/components/dashboard/PerformanceMonitor";
import NOVIntegrationStatus from "@/components/dashboard/NOVIntegrationStatus";
import ValidationRules from "@/components/dashboard/ValidationRules";
import CountryPacksManager from "@/components/einvoicing/CountryPacksManager";
import ReadinessIndicator from "@/components/einvoicing/ReadinessIndicator";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, TrendingUp, Clock, Users, Globe, Zap } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <DashboardHeader />
      
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="Total Invoices" 
          value="1,234" 
          icon={TrendingUp} 
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">
              -15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Country Packs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              2 active, 2 testing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phase 9-12: E-Invoicing & Country Packs Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              E-Invoicing Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReadinessIndicator />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Country Packs Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountryPacksManager />
          </CardContent>
        </Card>
      </div>

      {/* Operations Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <QuickUpload />
          <WorkflowPipeline />
          <RecentActivity />
        </div>
        
        <div className="space-y-6">
          <ExceptionQueue />
          <CompliancePanel />
          <SystemHealthCheck />
        </div>
      </div>

      {/* Monitoring & Security */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceMonitor />
        <SecurityDashboard />
      </div>

      {/* Integration Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NOVIntegrationStatus />
        <ValidationRules />
      </div>
    </div>
  );
};

export default Dashboard;
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusCard from "@/components/dashboard/StatusCard";
import WorkflowPipeline from "@/components/dashboard/WorkflowPipeline";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CompliancePanel from "@/components/dashboard/CompliancePanel";
import NOVIntegrationStatus from "@/components/dashboard/NOVIntegrationStatus";
import heroImage from "@/assets/hero-oilgas.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Oil and gas industrial facility"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        <div className="relative h-full flex items-center justify-center px-6">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">
              OilField Billing Platform
            </h1>
            <p className="text-xl opacity-90 mb-4">
              Enterprise-grade NOV-compatible billing automation for Canada's oil & gas industry
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>PIPEDA/PIPA Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>NOV Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="p-6">
        {/* Key Metrics */}
        <section className="mb-8" aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="text-2xl font-semibold text-foreground mb-4">
            Key Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatusCard
              title="Monthly Volume"
              value="$2.4M"
              change="+12.5% vs last month"
              changeType="increase"
              icon={DollarSign}
              description="Total invoice value processed"
            />
            <StatusCard
              title="Active Invoices"
              value="847"
              change="+23 today"
              changeType="increase"
              icon={FileText}
              status="processing"
              description="In processing pipeline"
            />
            <StatusCard
              title="Processing Rate"
              value="94.2%"
              change="+2.1% improvement"
              changeType="increase"
              icon={TrendingUp}
              status="approved"
              description="Automated processing success"
            />
            <StatusCard
              title="Exception Queue" 
              value="12"
              change="3 require attention"
              changeType="decrease"
              icon={AlertTriangle}
              status="pending"
              description="Manual review needed"
            />
          </div>
        </section>

        {/* Workflow Pipeline */}
        <section className="mb-8" aria-labelledby="workflow-heading">
          <h2 id="workflow-heading" className="text-2xl font-semibold text-foreground mb-4">
            Invoice Processing Workflow
          </h2>
          <WorkflowPipeline />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <section aria-labelledby="activity-heading">
              <h2 id="activity-heading" className="text-2xl font-semibold text-foreground mb-4">
                Recent Activity
              </h2>
              <RecentActivity />
            </section>
            
            <section aria-labelledby="compliance-heading">
              <h2 id="compliance-heading" className="text-2xl font-semibold text-foreground mb-4">
                Security & Compliance
              </h2>
              <CompliancePanel />
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <section aria-labelledby="integrations-heading">
              <h2 id="integrations-heading" className="text-2xl font-semibold text-foreground mb-4">
                System Integrations
              </h2>
              <NOVIntegrationStatus />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

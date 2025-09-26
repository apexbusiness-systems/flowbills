import { SecurityMonitoringDashboard } from '@/components/security/SecurityMonitoringDashboard';
import { Shield } from 'lucide-react';

export default function SecurityDashboard() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Security Monitoring</h1>
      </div>
      
      <SecurityMonitoringDashboard />
    </div>
  );
}
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const Analytics = () => {
  return (
    <ProtectedRoute requiredRole="viewer">
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        
        <main className="container mx-auto px-6 py-8">
          <AnalyticsDashboard />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
import { UWIRegistry as UWIRegistryComponent } from '@/components/uwi/UWIRegistry';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

const UWIRegistry = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <UWIRegistryComponent />
      </main>
    </div>
  );
};

export default UWIRegistry;

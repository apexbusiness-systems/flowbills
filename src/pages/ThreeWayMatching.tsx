import { ThreeWayMatchingInterface } from '@/components/matching/ThreeWayMatchingInterface';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

const ThreeWayMatching = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <ThreeWayMatchingInterface />
      </main>
    </div>
  );
};

export default ThreeWayMatching;

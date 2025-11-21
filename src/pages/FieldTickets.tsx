import { FieldTicketManager } from '@/components/field-tickets/FieldTicketManager';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

const FieldTickets = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <FieldTicketManager />
      </main>
    </div>
  );
};

export default FieldTickets;

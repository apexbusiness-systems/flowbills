import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  ticket_number: string;
  category: string;
  priority: string;
  status: string;
  request_id: string;
  masked_org_context: any;
  customer_id?: string;
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export function SupportTicketManager() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const queryClient = useQueryClient();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupportTicket[];
    },
  });

  const createHILCase = useMutation({
    mutationFn: async (ticketId: string) => {
      const ticket = tickets?.find(t => t.id === ticketId);
      if (!ticket) throw new Error('Ticket not found');

      // Create HIL review queue item
      const { data, error } = await supabase
        .from('review_queue')
        .insert({
          invoice_id: ticket.customer_id, // Link to customer if available
          reason: `Support intervention requested from ticket ${ticket.ticket_number}`,
          priority: ticket.priority === 'critical' ? 1 : ticket.priority === 'high' ? 2 : 3,
          flagged_fields: ticket.masked_org_context,
          support_ticket_id: ticket.id,
          sla_deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours SLA
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('HIL case created successfully');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create HIL case: ${error.message}`);
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          resolved_at: status === 'resolved' || status === 'closed' ? new Date().toISOString() : null
        })
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Ticket status updated');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading support tickets...</div>;
  }

  const openTickets = tickets?.filter(t => t.status === 'open') || [];
  const inProgressTickets = tickets?.filter(t => t.status === 'in_progress') || [];
  const resolvedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed') || [];

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>PIPEDA Notice:</strong> Calls may be recorded for quality assurance. 
          Privacy option (0) available - no recording retained.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressTickets.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openTickets.map(ticket => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {ticket.ticket_number}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    <Badge>{ticket.category}</Badge>
                  </div>
                </div>
                <CardDescription>Request ID: {ticket.request_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Created: {new Date(ticket.created_at).toLocaleString()}</p>
                  {ticket.masked_org_context && (
                    <p>Caller: {ticket.masked_org_context.caller_number_masked}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      updateTicketStatus.mutate({ ticketId: ticket.id, status: 'in_progress' });
                      setSelectedTicket(ticket);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Intervene (View Org Panel)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createHILCase.mutate(ticket.id)}
                    disabled={createHILCase.isPending}
                  >
                    Start HIL Queue Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTicketStatus.mutate({ ticketId: ticket.id, status: 'resolved' })}
                  >
                    Mark Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressTickets.map(ticket => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ticket.ticket_number}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTicketStatus.mutate({ ticketId: ticket.id, status: 'resolved' })}
                >
                  Mark Resolved
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedTickets.map(ticket => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ticket.ticket_number}</CardTitle>
                  <Badge variant="secondary">Resolved</Badge>
                </div>
                <CardDescription>
                  Resolved: {ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString() : 'N/A'}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {selectedTicket && (
        <Card>
          <CardHeader>
            <CardTitle>Read-Only Organization Panel</CardTitle>
            <CardDescription>Intervention for {selectedTicket.ticket_number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Request ID:</strong> {selectedTicket.request_id}</p>
              <p><strong>Category:</strong> {selectedTicket.category}</p>
              <p><strong>Priority:</strong> {selectedTicket.priority}</p>
              {selectedTicket.masked_org_context && (
                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(selectedTicket.masked_org_context, null, 2)}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

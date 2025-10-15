import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

interface Playbook {
  id: string;
  playbook_name: string;
  playbook_type: string;
  description: string;
  steps: Array<{ step: number; action: string; notes: string }>;
  estimated_duration_minutes: number;
  sla_hours: number;
  is_active: boolean;
}

interface PlaybookSelectorProps {
  invoiceId?: string;
  onHILCreated?: () => void;
}

export function PlaybookSelector({ invoiceId, onHILCreated }: PlaybookSelectorProps) {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [expandedSteps, setExpandedSteps] = useState(false);
  const queryClient = useQueryClient();

  const { data: playbooks, isLoading } = useQuery({
    queryKey: ['support-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_playbooks')
        .select('*')
        .eq('is_active', true)
        .order('playbook_name');
      
      if (error) throw error;
      return data.map(p => ({
        ...p,
        steps: p.steps as Array<{ step: number; action: string; notes: string }>,
      })) as Playbook[];
    },
  });

  const createHILWithPlaybook = useMutation({
    mutationFn: async (playbookId: string) => {
      const playbook = playbooks?.find(p => p.id === playbookId);
      if (!playbook) throw new Error('Playbook not found');

      // Calculate SLA deadline
      const slaDeadline = new Date(Date.now() + playbook.sla_hours * 60 * 60 * 1000);

      // Create HIL review queue item with SLA stamp
      const { data, error } = await supabase
        .from('review_queue')
        .insert({
          invoice_id: invoiceId,
          reason: `Support playbook: ${playbook.playbook_name}`,
          priority: playbook.sla_hours <= 2 ? 1 : 3,
          flagged_fields: {
            playbook_id: playbook.id,
            playbook_type: playbook.playbook_type,
            steps: playbook.steps,
            estimated_duration_minutes: playbook.estimated_duration_minutes,
          },
          sla_deadline: slaDeadline.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log security event for audit
      await supabase.from('security_events').insert({
        event_type: 'hil_case_created_from_playbook',
        severity: 'info',
        details: {
          playbook_id: playbook.id,
          playbook_name: playbook.playbook_name,
          sla_deadline: slaDeadline.toISOString(),
          review_queue_id: data.id,
        },
      });

      return data;
    },
    onSuccess: () => {
      toast.success('HIL case created with SLA stamp');
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      onHILCreated?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create HIL case: ${error.message}`);
    },
  });

  const getPlaybookIcon = (type: string) => {
    switch (type) {
      case 'identity_verification': return '🔐';
      case 'dispute_flow': return '⚖️';
      case 'duplicate_rationale': return '📋';
      case 'schema_error_coaching': return '📝';
      default: return '📖';
    }
  };

  if (isLoading) {
    return <div>Loading playbooks...</div>;
  }

  return (
    <div className="space-y-4">
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          Select a playbook to guide support interaction and auto-create an HIL case with SLA stamp.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {playbooks?.map(playbook => (
          <Card 
            key={playbook.id}
            className={selectedPlaybook?.id === playbook.id ? 'ring-2 ring-primary' : ''}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{getPlaybookIcon(playbook.playbook_type)}</span>
                    {playbook.playbook_name}
                  </CardTitle>
                  <CardDescription>{playbook.description}</CardDescription>
                </div>
                <Badge variant="outline">{playbook.steps.length} steps</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {playbook.estimated_duration_minutes} min
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  SLA: {playbook.sla_hours}h
                </div>
              </div>

              {selectedPlaybook?.id === playbook.id && expandedSteps && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium">Steps:</p>
                  {playbook.steps.map(step => (
                    <div key={step.step} className="text-sm space-y-1 bg-muted p-2 rounded">
                      <p className="font-medium">{step.step}. {step.action}</p>
                      <p className="text-muted-foreground text-xs">{step.notes}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant={selectedPlaybook?.id === playbook.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPlaybook(playbook);
                    setExpandedSteps(!expandedSteps);
                  }}
                >
                  {selectedPlaybook?.id === playbook.id ? 'Selected' : 'Select Playbook'}
                </Button>
                {selectedPlaybook?.id === playbook.id && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => createHILWithPlaybook.mutate(playbook.id)}
                    disabled={createHILWithPlaybook.isPending}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start HIL Case
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlaybook && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Active Playbook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>{selectedPlaybook.playbook_name}</strong></p>
              <p className="text-muted-foreground">
                Follow the {selectedPlaybook.steps.length} steps above. 
                Estimated time: {selectedPlaybook.estimated_duration_minutes} minutes.
                SLA: {selectedPlaybook.sla_hours} hours.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

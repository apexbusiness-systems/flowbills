import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

type ApprovalsItem = {
  id: string; 
  number: string; 
  vendor_name: string; 
  total: number; 
  currency: string;
  policyFailures: string[]; 
  fraudFlags: { kind: string; score: number }[];
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, []);

  async function loadApprovals() {
    try {
      const { data } = await supabase.functions.invoke("policy_engine", { 
        body: { list: true }
      });
      setItems(data?.items ?? []);
    } catch (error) {
      console.error('Failed to load approvals:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    const { error } = await supabase.functions.invoke("policy_engine", { 
      body: { approve: true, id } 
    });
    if (error) return alert(error.message);
    await loadApprovals();
  }

  async function toHIL(id: string) {
    await supabase.functions.invoke("fraud_detect", { 
      body: { route_hil: true, id } 
    });
    await loadApprovals();
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Clock className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending invoices</p>
      </div>

      <div className="space-y-4">
        {items.map(it => (
          <Card key={it.id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">Invoice {it.number}</h3>
                  {it.policyFailures?.length > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Policy Issues
                    </Badge>
                  )}
                  {it.fraudFlags?.length > 0 && (
                    <Badge variant="secondary">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Fraud Flags
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground mb-3">
                  Vendor: {it.vendor_name} • Amount: {it.total} {it.currency}
                </div>
                
                {it.policyFailures?.length > 0 && (
                  <div className="text-red-700 text-sm mb-2">
                    <strong>Policy blocks:</strong> {it.policyFailures.join(", ")}
                  </div>
                )}
                
                {it.fraudFlags?.length > 0 && (
                  <div className="text-amber-700 text-sm">
                    <strong>Fraud flags:</strong> {it.fraudFlags.map(f => `${f.kind}(${f.score})`).join(", ")}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  disabled={it.policyFailures?.length > 0} 
                  onClick={() => approve(it.id)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toHIL(it.id)}
                >
                  Send to HIL
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {items.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invoices pending approval</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
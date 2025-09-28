import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { EinvoiceVM } from "../../lib/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function EInvoicing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [xml, setXml] = useState<string>("");
  const [doc, setDoc] = useState<EinvoiceVM | null>(null);
  const [valid, setValid] = useState<boolean | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  async function onValidate() {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("einvoice_validate", {
      body: { xml }
    });
    setBusy(false);
    if (error) return toast({
      title: "Validation failed",
      description: error.message,
      variant: "destructive"
    });
    setValid(!!data?.passed);
    setIssues(data?.issues ?? []);
    setDoc(data?.doc ?? null);
  }

  async function onSend() {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("einvoice_send", {
      body: { docId: doc?.id }
    });
    setBusy(false);
    if (error) return toast({
      title: "Send failed",
      description: error.message,
      variant: "destructive"
    });
    toast({
      title: "Document sent",
      description: "E-Invoice queued for Peppol send"
    });
  }

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('einvoice_documents')
        .select('*')
        .eq('tenant_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const validateDocument = async (documentId: string, format: string, xmlContent: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke('einvoice_validate', {
        body: {
          document_id: documentId,
          xml_content: xmlContent,
          format,
          tenant_id: user?.id
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Validation completed",
        description: "Document validation completed"
      });
      
      await fetchDocuments();
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation failed",
        description: "Failed to validate document",
        variant: "destructive"
      });
    } finally {
      setBusy(false);
    }
  };

  const sendDocument = async (documentId: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke('einvoice_send', {
        body: {
          document_id: documentId,
          sender_participant_id: '0088:1234567890123',
          receiver_participant_id: '0088:0987654321098',
          tenant_id: user?.id
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Document sent",
        description: "E-Invoice sent via Peppol network"
      });
      
      await fetchDocuments();
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Send failed", 
        description: "Failed to send document",
        variant: "destructive"
      });
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">E-Invoicing</h1>
      <textarea 
        className="w-full min-h-48 border rounded p-3" 
        placeholder="Paste BIS/XRechnung/Factur-X XML" 
        value={xml} 
        onChange={e=>setXml(e.target.value)} 
      />
      <div className="mt-3 flex gap-2">
        <Button onClick={onValidate} disabled={!xml || busy}>Validate</Button>
        <Button onClick={onSend} disabled={!valid || !doc || busy}>Send via Peppol AP</Button>
      </div>
      {valid !== null && (
        <div className="mt-4">
          <div className={valid ? "text-green-700" : "text-red-700"}>
            {valid ? "Validation passed" : "Validation failed"}
          </div>
          {!valid && issues.length > 0 && (
            <ul className="list-disc pl-6 mt-2">{issues.map((i,idx)=><li key={idx}>{i}</li>)}</ul>
          )}
        </div>
      )}

      {/* Documents List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>E-Invoice Documents</CardTitle>
          <CardDescription>Manage your electronic invoice documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(doc.status)}
                  <div>
                    <p className="font-medium">{doc.document_id}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{doc.format.toUpperCase()}</Badge>
                      <span>•</span>
                      <span>{doc.total_amount ? `${doc.total_amount} ${doc.currency}` : 'No amount'}</span>
                      <span>•</span>
                      <span>Confidence: {doc.confidence_score}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {doc.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => validateDocument(doc.document_id, doc.format, doc.xml_content)}
                      disabled={busy}
                    >
                      {busy ? 'Validating...' : 'Validate'}
                    </Button>
                  )}
                  {doc.status === 'validated' && (
                    <Button
                      size="sm"
                      onClick={() => sendDocument(doc.document_id)}
                      disabled={busy}
                    >
                      {busy ? 'Sending...' : 'Send via AP'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No documents uploaded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
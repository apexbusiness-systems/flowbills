import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface ValidationResult {
  document_id: string;
  format: string;
  validation_passed: boolean;
  confidence_score: number;
  errors: string[];
  warnings: string[];
}

export default function EinvoicingPage() {
  const { user } = useAuth()
  const [xml, setXml] = useState<string>("")
  const [format, setFormat] = useState<'bis30' | 'xrechnung' | 'facturx' | 'pint'>('bis30')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [documentId, setDocumentId] = useState<string>("")

  async function onValidate() {
    if (!xml.trim()) {
      toast.error('Please paste XML content')
      return
    }

    setBusy(true)
    setResult(null)

    try {
      // Generate document ID
      const docId = `DOC-${Date.now()}`
      setDocumentId(docId)

      // First create document record
      const { data: doc, error: createError } = await supabase
        .from('einvoice_documents')
        .insert({
          document_id: docId,
          format: format,
          status: 'pending',
          xml_content: xml,
          tenant_id: user?.id || 'anonymous'
        })
        .select()
        .single()

      if (createError) throw createError

      // Call validation edge function
      const { data, error } = await supabase.functions.invoke("einvoice_validate", {
        body: {
          document_id: docId,
          xml_content: xml,
          format: format,
          tenant_id: user?.id || 'anonymous'
        }
      })

      if (error) throw error

      setResult(data)
      if (data.validation_passed) {
        toast.success('Validation passed! Ready to send.')
      } else {
        toast.error('Validation failed. Check errors below.')
      }
    } catch (error: any) {
      console.error('Validation failed:', error)
      toast.error(`Validation failed: ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  async function onSend() {
    if (!result?.document_id || !result.validation_passed) {
      toast.error('Document must be validated first')
      return
    }

    setBusy(true)
    try {
      const { data, error } = await supabase.functions.invoke("einvoice_send", {
        body: {
          document_id: result.document_id,
          sender_participant_id: "0192:123456789", // Should come from user config
          receiver_participant_id: "0088:987654321", // Should come from document
          tenant_id: user?.id || 'anonymous'
        }
      })

      if (error) throw error

      if (data.status === 'sent') {
        toast.success('Invoice sent successfully via Peppol!')
      } else if (data.status === 'queued') {
        toast.success('Invoice queued for sending. Will retry automatically.')
      }
    } catch (error: any) {
      console.error('Send failed:', error)
      toast.error(`Send failed: ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">E-Invoice Validation & Sending</h1>
        <p className="text-sm text-muted-foreground">
          Validate and send e-invoices via Peppol network (BIS 3.0, XRechnung, Factur-X, PINT)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
            disabled={busy}
          >
            <option value="bis30">Peppol BIS Billing 3.0</option>
            <option value="xrechnung">XRechnung (Germany)</option>
            <option value="facturx">Factur-X (France/Germany)</option>
            <option value="pint">PINT (International)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">XML Content</label>
          <textarea
            className="w-full min-h-[300px] border rounded-md p-3 font-mono text-sm"
            placeholder="Paste BIS 3.0/XRechnung/Factur-X/PINT XML content here..."
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onValidate}
            disabled={!xml.trim() || busy}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {busy && !result ? 'Validating...' : 'Validate'}
          </button>
          <button
            onClick={onSend}
            disabled={!result?.validation_passed || busy}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {busy && result ? 'Sending...' : 'Send via Peppol AP'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-5 border rounded-lg ${
            result.validation_passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">
                {result.validation_passed ? '✅' : '❌'}
              </span>
              <h3 className="font-semibold">
                {result.validation_passed ? 'Validation Passed' : 'Validation Failed'}
              </h3>
              <span className="ml-auto text-sm text-muted-foreground">
                Confidence: {result.confidence_score}%
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Document ID:</span> {result.document_id}
              </div>
              <div>
                <span className="font-medium">Format:</span> {result.format.toUpperCase()}
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-red-700">
                    {result.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">Warnings:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-amber-700">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.validation_passed && (
                <div className="mt-4 p-3 bg-white rounded border border-green-300">
                  <p className="text-green-800 font-medium">
                    ✓ Document is ready to be sent via Peppol Access Point
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
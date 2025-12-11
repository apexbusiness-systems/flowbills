-- FlowC ↔ FLOWBills Silent Compliance Integration
-- Idempotency tracking table for compliance receipts

CREATE TABLE public.flowbills_compliance_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  invoice_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  compliance_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flowbills_compliance_receipts ENABLE ROW LEVEL SECURITY;

-- Only service role can access (internal use only)
CREATE POLICY "Service role only access"
ON public.flowbills_compliance_receipts
FOR ALL
USING (false)
WITH CHECK (false);

-- Indexes for fast lookup
CREATE INDEX idx_receipts_idempotency ON public.flowbills_compliance_receipts(idempotency_key);
CREATE INDEX idx_receipts_tenant ON public.flowbills_compliance_receipts(tenant_id);
CREATE INDEX idx_receipts_invoice ON public.flowbills_compliance_receipts(invoice_id);

-- Add comment for documentation
COMMENT ON TABLE public.flowbills_compliance_receipts IS 'CONFIDENTIAL: FlowC silent compliance integration - idempotency tracking';
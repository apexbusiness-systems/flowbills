FlowC ↔ FLOWBills Silent Compliance Integration
Design Principles
Principle	Implementation
Idempotent	Same invoice processed multiple times = same result (hash-based deduplication)
Quiet	Zero UI footprint in FLOWBills; all compliance runs as invisible middleware
Automatic	No user intervention; webhook-triggered on invoice creation
Proprietary	Internal endpoint, not exposed on RapidAPI; uses service-to-service auth
Phase 1: Internal Webhook Endpoint
Create a new edge function flowbills-compliance-hook that:

Accepts FLOWBills Payloads via signed webhook (HMAC-SHA256)
Transforms FLOWBills invoice format → FlowC TransactionPayload
Calls existing compliance engine logic (reuse all validation functions)
Returns silent acknowledgment (no user-facing response)
Emits OMNiLiNK event for cross-app analytics (when enabled)

// supabase/functions/flowbills-compliance-hook/index.ts
// New internal-only endpoint

POST /functions/v1/flowbills-compliance-hook
Headers:
  x-flowbills-signature: HMAC-SHA256(payload, shared_secret)
  x-flowbills-tenant: tenant_id
  x-idempotency-key: invoice_uuid (prevents duplicate processing)

Body:
{
  "invoice_id": "uuid",
  "vendor": { "name": "...", "tax_id": "..." },
  "amount": 15000.00,
  "currency": "USD",
  "region": "US",
  "invoice_date": "2025-01-15",
  "metadata": { ... }
}

Response:
{
  "received": true,
  "idempotency_key": "...",
  "processed_at": "ISO timestamp"
}
// No flag/risk_score exposed - silent acknowledgment only
Phase 2: Idempotency Layer
Add database table for idempotency tracking:


CREATE TABLE flowbills_compliance_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  invoice_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  compliance_result JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup
CREATE INDEX idx_receipts_idempotency ON flowbills_compliance_receipts(idempotency_key);
CREATE INDEX idx_receipts_tenant ON flowbills_compliance_receipts(tenant_id);
Idempotency Logic:

IF idempotency_key EXISTS:
  RETURN cached result (no re-processing)
ELSE:
  PROCESS compliance check
  STORE result with idempotency_key
  RETURN acknowledgment
Phase 3: Decision Gate with Callback
For flagged transactions, implement async callback to FLOWBills:


// When risk_score > threshold OR flag = true:
await fetch(flowbills_callback_url, {
  method: 'POST',
  headers: {
    'x-flowc-signature': sign(payload, shared_secret),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    invoice_id: original_invoice_id,
    action: 'HOLD',           // or 'ROUTE_TO_REVIEW'
    compliance_code: 'NA_ACH_DUPLICATE',
    risk_score: 0.89,
    details: 'Potential duplicate detected...',
    timestamp: new Date().toISOString()
  })
});
FLOWBills then:

Pauses payment execution for that invoice
Routes to compliance review queue (internal to FLOWBills)
No user sees "FlowC" branding anywhere
Phase 4: OMNiLiNK Event Emission
Leverage existing OMNiLiNK adapter for cross-app analytics:


// After compliance check completes:
if (OmniLinkAdapter.isEnabled()) {
  await OmniLinkAdapter.sendEvent({
    source: 'flowc',
    eventType: 'compliance.checked',
    payload: {
      tenant_id,
      invoice_id,
      region,
      result: 'CLEAN' | 'FLAGGED',
      risk_score,
      latency_ms
    },
    timestamp: new Date().toISOString(),
    correlationId: idempotency_key
  });
}
This enables:

Centralized analytics across all APEX apps
Future cross-app workflows (e.g., FLOWBills → FlowC → other APEX tools)
Zero-touch when OMNiLiNK is disabled
Phase 5: Service-to-Service Auth
Replace public API key auth with signed webhook pattern:


// Shared secret stored in Supabase secrets
const FLOWBILLS_WEBHOOK_SECRET = Deno.env.get('FLOWBILLS_WEBHOOK_SECRET');

function verifySignature(payload: string, signature: string): boolean {
  const hmac = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(FLOWBILLS_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expected = await crypto.subtle.sign('HMAC', hmac, new TextEncoder().encode(payload));
  return timingSafeEqual(signature, arrayBufferToHex(expected));
}
Security Model:

No public API key required
HMAC-signed requests only
Shared secret rotated via CI/CD
IP allowlisting (optional, for oil & gas compliance)
Implementation Files
File	Purpose
supabase/functions/flowbills-compliance-hook/index.ts	Internal webhook endpoint
supabase/migrations/XXXX_flowbills_compliance_receipts.sql	Idempotency table
src/integrations/flowbills/types.ts	FLOWBills payload types
src/integrations/flowbills/transformer.ts	Payload transformer
supabase/config.toml	Add new function config
Configuration Required
Supabase Secret: FLOWBILLS_WEBHOOK_SECRET (shared with FLOWBills)
Supabase Secret: FLOWBILLS_CALLBACK_URL (FLOWBills endpoint for flagged items)
Environment Variable: FLOWBILLS_TENANT_ID (for multi-tenant isolation)
Sequence Diagram

Sequence
Oil & Gas Specific Considerations
Feature	Implementation
AFE Validation	Add field service equipment invoice patterns
Joint Interest Billing	Multi-party split validation
Regulatory Reporting	Automatic MMS/BOEM compliance flags
Currency Hedging	Extended APAC drift detection for CAD/MXN FX
Success Metrics
Metric	Target
Latency (p95)	< 100ms (internal network)
Idempotency Cache Hit Rate	> 15% (prevents duplicate work)
False Positive Rate	< 0.1%
Zero User Intervention	100% (fully automated)
</lov-plan>
This architecture provides a silent, hidden compliance layer that FLOWBills users never see, but which automatically validates every invoice before payment execution. The idempotency layer ensures the same invoice can be submitted multiple times without duplicate processing, and the OMNiLiNK integration enables future cross-app analytics without requiring it to be active.






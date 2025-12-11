// ============================================================
// FlowC ↔ FLOWBills Silent Compliance Hook
// CONFIDENTIAL - Internal Service-to-Service Endpoint
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-flowbills-signature, x-flowbills-tenant, x-idempotency-key',
};

interface FlowBillsVendor {
  name: string;
  tax_id?: string;
}

interface FlowBillsPayload {
  invoice_id: string;
  vendor: FlowBillsVendor;
  amount: number;
  currency: string;
  region: string;
  invoice_date: string;
  metadata?: Record<string, unknown>;
  afe_number?: string;
  uwi?: string;
}

interface ComplianceResult {
  status: 'CLEAN' | 'FLAGGED' | 'REVIEW_REQUIRED';
  risk_score: number;
  flags: string[];
  compliance_codes: string[];
  details: string;
  checked_at: string;
}

/**
 * Verify HMAC-SHA256 signature
 */
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const expectedBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expectedHex = Array.from(new Uint8Array(expectedBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Timing-safe comparison
    if (signature.length !== expectedHex.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}

/**
 * Run compliance checks on transaction
 */
function runComplianceChecks(payload: FlowBillsPayload): ComplianceResult {
  const flags: string[] = [];
  const complianceCodes: string[] = [];
  let riskScore = 0;

  // High amount check
  if (payload.amount > 25000) {
    riskScore += 0.3;
    flags.push('HIGH_VALUE_TRANSACTION');
    complianceCodes.push('OFAC_REVIEW');
  }

  if (payload.amount > 100000) {
    riskScore += 0.4;
    flags.push('VERY_HIGH_VALUE');
    complianceCodes.push('CFO_APPROVAL_REQUIRED');
  }

  // Normalize score
  const normalizedScore = Math.min(riskScore, 1);

  let status: ComplianceResult['status'] = 'CLEAN';
  if (normalizedScore > 0.7) {
    status = 'FLAGGED';
  } else if (normalizedScore > 0.4) {
    status = 'REVIEW_REQUIRED';
  }

  return {
    status,
    risk_score: normalizedScore,
    flags,
    compliance_codes: complianceCodes,
    details: flags.length > 0 
      ? `Compliance flags: ${flags.join(', ')}` 
      : 'Transaction passed all compliance checks',
    checked_at: new Date().toISOString(),
  };
}

/**
 * Send callback to FLOWBills for flagged transactions
 */
async function sendFlaggedCallback(
  invoiceId: string,
  result: ComplianceResult,
  callbackUrl: string,
  secret: string
): Promise<void> {
  const callbackPayload = {
    invoice_id: invoiceId,
    action: result.status === 'FLAGGED' ? 'HOLD' : 'ROUTE_TO_REVIEW',
    compliance_code: result.compliance_codes[0] || 'REVIEW_REQUIRED',
    risk_score: result.risk_score,
    details: result.details,
    timestamp: new Date().toISOString(),
  };

  const payloadString = JSON.stringify(callbackPayload);
  
  // Generate signature
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadString));
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  try {
    await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-flowc-signature': signature,
      },
      body: payloadString,
    });
    console.log(`[FlowC] Callback sent for invoice ${invoiceId}`);
  } catch (error) {
    console.error(`[FlowC] Failed to send callback:`, error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Extract headers
    const signature = req.headers.get('x-flowbills-signature');
    const tenantId = req.headers.get('x-flowbills-tenant');
    const idempotencyKey = req.headers.get('x-idempotency-key');

    // Validate required headers
    if (!signature || !tenantId || !idempotencyKey) {
      console.error('[FlowC] Missing required headers');
      return new Response(
        JSON.stringify({ error: 'Missing required headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();

    // Verify signature
    const webhookSecret = Deno.env.get('FLOWBILLS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[FlowC] FLOWBILLS_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifySignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('[FlowC] Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payload
    const payload: FlowBillsPayload = JSON.parse(rawBody);
    console.log(`[FlowC] Processing invoice ${payload.invoice_id} for tenant ${tenantId}`);

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check idempotency - return cached result if exists
    const { data: existingReceipt } = await supabase
      .from('flowbills_compliance_receipts')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingReceipt) {
      console.log(`[FlowC] Idempotency cache hit for ${idempotencyKey}`);
      return new Response(
        JSON.stringify({
          received: true,
          idempotency_key: idempotencyKey,
          processed_at: existingReceipt.processed_at,
          cached: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Run compliance checks
    const complianceResult = runComplianceChecks(payload);

    // Store receipt
    const { error: insertError } = await supabase
      .from('flowbills_compliance_receipts')
      .insert({
        idempotency_key: idempotencyKey,
        invoice_id: payload.invoice_id,
        tenant_id: tenantId,
        compliance_result: complianceResult,
      });

    if (insertError) {
      console.error('[FlowC] Failed to store receipt:', insertError);
    }

    // Send callback for flagged transactions
    if (complianceResult.status !== 'CLEAN') {
      const callbackUrl = Deno.env.get('FLOWBILLS_CALLBACK_URL');
      if (callbackUrl) {
        await sendFlaggedCallback(
          payload.invoice_id,
          complianceResult,
          callbackUrl,
          webhookSecret
        );
      }
    }

    const latencyMs = Date.now() - startTime;
    console.log(`[FlowC] Completed in ${latencyMs}ms - Status: ${complianceResult.status}`);

    // Silent acknowledgment (no risk details exposed)
    return new Response(
      JSON.stringify({
        received: true,
        idempotency_key: idempotencyKey,
        processed_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[FlowC] Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

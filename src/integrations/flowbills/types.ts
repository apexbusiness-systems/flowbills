// ============================================================
// FlowC ↔ FLOWBills Silent Compliance Integration Types
// CONFIDENTIAL - Internal Use Only
// ============================================================

/**
 * Vendor information from FLOWBills invoice
 */
export interface FlowBillsVendor {
  name: string;
  tax_id?: string;
  address?: string;
  country?: string;
}

/**
 * FLOWBills invoice payload received via webhook
 */
export interface FlowBillsInvoicePayload {
  invoice_id: string;
  vendor: FlowBillsVendor;
  amount: number;
  currency: string;
  region: string;
  invoice_date: string;
  due_date?: string;
  line_items?: FlowBillsLineItem[];
  metadata?: Record<string, unknown>;
  // Oil & Gas specific
  afe_number?: string;
  uwi?: string;
  field_ticket_refs?: string[];
  service_period_start?: string;
  service_period_end?: string;
}

/**
 * Line item in FLOWBills invoice
 */
export interface FlowBillsLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  service_code?: string;
  afe_allocation?: string;
}

/**
 * FlowC Transaction Payload (internal compliance format)
 */
export interface FlowCTransactionPayload {
  transaction_id: string;
  vendor_name: string;
  vendor_tax_id?: string;
  amount: number;
  currency: string;
  region: string;
  transaction_date: string;
  risk_indicators: RiskIndicator[];
  metadata: Record<string, unknown>;
}

/**
 * Risk indicator for compliance checks
 */
export interface RiskIndicator {
  type: 'DUPLICATE' | 'HIGH_AMOUNT' | 'NEW_VENDOR' | 'RUSH_PAYMENT' | 'UNUSUAL_PATTERN' | 'AFE_OVERSPEND';
  score: number;
  details: string;
}

/**
 * Compliance check result (internal)
 */
export interface ComplianceResult {
  status: 'CLEAN' | 'FLAGGED' | 'REVIEW_REQUIRED';
  risk_score: number;
  flags: string[];
  compliance_codes: string[];
  details: string;
  checked_at: string;
}

/**
 * Webhook response (silent acknowledgment)
 */
export interface ComplianceHookResponse {
  received: true;
  idempotency_key: string;
  processed_at: string;
}

/**
 * Callback payload for flagged transactions
 */
export interface FlaggedTransactionCallback {
  invoice_id: string;
  action: 'HOLD' | 'ROUTE_TO_REVIEW' | 'APPROVE_WITH_WARNING';
  compliance_code: string;
  risk_score: number;
  details: string;
  timestamp: string;
}

/**
 * Idempotency receipt stored in database
 */
export interface ComplianceReceipt {
  id: string;
  idempotency_key: string;
  invoice_id: string;
  tenant_id: string;
  compliance_result: ComplianceResult;
  processed_at: string;
  created_at: string;
}

/**
 * OMNiLiNK compliance event
 */
export interface OmniLinkComplianceEvent {
  source: 'flowc';
  eventType: 'compliance.checked';
  payload: {
    tenant_id: string;
    invoice_id: string;
    region: string;
    result: 'CLEAN' | 'FLAGGED';
    risk_score: number;
    latency_ms: number;
  };
  timestamp: string;
  correlationId: string;
}

// ============================================================
// FlowC ↔ FLOWBills Payload Transformer
// CONFIDENTIAL - Internal Use Only
// ============================================================

import type {
  FlowBillsInvoicePayload,
  FlowCTransactionPayload,
  RiskIndicator,
  ComplianceResult,
} from './types';

/**
 * Transform FLOWBills invoice payload to FlowC transaction format
 */
export function transformToFlowC(payload: FlowBillsInvoicePayload): FlowCTransactionPayload {
  const riskIndicators: RiskIndicator[] = [];

  // Detect high amount transactions
  if (payload.amount > 25000) {
    riskIndicators.push({
      type: 'HIGH_AMOUNT',
      score: calculateAmountRisk(payload.amount),
      details: `Transaction amount $${payload.amount.toLocaleString()} exceeds threshold`,
    });
  }

  // Check for rush payment indicators
  if (payload.due_date) {
    const dueDate = new Date(payload.due_date);
    const invoiceDate = new Date(payload.invoice_date);
    const daysDiff = Math.ceil((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      riskIndicators.push({
        type: 'RUSH_PAYMENT',
        score: 0.3,
        details: `Payment due in ${daysDiff} days - possible rush payment`,
      });
    }
  }

  return {
    transaction_id: payload.invoice_id,
    vendor_name: payload.vendor.name,
    vendor_tax_id: payload.vendor.tax_id,
    amount: payload.amount,
    currency: payload.currency,
    region: payload.region,
    transaction_date: payload.invoice_date,
    risk_indicators: riskIndicators,
    metadata: {
      original_payload: payload,
      afe_number: payload.afe_number,
      uwi: payload.uwi,
      field_ticket_refs: payload.field_ticket_refs,
      service_period: {
        start: payload.service_period_start,
        end: payload.service_period_end,
      },
    },
  };
}

/**
 * Calculate risk score based on transaction amount
 */
function calculateAmountRisk(amount: number): number {
  if (amount > 100000) return 0.8;
  if (amount > 50000) return 0.5;
  if (amount > 25000) return 0.3;
  return 0.1;
}

/**
 * Run compliance checks on FlowC transaction
 */
export function runComplianceChecks(transaction: FlowCTransactionPayload): ComplianceResult {
  const flags: string[] = [];
  const complianceCodes: string[] = [];
  let totalRiskScore = 0;

  // Aggregate risk scores from indicators
  for (const indicator of transaction.risk_indicators) {
    totalRiskScore += indicator.score;
    
    if (indicator.type === 'DUPLICATE') {
      flags.push('POTENTIAL_DUPLICATE');
      complianceCodes.push('NA_ACH_DUPLICATE');
    }
    
    if (indicator.type === 'HIGH_AMOUNT') {
      flags.push('HIGH_VALUE_TRANSACTION');
      complianceCodes.push('OFAC_REVIEW');
    }
    
    if (indicator.type === 'AFE_OVERSPEND') {
      flags.push('BUDGET_EXCEEDED');
      complianceCodes.push('AFE_VALIDATION_FAIL');
    }
  }

  // Normalize risk score to 0-1 range
  const normalizedScore = Math.min(totalRiskScore, 1);

  // Determine status based on risk score
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
    details: generateComplianceDetails(transaction, flags),
    checked_at: new Date().toISOString(),
  };
}

/**
 * Generate human-readable compliance details
 */
function generateComplianceDetails(
  transaction: FlowCTransactionPayload, 
  flags: string[]
): string {
  if (flags.length === 0) {
    return 'Transaction passed all compliance checks';
  }

  const details: string[] = [];
  
  for (const flag of flags) {
    switch (flag) {
      case 'POTENTIAL_DUPLICATE':
        details.push('Potential duplicate transaction detected');
        break;
      case 'HIGH_VALUE_TRANSACTION':
        details.push(`High value transaction: $${transaction.amount.toLocaleString()}`);
        break;
      case 'BUDGET_EXCEEDED':
        details.push('AFE budget threshold exceeded');
        break;
      default:
        details.push(flag);
    }
  }

  return details.join('; ');
}

/**
 * Check for duplicate invoices (hash-based)
 */
export function generateDuplicateHash(payload: FlowBillsInvoicePayload): string {
  const hashInput = [
    payload.vendor.name,
    payload.invoice_id,
    payload.invoice_date,
    payload.amount.toString(),
  ].join('|');
  
  // Simple hash for deduplication
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

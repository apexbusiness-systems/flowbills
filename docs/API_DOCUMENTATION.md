# FLOWBills.ca API Documentation

## Edge Functions Reference

This document provides comprehensive documentation for all Supabase Edge Functions in the FLOWBills.ca platform.

---

## Authentication

All authenticated endpoints require a valid Supabase JWT token in the Authorization header:

```bash
Authorization: Bearer <JWT_TOKEN>
```

Public endpoints (marked with `verify_jwt = false` in config.toml) do not require authentication.

---

## Health & Monitoring Functions

### `health-check`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/health-check`  
**Method**: `GET`  
**Authentication**: Not required  
**Purpose**: System health monitoring

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-09-30T12:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

**Usage**:
```bash
curl https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/health-check
```

---

### `metrics`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/metrics`  
**Method**: `GET`  
**Authentication**: Not required  
**Purpose**: Prometheus metrics export for monitoring

**Response**: Prometheus text format
```
# HELP invoice_autoapproved_total Total invoices auto-approved
# TYPE invoice_autoapproved_total counter
invoice_autoapproved_total 1234

# HELP invoice_dup_detected_total Total duplicate invoices detected
# TYPE invoice_dup_detected_total counter
invoice_dup_detected_total 56
```

---

## Invoice Processing Functions

### `duplicate-check`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/duplicate-check`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Detect duplicate invoices before approval

**Request**:
```json
{
  "invoiceId": "uuid-here",
  "vendorId": "uuid-here",
  "amount": 1234.56,
  "invoiceDate": "2025-09-30",
  "poNumber": "PO-12345"
}
```

**Response**:
```json
{
  "isDuplicate": false,
  "confidence": 0.95,
  "matchedInvoices": [],
  "reasons": []
}
```

**Duplicate Detection Logic**:
- Hash-based exact match (vendor + date + amount + PO)
- Fuzzy matching for near-duplicates
- Flags invoices within 24 hours with ±2% amount variance

---

### `hil-router`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/hil-router`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Route low-confidence invoices to human review queue

**Request**:
```json
{
  "invoiceId": "uuid-here",
  "confidenceScore": 65,
  "extractedData": {
    "amount": 1234.56,
    "vendor": "Acme Corp",
    "date": "2025-09-30"
  },
  "flaggedFields": ["amount", "po_number"]
}
```

**Response**:
```json
{
  "action": "review",
  "reviewQueueId": "uuid-here",
  "priority": 2,
  "reason": "Low confidence on critical fields"
}
```

**Routing Logic**:
- Confidence ≥80: Auto-approve
- Confidence 60-79: Route to review queue
- Confidence <60: Reject with error

---

### `fraud-detect`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/fraud-detect`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Detect fraudulent invoice patterns

**Request**:
```json
{
  "invoiceId": "uuid-here",
  "vendorId": "uuid-here",
  "amount": 9999.99,
  "patterns": {
    "unusualAmount": true,
    "newVendor": true,
    "weekendSubmission": false
  }
}
```

**Response**:
```json
{
  "isFraudulent": false,
  "riskScore": 45,
  "flags": [
    {
      "type": "unusual_amount",
      "severity": "medium",
      "description": "Amount significantly higher than vendor average"
    }
  ],
  "action": "review"
}
```

**Fraud Patterns Checked**:
- Unusual amounts (>3σ from vendor average)
- New vendors with high-value invoices
- Duplicate bank accounts across vendors
- Suspicious timing (weekends, holidays)
- Bank account changes

---

### `ocr-extract`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/ocr-extract`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Extract structured data from invoice images/PDFs

**Request**:
```json
{
  "fileUrl": "https://...",
  "fileType": "application/pdf"
}
```

**Response**:
```json
{
  "success": true,
  "extractedData": {
    "invoiceNumber": "INV-12345",
    "vendor": "Acme Corp",
    "amount": 1234.56,
    "date": "2025-09-30",
    "dueDate": "2025-10-30",
    "poNumber": "PO-67890",
    "lineItems": [
      {
        "description": "Widget A",
        "quantity": 10,
        "unitPrice": 100.00,
        "total": 1000.00
      }
    ]
  },
  "confidence": {
    "overall": 92,
    "fields": {
      "invoiceNumber": 98,
      "amount": 95,
      "date": 90
    }
  },
  "rawText": "..."
}
```

---

## E-Invoicing Functions

### `einvoice_validate`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/einvoice_validate`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Validate e-invoices against EN 16931 and country-specific rules

**Request**:
```json
{
  "documentId": "uuid-here",
  "format": "peppol_bis3",
  "countryCode": "CA",
  "xmlContent": "<Invoice>...</Invoice>"
}
```

**Response**:
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "code": "BT-19",
      "message": "BuyerReference is recommended but not mandatory",
      "severity": "warning"
    }
  ],
  "validatedRules": ["EN16931", "PEPPOL-BIS3", "CA-SPECIFIC"]
}
```

---

### `einvoice_send`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/einvoice_send`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Send e-invoices via Peppol network

**Request**:
```json
{
  "documentId": "uuid-here",
  "receiverParticipantId": "9908:987654321",
  "documentTypeId": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  "processId": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_abc123",
  "status": "queued",
  "estimatedDelivery": "2025-09-30T12:05:00Z"
}
```

---

### `einvoice_receive`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/einvoice_receive`  
**Method**: `POST`  
**Authentication**: Required (webhook from Access Point)  
**Purpose**: Receive incoming e-invoices from Peppol

**Request** (from Access Point):
```json
{
  "messageId": "msg_xyz789",
  "senderParticipantId": "9908:123456789",
  "documentTypeId": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
  "xmlContent": "<Invoice>...</Invoice>"
}
```

**Response**:
```json
{
  "received": true,
  "documentId": "uuid-here",
  "status": "processing"
}
```

---

## Policy & AI Functions

### `policy-engine`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/policy-engine`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Execute approval policies based on business rules

**Request**:
```json
{
  "invoiceId": "uuid-here",
  "amount": 5000.00,
  "vendor": "Acme Corp",
  "category": "office_supplies"
}
```

**Response**:
```json
{
  "approved": false,
  "reason": "Amount exceeds single-approver limit",
  "requiredApprovals": 2,
  "nextApprovers": ["manager@company.com", "director@company.com"],
  "policyId": "uuid-here",
  "policyName": "High-Value Approval Policy"
}
```

**Policy Logic**:
- Amount-based thresholds
- Vendor risk scoring
- Multi-level approval routing
- Exception handling

---

### `ai-assistant`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/ai-assistant`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: AI-powered assistance for invoice processing

**Request**:
```json
{
  "query": "Analyze this invoice for potential issues",
  "invoiceId": "uuid-here",
  "context": {
    "vendor": "Acme Corp",
    "amount": 1234.56
  }
}
```

**Response**:
```json
{
  "answer": "The invoice appears normal. Amount is within expected range for this vendor. No red flags detected.",
  "confidence": 0.89,
  "suggestions": [
    "Verify PO number matches purchase order",
    "Confirm delivery receipt was signed"
  ]
}
```

---

### `oil-gas-assistant`

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/oil-gas-assistant`  
**Method**: `POST`  
**Authentication**: Required  
**Purpose**: Industry-specific AI assistance for oil & gas sector

**Request**:
```json
{
  "query": "What are typical AFE charges for drilling operations?",
  "context": {
    "project": "Well Site Alpha",
    "afe": "AFE-2025-001"
  }
}
```

**Response**:
```json
{
  "answer": "Typical AFE charges for drilling include rig rental, fuel, drilling mud, casing, cementing services, and directional drilling. Expected range: $50K-$200K/day.",
  "references": ["AFE Best Practices Guide", "Industry Standards 2024"],
  "confidence": 0.92
}
```

---

## Country-Specific Adapters

### Spain: VerificaTu (`es-verifactu`)

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/adapters/es-verifactu`  
**Method**: `POST`  
**Authentication**: Public (verify_jwt = false)  
**Purpose**: Validate invoices for Spanish tax authority (AEAT)

**Request**:
```json
{
  "invoiceData": {
    "serie": "A",
    "numero": "12345",
    "fecha": "2025-09-30",
    "emisor": { "nif": "B12345678", "nombre": "Acme SL" },
    "receptor": { "nif": "B87654321", "nombre": "Client SA" },
    "importe": 1234.56
  }
}
```

**Response**:
```json
{
  "valid": true,
  "qrCode": "data:image/png;base64,...",
  "hash": "abc123def456",
  "errors": []
}
```

---

### Poland: KSeF (`pl-ksef`)

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/adapters/pl-ksef`  
**Method**: `POST`  
**Authentication**: Public (verify_jwt = false)  
**Purpose**: Submit invoices to Polish National e-Invoice System

**Request**:
```json
{
  "invoiceXml": "<Faktura>...</Faktura>",
  "issuerNip": "1234567890",
  "recipientNip": "0987654321"
}
```

**Response**:
```json
{
  "success": true,
  "ksefId": "KSeF-2025-09-30-12345",
  "referenceNumber": "REF123456789",
  "timestamp": "2025-09-30T12:00:00Z"
}
```

---

### PINT (`pint`)

**Endpoint**: `https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/adapters/pint`  
**Method**: `POST`  
**Authentication**: Public (verify_jwt = false)  
**Purpose**: Validate invoices against PINT (Peppol International) model

**Request**:
```json
{
  "xmlInvoice": "<Invoice>...</Invoice>",
  "syntax": "UBL",
  "countryCode": "SG"
}
```

**Response**:
```json
{
  "valid": true,
  "profileCompliant": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
  "errors": [],
  "warnings": []
}
```

---

## Error Handling

All functions follow a consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field with error",
    "value": "problematic value"
  },
  "timestamp": "2025-09-30T12:00:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_DETECTED` | 409 | Duplicate invoice detected |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limiting

All endpoints are subject to rate limiting:
- **Authenticated**: 100 requests/minute per user
- **Public**: 20 requests/minute per IP

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696089600
```

---

## Monitoring & Logs

### Viewing Edge Function Logs

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/yvyjzlbosmtesldczhnm/functions
2. Click on function name
3. Navigate to "Logs" tab

### Key Metrics to Monitor

- **Invocation rate**: Requests/second
- **Error rate**: Failed requests/total
- **Latency**: P50, P95, P99 response times
- **Cold start time**: Initial function startup time

---

## Testing

### cURL Examples

**Health Check**:
```bash
curl https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/health-check
```

**Duplicate Check** (requires auth):
```bash
curl -X POST \
  https://yvyjzlbosmtesldczhnm.supabase.co/functions/v1/duplicate-check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "uuid-here",
    "vendorId": "uuid-here",
    "amount": 1234.56,
    "invoiceDate": "2025-09-30"
  }'
```

---

## SDK Usage

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yvyjzlbosmtesldczhnm.supabase.co',
  'YOUR_ANON_KEY'
);

// Call duplicate-check function
const { data, error } = await supabase.functions.invoke('duplicate-check', {
  body: {
    invoiceId: 'uuid-here',
    vendorId: 'uuid-here',
    amount: 1234.56,
    invoiceDate: '2025-09-30'
  }
});

if (error) {
  console.error('Function error:', error);
} else {
  console.log('Result:', data);
}
```

---

## Security Best Practices

1. **Never expose service role keys** in client code
2. **Use RLS policies** to restrict data access at the database level
3. **Validate all inputs** both client and server-side
4. **Log security events** to `security_events` table
5. **Rotate secrets regularly** via Supabase dashboard
6. **Monitor for anomalies** in audit logs

---

## Support

For API issues or questions:
- **Email**: api-support@flowbills.ca
- **Documentation**: https://flowbills.ca/docs
- **Status Page**: https://status.flowbills.ca

---

**Last Updated**: September 30, 2025  
**API Version**: 1.0.0

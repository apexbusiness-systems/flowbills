# P11 — Support Playbooks & QA Pack

**Goal**: Equip support team with scripts, escalation paths, and quality scorecards.

---

## 1. Common Support Scenarios

### 1.1 Invoice Upload Issues

**Symptoms**: User reports "upload failed" or "stuck processing"

**Diagnostic Steps**:
1. Check `invoices` table for recent attempts by user
2. Review `security_events` for upload errors
3. Check OCR logs in edge function logs
4. Verify file format and size (max 10MB, PDF/PNG/JPG)

**Resolution**:
```sql
-- Check recent uploads
SELECT id, status, created_at, confidence_score, file_url
FROM invoices
WHERE user_id = '[USER_UUID]'
ORDER BY created_at DESC
LIMIT 10;

-- Check for security blocks
SELECT event_type, severity, details
FROM security_events
WHERE user_id = '[USER_UUID]'
AND event_type LIKE '%upload%'
ORDER BY created_at DESC
LIMIT 5;
```

**Script**: "I see your upload from [TIME]. It appears [ISSUE]. Let me [RESOLUTION]. This should take [TIMEFRAME]."

**Escalation**: If OCR confidence < 60% consistently → Engineering (LLM tuning)

---

### 1.2 Duplicate Detection False Positive

**Symptoms**: User says "invoice rejected as duplicate but it's new"

**Diagnostic Steps**:
1. Query `duplicate_hash` on rejected invoice
2. Find matching invoices by hash
3. Compare vendor, amount, date, PO number
4. Check `fraud_flags` table

**Resolution**:
```sql
-- Find potential duplicates
SELECT id, invoice_number, vendor_id, amount, invoice_date, duplicate_hash
FROM invoices
WHERE duplicate_hash = '[HASH]'
ORDER BY created_at;

-- Check fraud flags
SELECT flag_type, risk_score, details, status
FROM fraud_flags
WHERE entity_id = '[INVOICE_ID]';
```

**Script**: "This invoice was flagged because [REASON]. I've reviewed it and [RESOLUTION]. You can now proceed with approval."

**Escalation**: If pattern of false positives from same vendor → Engineering (deduplication tuning)

---

### 1.3 Pricing & Billing Questions

**Symptoms**: "How much will I be charged?" or "Why is my bill $X?"

**Diagnostic Steps**:
1. Check `billing_subscriptions` for current plan
2. Query `billing_usage` for current period invoice count
3. Calculate expected bill using pricing model

**Resolution**:
```sql
-- Check subscription
SELECT plan_id, status, current_period_start, current_period_end
FROM billing_subscriptions
WHERE customer_id = (
  SELECT id FROM billing_customers WHERE user_id = '[USER_UUID]'
);

-- Check usage
SELECT metric, quantity, period_start, period_end
FROM billing_usage
WHERE customer_id = (
  SELECT id FROM billing_customers WHERE user_id = '[USER_UUID]'
)
AND period_end >= CURRENT_DATE
ORDER BY period_start DESC;
```

**Script**: "You're on the [PLAN] plan at $[BASE]/mo, which includes [INCLUDED] invoices. You've processed [COUNT] invoices this month, resulting in [OVERAGE] overage charges at $[RATE]/invoice. Your total is $[TOTAL]."

**Escalation**: Billing disputes > $500 → Finance approval required

---

### 1.4 E-Invoicing Validation Failures

**Symptoms**: "My Peppol/EN16931 invoice won't send"

**Diagnostic Steps**:
1. Check `einvoice_documents` for validation errors
2. Review `country_validations` for specific rule failures
3. Test against golden fixtures

**Resolution**:
```sql
-- Check document validation
SELECT document_id, status, validation_results, country_code
FROM einvoice_documents
WHERE id = '[DOC_ID]';

-- Check country-specific rules
SELECT rule_type, validation_passed, error_messages, warnings
FROM country_validations
WHERE document_id = '[DOC_ID]';
```

**Script**: "Your invoice failed validation for [COUNTRY] because [ERRORS]. To fix: [STEPS]. Refer to [COUNTRY] documentation at [LINK]."

**Escalation**: New country pack issues → E-Invoicing team (EN16931 spec review)

---

### 1.5 Security Event Investigation

**Symptoms**: "Account locked" or "suspicious activity detected"

**Diagnostic Steps**:
1. Check `security_events` for high/critical severity
2. Review `user_sessions` for anomalies
3. Check `audit_logs` for unauthorized actions

**Resolution**:
```sql
-- Check security events
SELECT event_type, severity, details, created_at
FROM security_events
WHERE user_id = '[USER_UUID]'
AND severity IN ('high', 'critical')
ORDER BY created_at DESC
LIMIT 20;

-- Check sessions
SELECT id, ip_address, user_agent, last_activity, is_active
FROM user_sessions
WHERE user_id = '[USER_UUID]'
ORDER BY created_at DESC;
```

**Script**: "We detected [EVENT] from [IP/LOCATION] at [TIME]. As a precaution, we [ACTION]. To restore access: [STEPS]."

**Escalation**: Confirmed breach or data exposure → Security team (incident response protocol)

---

## 2. Escalation Matrix

| Issue Type | Severity | First Response | Escalate To | SLA |
|------------|----------|----------------|-------------|-----|
| Login/Auth | High | Support L1 | Engineering | 2h |
| Billing Dispute | Medium | Support L1 | Finance | 24h |
| Data Loss/Corruption | Critical | Support L1 | Engineering + DBA | 1h |
| Performance Degradation | High | Support L1 | SRE | 4h |
| False Positive Fraud | Low | Support L2 | ML Team | 48h |
| Security Incident | Critical | Support L1 | Security + Legal | 30min |

---

## 3. QA Scorecard (10-Point Scale)

### Call Quality Metrics

**Greeting & Identification** (1 pt)
- [ ] Agent identified themselves and FLOWBills
- [ ] Professional tone

**Active Listening** (2 pts)
- [ ] Agent repeated issue back to confirm understanding
- [ ] Asked clarifying questions

**Diagnostic Process** (3 pts)
- [ ] Used playbook to guide troubleshooting
- [ ] Queried database/logs for evidence
- [ ] Explained findings to customer

**Resolution** (3 pts)
- [ ] Provided clear action steps
- [ ] Set expectations on timeline
- [ ] Followed up as promised

**Documentation** (1 pt)
- [ ] Updated CRM with call notes
- [ ] Tagged issue type and resolution

### Scoring
- **9-10**: Excellent (no coaching needed)
- **7-8**: Good (minor coaching)
- **5-6**: Needs Improvement (retraining required)
- **<5**: Unacceptable (escalate to manager)

---

## 4. Support Tools Checklist

- [ ] Access to Supabase dashboard (read-only)
- [ ] Aircall admin panel
- [ ] CRM (HubSpot/Salesforce) access
- [ ] Stripe dashboard (support role)
- [ ] Slack #support-team channel
- [ ] PagerDuty for critical escalations
- [ ] Screen sharing tool (Zoom/Meet)
- [ ] Knowledge base (Notion/Confluence)

---

## 5. Daily Support Rituals

**Morning Standup** (9:00 AM MT)
- Review overnight tickets
- Check SLO burn rate alerts
- Assign urgent cases

**Midday Sync** (1:00 PM MT)
- Escalation status updates
- Blockers discussion

**End-of-Day Wrap** (5:00 PM MT)
- Close resolved tickets
- Hand off open cases to next shift
- Update playbooks with new learnings

---

## 6. Support Metrics Dashboard

Track weekly:
- **CSAT Score**: Target ≥ 4.5/5
- **First Response Time**: Target < 15min (business hours)
- **Resolution Time**: Target < 4h (P1), < 24h (P2)
- **Escalation Rate**: Target < 10%
- **Reopened Tickets**: Target < 5%

---

## 7. Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Engineering Lead | [TBD] | eng@flowbills.ca | 24/7 (PagerDuty) |
| Security Officer | [TBD] | security@flowbills.ca | 24/7 (Critical) |
| Finance Manager | [TBD] | finance@flowbills.ca | M-F 9-5 MT |
| Legal Counsel | [TBD] | legal@flowbills.ca | On-call |

---

**Last Updated**: 2025-10-14  
**Owner**: Support Operations  
**Review Cadence**: Monthly

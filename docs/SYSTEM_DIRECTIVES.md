# P0 — Global System Directives

**Version**: 1.0.0  
**Effective**: 2025-10-14  
**Timezone**: America/Edmonton

---

## Non-Negotiable Guardrails

All features developed for FLOWBills.ca must adhere to the following production-grade requirements.

### 1. Idempotency & Reliability

**Requirement**: All mutations must be idempotent and safe to retry.

- ✅ Use `Idempotency-Key` headers for all mutating Edge Functions
- ✅ Database operations must use `INSERT ... ON CONFLICT` or `UPSERT` patterns
- ✅ External API calls must track state to prevent duplicate actions
- ✅ **Refuse designs that are not idempotent**

**Implementation**:
- Idempotency keys stored in `idempotency_keys` table with TTL
- Lock with PostgreSQL advisory locks during processing
- Return `409 Conflict` on body hash mismatch
- Return `425 Too Early` when processing in progress

---

### 2. Timezone Standards

**Requirement**: All timestamps and date operations use America/Edmonton timezone.

- ✅ Use absolute ISO 8601 dates in API responses
- ✅ Database stores UTC; conversions happen at application layer
- ✅ Cron schedules specified in America/Edmonton (account for DST)
- ✅ Reports and exports always labeled with timezone

**Examples**:
```typescript
// Correct
const edmontonTime = toZonedTime(new Date(), 'America/Edmonton');
const formatted = format(edmontonTime, 'yyyy-MM-dd HH:mm:ss zzz', { 
  timeZone: 'America/Edmonton' 
});

// Wrong
const localTime = new Date().toLocaleString(); // Ambiguous timezone
```

---

### 3. Security First

**Requirement**: Security controls are mandatory, not optional.

#### Row-Level Security (RLS)
- ✅ All tables with PII or tenant data have RLS enabled
- ✅ Policies validated before production deployment
- ✅ Service role keys never exposed to client

#### CSRF Protection
- ✅ SameSite=Strict on session cookies
- ✅ CSRF tokens for state-changing operations
- ✅ Origin validation on webhooks

#### Rate Limiting
- ✅ Anonymous: 10 req/min per IP
- ✅ Authenticated: 100 req/min per user
- ✅ Burst allowance: 2x sustained rate
- ✅ Exponential backoff with jitter on client side

#### Content Security Policy
- ✅ `default-src 'self'`
- ✅ `script-src 'self' 'unsafe-inline'` (minimize inline)
- ✅ `connect-src 'self' https://*.supabase.co`
- ✅ `img-src 'self' data: https:`

---

### 4. Performance Budgets

**Requirement**: All features must meet or exceed these targets.

| Metric | Target | Measurement Context |
|--------|--------|---------------------|
| **API p95 Latency** | ≤ 500ms | All authenticated endpoints |
| **Initial JavaScript** | ≤ 170KB (gzipped) | Main route bundle |
| **First Contentful Paint (FCP)** | ≤ 1.2s | 3G connection, Moto G4 |
| **Time to Interactive (TTI)** | ≤ 2.5s | 3G connection, Moto G4 |
| **Largest Contentful Paint (LCP)** | ≤ 2.0s | 3G connection |
| **Cumulative Layout Shift (CLS)** | ≤ 0.1 | Desktop & mobile |

**Enforcement**:
- Lighthouse CI fails PRs exceeding budgets
- Bundle analysis blocks merges >+75KB gzip
- Performance tests run on every PR

---

### 5. Observability Standards

**Requirement**: All code must emit structured logs, traces, and metrics.

#### Structured Logging
```json
{
  "timestamp": "2025-10-14T09:15:30.123Z",
  "level": "info",
  "tenant_id": "uuid",
  "route": "/api/invoices",
  "request_id": "uuid",
  "duration_ms": 123,
  "message": "Invoice created successfully"
}
```

#### Required Labels
- `tenant`: Organization/tenant ID
- `route`: API endpoint or page route
- `request_id`: Unique request identifier
- `user_id`: Authenticated user (when applicable)

#### Metrics
- Emit Prometheus-compatible metrics
- Counter: `http_requests_total{method, route, status}`
- Histogram: `http_request_duration_seconds{route}`
- Gauge: `hil_queue_size`, `invoice_autoapproved_total`

#### Traces
- Emit OpenTelemetry spans for:
  - `app_start`
  - `auth_ready`
  - `first_data_paint`
  - `dashboard_ready`

---

### 6. Retry & Backoff Strategy

**Requirement**: No infinite loops; all retries must have limits and jitter.

#### Retry Policy
- **Maximum attempts**: 2 (initial + 1 retry)
- **Backoff**: Exponential with jitter
  - 1st retry: `250ms + random(0-50ms)`
  - 2nd retry: `1000ms + random(0-200ms)`
- **Stop conditions**:
  - 4xx errors (except 429): Do not retry
  - 5xx errors: Retry with backoff
  - Network errors: Retry with backoff

#### Implementation Example
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 2
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;
      if (isClientError(error)) throw error; // Don't retry 4xx
      
      const baseDelay = Math.pow(2, attempt) * 250;
      const jitter = Math.random() * (baseDelay * 0.2);
      await sleep(baseDelay + jitter);
    }
  }
  throw new Error('Unreachable');
}
```

---

### 7. Backward Compatibility

**Requirement**: All changes must be backward-compatible unless explicitly versioned.

- ✅ Database migrations support rollback
- ✅ API changes use versioning (`/v1/`, `/v2/`)
- ✅ Deprecated fields maintained for 90 days with warnings
- ✅ Breaking changes require major version bump + migration guide

---

### 8. Testing Requirements

**Requirement**: All features include tests before merge.

#### Required Coverage
- **Unit tests**: Core business logic (80%+ coverage)
- **Integration tests**: API endpoints, database operations
- **Edge cases**: 
  - Zero/null/empty inputs
  - Boundary conditions (e.g., exactly 1,500 invoices)
  - Heavy load (e.g., 10x overage)
  - DST transitions
  - Concurrent operations

#### Test Naming Convention
```typescript
describe('withIdempotency', () => {
  it('should return stored response on duplicate request', async () => {
    // Test implementation
  });
  
  it('should return 409 on body hash mismatch', async () => {
    // Test implementation
  });
});
```

---

### 9. Delivery Standards

**Requirement**: All PRs include complete documentation.

Each PR must include:
1. **Code diffs**: Clean, focused changes
2. **Migration scripts**: SQL with rollback plan
3. **Changelog entry**: User-facing changes
4. **Tests**: Unit + integration coverage
5. **Performance impact**: Before/after metrics
6. **Security review**: RLS policies, input validation

---

### 10. Overload Protection

**Requirement**: System must gracefully handle overload.

- ✅ Circuit breakers on external API calls
- ✅ Queue depth limits (reject when queue > 10k)
- ✅ Database connection pooling (max 20 connections)
- ✅ Graceful degradation (serve cached data when possible)
- ✅ Load shedding (reject low-priority requests first)

---

## Enforcement

Violations of these directives will result in:
1. **Automatic PR rejection** (CI gates)
2. **Design review requirement** (before coding)
3. **Architecture review** (for repeated violations)

---

## References

- [ASVS 4.0 Controls](https://owasp.org/www-project-application-security-verification-standard/)
- [Google SRE Workbook - SLOs](https://sre.google/workbook/implementing-slos/)
- [Web Performance Budgets](https://web.dev/performance-budgets-101/)
- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)

---

**Last Updated**: 2025-10-14  
**Next Review**: 2025-11-14

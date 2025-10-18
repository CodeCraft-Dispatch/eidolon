---
applyTo: '**/*.ts,**/*.js,**/*.vue'
description: Security guidelines for high-throughput TypeScript applications using DDD, Event Sourcing, and CQRS
---

# Security Guidelines

## 1. Parse, Don't Validate - Security Foundation

### Secure Types Make Invalid States Impossible
- **Parse untrusted input** into secure domain types that cannot be constructed with invalid data
- **Use branded types** to prevent mixing trusted/untrusted data at compile time

```typescript
// Branded security types
type SecureEmail = string & { readonly __brand: 'SecureEmail' };
type ValidatedCommand = DomainCommand & { readonly __brand: 'ValidatedCommand' };

// Parse functions ensure security invariants
const parseSecureEmail = (input: string): Either<SecurityError, SecureEmail> =>
  EMAIL_REGEX.test(input.trim()) && input.length <= 254
    ? right(input.trim() as SecureEmail)
    : left(new SecurityError('Invalid email'));

const parseCommand = (raw: unknown): Either<SecurityError, ValidatedCommand> =>
  pipe(
    raw,
    parseObject,
    chain(validateSchema(CommandSchema)),
    chain(sanitizeInputs),
    map(cmd => cmd as ValidatedCommand)
  );
```

## 2. Functional Core Security

### Pure Security Logic
- **Keep all security operations pure** - no side effects in validation/authorization
- **Compose security functions** using functional combinators

```typescript
// Pure cryptographic operations
const hashPassword = (password: string, salt: Uint8Array): Promise<Uint8Array> =>
  crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + salt));

// Composable security policies
const validateSecureCommand = (command: unknown): Either<SecurityError[], ValidatedCommand> =>
  pipe(
    command,
    parseCommand,
    chain(checkRateLimit),
    chain(validateCapabilities),
    chain(sanitizePayload)
  );

// Event signing for integrity
const signEvent = async (event: DomainEvent, key: CryptoKey): Promise<SignedEvent> => ({
  ...event,
  signature: await crypto.subtle.sign('ECDSA', key, serialize(event)),
  hash: await computeHash(event)
});
```

## 3. Imperative Shell Security

### Isolate Security Side Effects
- **Push all I/O to application boundaries** - logging, database operations, network calls
- **Handle security errors** at the shell layer

```typescript
// Security operations in imperative shell
class SecureCommandHandler {
  async execute(rawCommand: unknown, context: SecurityContext): Promise<Either<Error, DomainEvent[]>> {
    // Pure validation first
    const validationResult = validateSecureCommand(rawCommand);
    if (isLeft(validationResult)) {
      // Side effect: audit logging
      await this.auditLogger.logFailure('VALIDATION_FAILED', context);
      return left(new SecurityError('Command validation failed'));
    }

    try {
      const events = await this.processCommand(validationResult.right);
      // Side effect: audit logging
      await this.auditLogger.logSuccess('COMMAND_EXECUTED', context);
      return right(events);
    } catch (error) {
      // Side effect: security event logging
      await this.auditLogger.logError('COMMAND_FAILED', error, context);
      return left(error);
    }
  }
}
```

## 4. Authentication & Authorization

### Capability-Based Permissions
- **Encode permissions in types** - compile-time security guarantees
- **Time-bound all capabilities** - automatic expiration

```typescript
// Capability types
interface Capability<T> {
  readonly resource: T;
  readonly action: string;
  readonly expiresAt: Date;
  readonly constraints: readonly string[];
}

// Pure authorization
const authorize = (capability: Capability<Resource>, action: string): Either<AuthError, Capability<Resource>> =>
  capability.expiresAt > new Date() && capability.action === action
    ? right(capability)
    : left(new AuthError('Insufficient permissions'));

// JWT validation pipeline
const parseJWT = (token: string): Either<AuthError, Capability[]> =>
  pipe(
    token,
    validateStructure,
    chain(verifySignature),
    chain(parseClaims),
    chain(validateExpiry),
    map(claims => claims.capabilities)
  );
```

## 5. Input Sanitization

### Content Security Parsing
- **Allowlist approach** - only permit known-safe content
- **Parse then sanitize** - structured validation before cleaning

```typescript
// Safe content using structured data
type SafeContent = 
  | { readonly type: 'text'; readonly value: string }
  | { readonly type: 'formatted'; readonly elements: readonly SafeElement[] };

const parseSecureContent = (input: string): Either<SecurityError, SafeContent> =>
  pipe(
    input,
    validateLength(1000),
    chain(parseStructuredContent),
    orElse(() => right({ type: 'text', value: escapeText(input) }))
  );

// URL validation with security checks
const parseSecureURL = (input: string): Either<SecurityError, SecureURL> =>
  pipe(
    input.trim(),
    parseURL,
    chain(validateProtocol(['https:', 'http:'])),
    chain(preventSSRF),
    map(url => url.href as SecureURL)
  );
```

## 6. Rate Limiting

### Functional Rate Limiting
- **Pure rate limit calculations** - testable and predictable
- **Sliding window implementation** - accurate request tracking

```typescript
// Pure rate limiting logic
interface RateWindow {
  readonly requests: readonly number[];
  readonly windowMs: number;
  readonly maxRequests: number;
}

const checkRateLimit = (window: RateWindow, now: number): Either<RateLimitError, RateWindow> => {
  const validRequests = window.requests.filter(time => time > now - window.windowMs);
  
  return validRequests.length >= window.maxRequests
    ? left(new RateLimitError('Rate limit exceeded'))
    : right({ ...window, requests: [...validRequests, now] });
};
```

## 7. Error Handling

### Secure Error Types
- **Never expose internal details** - safe error messages only
- **Use tagged unions** - exhaustive error handling
- **Include correlation IDs** - traceability without exposure

```typescript
// Security error types
type SecurityError = 
  | { type: 'AUTH_FAILED'; correlationId: string }
  | { type: 'RATE_LIMITED'; correlationId: string }
  | { type: 'VALIDATION_FAILED'; correlationId: string };

// Safe error handling
const handleSecurityError = (error: SecurityError): DomainEvent => {
  const baseEvent = { correlationId: error.correlationId, timestamp: new Date() };
  
  switch (error.type) {
    case 'AUTH_FAILED':
      return new AuthenticationFailed({ ...baseEvent, reason: 'Authentication failed' });
    case 'RATE_LIMITED':
      return new RateLimitExceeded(baseEvent);
    case 'VALIDATION_FAILED':
      return new ValidationFailed(baseEvent);
  }
};
```

## 8. Best Practices Summary

1. **Parse, Don't Validate** - Use types that make invalid states impossible
2. **Functional Core** - Keep security logic pure and composable  
3. **Imperative Shell** - Isolate side effects to application boundaries
4. **Type Safety** - Encode security invariants in the type system
5. **Capability-Based** - Fine-grained, time-bounded permissions
6. **Fail Securely** - Default to denial, never expose internals
7. **Audit Everything** - Immutable audit trail for compliance

**Foundation**: Security is a domain concern. Apply functional programming and DDD principles to create secure, composable, and testable security logic.
---
description: Security Guidelines for C#, Disruptor .NET, Eventuous, DDD, ATDD, TDD and related tooling.
---

# Security Guidelines

These guidelines are to ensure secure code and systems while addressing OWASP Top 10 vulnerabilities and .NET-specific security best practices.

## 1. General C# and .NET Security Best Practices
- Validate all user input; never trust input from external sources.
- Use parameterized queries or ORM methods to prevent SQL injection.
- Avoid dynamic code execution (e.g., `Eval`, `Reflection.Emit`) unless absolutely necessary.
- Use strong types and enums instead of strings for sensitive logic.
- Store secrets (API keys, connection strings) in secure configuration (e.g., Azure Key Vault, environment variables).
- Use `SecureString` or similar for sensitive in-memory data.
- Prefer `using` statements for disposing sensitive resources.
- Use HTTPS for all network communication.
- Keep all dependencies up to date and monitor for vulnerabilities.

## 2. Disruptor .NET Security Guidelines
- Do not pass untrusted data through the ring buffer without validation and sanitization.
- Avoid logging sensitive data in event handlers or processors.
- Ensure event handlers do not leak exceptions or sensitive information.
- Use access controls to restrict who can enqueue commands/events.
- Do not expose Disruptor internals over public APIs.

## 3. OWASP Top 10 (2021) Mitigations
- **A01:2021 - Broken Access Control**: Enforce authorization checks on all sensitive operations.
- **A02:2021 - Cryptographic Failures**: Use .NET cryptography APIs correctly; never roll your own crypto.
- **A03:2021 - Injection**: Use parameterized queries, avoid string concatenation for commands/queries.
- **A04:2021 - Insecure Design**: Apply defense-in-depth, validate at every layer, use least privilege.
- **A05:2021 - Security Misconfiguration**: Harden configuration, disable debug endpoints, use secure headers.
- **A06:2021 - Vulnerable and Outdated Components**: Regularly update dependencies, use tools like `dotnet list package --vulnerable`.
- **A07:2021 - Identification and Authentication Failures**: Use ASP.NET Core Identity or similar for authentication; never store passwords in plain text.
- **A08:2021 - Software and Data Integrity Failures**: Use strong checksums/signatures for critical data; enable code signing.
- **A09:2021 - Security Logging and Monitoring Failures**: Log security events, monitor logs, and alert on suspicious activity.
- **A10:2021 - Server-Side Request Forgery (SSRF)**: Validate and whitelist URLs for outbound requests; avoid fetching remote resources based on user input.

## 4. Secure Coding Patterns
- Use `try-catch` blocks to handle and log exceptions securely.
- Never expose stack traces or internal errors to end users.
- Sanitize all output to prevent XSS in web contexts.
- Use anti-forgery tokens in web forms (ASP.NET Core: `[ValidateAntiForgeryToken]`).
- Use `HttpOnly` and `Secure` flags for cookies.
- Avoid hardcoding credentials or secrets in code or config files.
- Use role-based access control (RBAC) for sensitive operations.

## 5. Tooling and Automation
- Use static analysis tools to catch security issues early.
- Run dependency vulnerability scans in CI/CD.
- Use secret scanning tools to detect accidental credential leaks.
- Enable code reviews for all pull requests, focusing on security-sensitive code.

## 6. Example: Secure Command Handler
```csharp
public class SecureCommandHandler : ICommandHandler<AddContactCommand>
{
    public void Handle(AddContactCommand command)
    {
        // Validate input
        // ...secure logic...
    }
}
```

## 7. References
- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [Microsoft Secure Coding Guidelines](https://learn.microsoft.com/en-us/dotnet/standard/security/secure-coding-guidelines)
- [Disruptor .NET](https://github.com/disruptor-net/Disruptor-net)
- [Eventuous Documentation](https://eventuous.dev/)
- [SonarQube Security Rules for C#](https://rules.sonarsource.com/csharp/tag/security/)

---

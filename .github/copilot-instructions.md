---
description: Eidolon AI Coding Agent Instructions
---

# Eidolon AI Coding Agent Instructions

## Overview

Eidolon is a creative solution built around Domain-Driven Design (DDD), Event Sourcing, CQRS, and high-performance asynchronous processing using concepts from Disruptor .NET and Eventuous but in TypeScript. The architecture is designed for composability, resilience, and observability.

## Key Architectural Patterns

- **Domain-Driven Design (DDD):** Organize code by domain boundaries (e.g., Contacts, Addresses). Use aggregates, domain models, domain services, and application services.
- **Event Sourcing:** Persist events as immutable records. Rebuild state by replaying events. Avoid in-place mutations.
- **CQRS:** Separate read and write models. Commands validate intent and publish events; events represent facts and trigger state changes or side effects.
- **Disruptor .NET:** Use ring buffers for async command/event dispatch. Handlers must be allocation-free and lock-free for performance.
- **Bulkhead Pattern:** Isolate command handlers into independent lanes for fault tolerance.
- **Ruthlessly Eliminate Duplication:** Code duplication is not acceptable.

## Structure

- The language of the domain drive the structure of the system.
- Each public type is in its own file; file name matches type name.

## Coding Conventions

- **Naming:** Always use the idioms of the programming language being used.
- **Immutability:** Events are immutable records. Prefer readonly fields and immutable collections.
- **Error Handling:** Catch exceptions at command boundaries, publish failure events, never suppress errors.
- **Async:** Use async/await for I/O. Queue long-running tasks off the main ring buffer.
- **Observability:** Emit structured logs for commands/events. Tag logs with correlation IDs.

## Security

- Validate all external input.
- Use parameterized queries/ORM for data access.
- Store secrets in environment variables or Azure Key Vault.
- Never log sensitive data.

## Commit Conventions

- All commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Example:  
  ```
  feat(core): add support for Disruptor event batching
  ```

## References

- [Core Instructions](./instructions/core.instructions.md)
- [Commit Instructions](./instructions/commit.instructions.md)
- [Performance Guidelines](./instructions/performance.instructions.md)
- [Security Guidelines](./instructions/security.instructions.md)
- [Coding Standards](./instructions/standards.instructions.md)

---

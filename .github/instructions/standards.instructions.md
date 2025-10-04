---
applyTo: "**/*.cs,**/*.ts,**/*.vue,**/*.js"
description: Coding standards and guidelines leveraging TypeScript, VueJS, JavaScript, Disruptor, Aggregates, Domain Models, Domain Services, Application Services, Infrastructure, Commands, Events, and State Transitions
---

# Core Coding Guidelines

These guidelines inform suggestions and auto-completions for all files.

## 1. Naming Conventions
- Always prefer the language and framework idioms and conventions.

## 2. Project Structure
- Organize solutions using solution folders according to the target Domain (e.g. "Contacts/", "Addresses/", etc.)
- Name projects according to domain + feature following CUPID properties of joyful code by Dan North (Composable, Unix-philosophy, Predictable, Idiomatic, Domain-based).
- Keep one public type per file; file name must match the type name.

## 3. Immutability & State Management
- Define events as immutable record types.
- In state transitions, apply events to produce new state objects; avoid in-place mutations.
- Use Disruptor .NET to enqueue commands and dispatch events asynchronously.
- Use **Event Sourcing** and **Domain-Driven Design** principles, practices, patterns, and libraries like Eventuous.
- Leverage abstraction to separate any library use from system code.
- Employ the **Bulkhead** pattern: isolate command handlers into independent lanes.

## 4. Command & Event Patterns
- Commands represent intent; handlers must validate and publish corresponding events.
- Events represent facts; subscribers update state or trigger side-effects.
- Always model aggregates using **Event Sourcing**: persist a log of events, reconstruct state by replay.
- Use **CQRS**: separate read models from write models.

## 5. Error Handling & Resilience
- Catch exceptions at command boundary and publish failure events.
- Implement retries with exponential backoff for transient operations.
- Never suppress errors silently: log and propagate failures through well-defined event channels.

## 6. Asynchronous Processing & Decoupling
- Prefer **async/await** for I/O operations.
- Introduce temporal decoupling: queue long-running tasks off the main Disruptor ring buffer.
- Use interfaces and dependency injection to decouple components, leverage abstraction, and facilitate testing.

## 7. Observability
- Emit structured logs for each command received and event applied.
- Record metrics on command throughput, event publication, and state rebuild times.
- Tag logs with correlation IDs to trace command→event→state workflows.

## 8. Documentation & Comments
- Add XML doc comments (`///`) to public APIs both HTTP and code.

## 9. Coding Practices
- Prefer declarative constructs over imperative;
- Prefer interfaces over abstract classes.
- Prefer dependency injection over service location.
- Prefer immutability over mutability.
- Prefer pure functions over impure functions.
- Prefer reifying concepts as types and values over using primitives.
- Prefer expressions over statements.
- Prefer higher-order functions over loops.
- Prefer recursion over iteration.
- Prefer pattern matching over conditionals.
- Prefer CUPID properties of joyful code by Dan North (Composable, Unix-philosophy, Predictable, Idiomatic, Domain-based).
- Always use hexagonal architecture and domain-driven design.
- Always use composition over inheritance.
- Always keep methods small (≤ 10 statements) and focused on a single thing; One method, one thing; one class, one thing.
- Always apply the functional core; imperative shell approach.
- Always drive the creation of the system using Behavior-Driven Design (BDD) and Acceptance Test Driven Design (ATDD) using Specification by Example.
- Always leverage specification by example using an internal DSL following Gherkin syntax without the need for external tooling.
- Always drive the creation of any code using Unit Tests through Test-Driven Design.

## 10. Code Health Metrics
- Maintain a CodeScene Health Score of 10/10.
- Always reduce code complexity (e.g., cyclomatic complexity < 7).
- Always prefer using meaningful self-documenting code constructs and names over comments.
- Avoid deep nesting and complex control flows; use early returns and guard clauses.
- Use dependency injection to manage dependencies and promote testability.
- Keep configuration separate from code (e.g., use appsettings.json, environment variables).
- Use feature flags to manage new features.
- Track code coverage and ensure it meets established thresholds.
- Ruthlessly remove dead code and duplication.
- Analyze code dependencies and reduce coupling between components.
- Continuously review and improve coding standards and best practices.
- Continuously monitor and improve code health metrics based on collected data.

---
applyTo: "**/*.cs"
description: Coding standards and guidelines leveraging C#, .NET, Disruptor, Aggregates, Domain Models, Domain Services, Application Services, Infrastructure, Commands, Events, and State Transitions
---

# Core Coding Guidelines

These guidelines inform suggestions and auto-completions for all C# files.

## 1. Naming Conventions
- Use **PascalCase** for all public types (classes, interfaces, enums) and method names.
- Use **camelCase** for local variables, private fields, and method parameters.

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
- Favor CUPID properties of joyful code by Dan North (Composable, Unix-philosophy, Predictable, Idiomatic, Domain-based).
- Keep methods small (≤ 10 statements) and focused on a single thing; One method, one thing; one class, one thing.
- Drive the creation of the system using Behavior-Driven Design (BDD) and Acceptance Test Driven Design (ATDD) using Specification by Example.
- Leverage specification by example using an internal DSL following Gherkin syntax without the need for external tooling.
- Drive the creation of any code using Unit Tests through Test-Driven Design.
- Create test projects as necessary using the `xUnit` framework.

## 10. Code Health Metrics
- Maintain a CodeScene Health Score of 10/10.
- Always reduce code complexity (e.g., cyclomatic complexity < 7).
- Use meaningful names for variables, methods, and classes to convey intent.
- Document only complex logic and decisions in code comments.
- Avoid deep nesting and complex control flows; use early returns and guard clauses.
- Prefer functional programming techniques (e.g., map, filter, reduce) over imperative constructs.
- Avoid side effects in functions; prefer pure functions.
- Use LINQ for data manipulation and querying.
- Favor immutability; use `readonly` fields and immutable constructs and collections where appropriate.
- Use dependency injection to manage dependencies and promote testability.
- Avoid static state and singletons; prefer instance-based state management.
- Keep configuration separate from code (e.g., use appsettings.json, environment variables).
- Use feature flags to manage experimental or in-progress features.
- Track code coverage and ensure it meets established thresholds.
- Ruthlessly remove dead code and duplication.
- Analyze code dependencies and reduce coupling between components.
- Continuously review and improve coding standards and best practices.
- Continuously monitor and improve code health metrics based on collected data.

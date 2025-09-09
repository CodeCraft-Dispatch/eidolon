---
description: Performance guidelines for C#, Disruptor .NET, Eventuous, Event-Sourcing, DDD, ATDD, TDD, and related tooling.
---

# Performance Guidelines

These guidelines are to ensure high performance in C# code and system design.

## 1. General C# Performance Best Practices
- Prefer value types (structs) for small, immutable data structures.
- Minimize allocations in hot paths; avoid unnecessary boxing/unboxing.
- Use `Span<T>`, `Memory<T>`, and array pooling for high-throughput scenarios.
- Avoid LINQ in performance-critical code; use explicit loops instead.
- Avoid the use of exceptions for control flow.
- Use `readonly` for fields and structs where possible.
- Prefer `foreach` over `for` only when the enumerator is a struct and does not allocate.
- Use `StringBuilder` for string concatenation in loops.
- Profile code and determine how to balance performance and maintainability while minimizing complexity and avoiding performance regressions.

## 2. Disruptor .NET Performance Guidelines
- Use the correct ring buffer size: it must be a power of two and large enough to avoid contention.
- Prefer busy-spin or yielding wait strategies for low-latency scenarios; use blocking for throughput.
- Minimize garbage generation in event handlers and command processors.
- Use pre-allocated event objects in the ring buffer; avoid allocating new objects per event.
- Avoid locks inside Disruptor event handlers.
- Use batch event processing when possible to reduce synchronization overhead.
- Pin threads to CPU cores for ultra-low latency.
- Monitor Disruptor metrics: throughput, latency, and contention.

## 3. .NET and GC Tuning
- Use Server GC for multi-core, high-throughput workloads (`<gcServer enabled="true" />` in .csproj or runtimeconfig).
- Minimize large object heap (LOH) allocations; prefer pooling for large arrays/objects.
- Use `ArrayPool<T>` or custom pools for frequently reused buffers.
- Profile and monitor GC pauses to avoid long pauses and optimize performance.

## 4. Asynchronous and Parallelism
- Use async/await for I/O-bound operations; avoid blocking threads.
- For CPU-bound work, use `Task.Run` or `Parallel.ForEach` judiciously.
- Avoid excessive parallelism; measure and tune degree of parallelism.
- Avoid `Task.Result` and `.Wait()` in async code to prevent deadlocks.

## 5. Observability and Benchmarking
- Use `BenchmarkDotNet` for micro-benchmarks of critical code paths.
- Add structured logging for performance metrics (latency, throughput, queue depth).
- Use `Stopwatch` for ad-hoc timing in code.
- Monitor production performance with Application Insights, Prometheus, or similar.

## 6. Code Review and CI
- Include performance considerations in code reviews.
- Run benchmarks or performance tests in CI for critical components.
- Document performance-sensitive code with comments and rationale.

## 7. Example: Disruptor Event Handler
```csharp
public class MyEventHandler : IEventHandler<MyEvent>
{
    // Avoid allocations and locks in this method
    public void OnEvent(MyEvent data, long sequence, bool endOfBatch)
    {
        // ...fast, allocation-free logic...
    }
}
```

## 8. References
- [Disruptor .NET Documentation](https://github.com/disruptor-net/Disruptor-net)
- [Eventuous Documentation](https://eventuous.dev/)
- [Microsoft .NET Performance Guide](https://learn.microsoft.com/en-us/dotnet/standard/performance/)
- [BenchmarkDotNet](https://benchmarkdotnet.org/)
- [PerfView](https://github.com/microsoft/perfview)

---

---
applyTo: '**/*.ts'
description: Core performance guidelines for high-throughput TypeScript applications
---

# Performance Guidelines

## 1. Memory Management

### Minimize Allocations
- **Pre-allocate buffers** and reuse them
- **Use object pools** for frequently created objects
- **Avoid temporary objects** in hot paths

```typescript
// Good: Reusable buffer
class EventProcessor {
    private readonly buffer = new Uint8Array(4096);
    
    process(data: Uint8Array): void {
        this.buffer.set(data); // Reuse existing buffer
    }
}

// Bad: New allocation every call
function process(data: Uint8Array): Uint8Array {
    return new Uint8Array([...data]); // Creates new array
}
```

### Use Typed Arrays for Binary Operations
- **Prefer `Uint8Array`, `Uint32Array`** over regular arrays
- **Use `ArrayBuffer`** for direct memory manipulation
- **Leverage bitwise operations** for fast calculations

```typescript
// Efficient binary operations
const buffer = new ArrayBuffer(1024);
const uint32View = new Uint32Array(buffer);
const uint8View = new Uint8Array(buffer);

// Fast bit operations
const setBit = (value: number, bit: number): number => value | (1 << bit);
const clearBit = (value: number, bit: number): number => value & ~(1 << bit);
const fastMultiply = (value: number): number => value << 3; // x8
```

## 2. Disruptor Pattern Optimizations

### Ring Buffer Performance
- **Size as powers of 2** for efficient modulo operations
- **Keep handlers allocation-free** and lock-free
- **Batch event processing** to reduce overhead

```typescript
const RING_SIZE = 1024; // Power of 2

class EventHandler {
    onEvent(event: DomainEvent, sequence: number, endOfBatch: boolean): void {
        this.processEvent(event); // Allocation-free processing
        
        if (endOfBatch) {
            this.flushBatch(); // Batch operations
        }
    }
}
```

### Event Batching
- **Process events in batches** to amortize overhead
- **Use fixed-size batches** to avoid array resizing

```typescript
class BatchProcessor {
    private readonly batchSize = 64;
    private readonly batch: DomainEvent[] = new Array(this.batchSize);
    private count = 0;
    
    add(event: DomainEvent): void {
        this.batch[this.count++] = event;
        if (this.count >= this.batchSize) {
            this.processBatch();
            this.count = 0; // Reset without reallocation
        }
    }
}
```

## 3. Event Sourcing Performance

### Efficient Serialization
- **Use binary formats** (MessagePack) over JSON
- **Pre-compile serializers** to avoid runtime overhead

```typescript
// Fast binary serialization
class EventSerializer {
    serialize(event: DomainEvent): Uint8Array {
        const buffer = new ArrayBuffer(256);
        const view = new DataView(buffer);
        
        view.setUint32(0, event.type);
        view.setBigUint64(4, BigInt(event.timestamp));
        // ... pack data efficiently
        
        return new Uint8Array(buffer);
    }
}
```

### Snapshot Optimization
- **Take snapshots at optimal intervals** (every 1000 events)
- **Use incremental snapshots** for large aggregates

```typescript
class AggregateStore {
    private readonly snapshotInterval = 1000;
    
    async load<T>(id: string): Promise<T> {
        const eventCount = await this.getEventCount(id);
        
        if (eventCount > this.snapshotInterval) {
            const snapshot = await this.getSnapshot<T>(id);
            const events = await this.getEventsAfter(id, snapshot.version);
            return snapshot.applyEvents(events);
        }
        
        return this.buildFromEvents<T>(await this.getAllEvents(id));
    }
}
```

## 4. CQRS Read Model Performance

### Efficient Projections
- **Use incremental updates** over full rebuilds
- **Optimize for query patterns** not normalization

```typescript
class ContactProjection {
    private readonly contacts = new Map<string, ContactView>();
    
    on(event: ContactEvent): void {
        const existing = this.contacts.get(event.id);
        
        // Direct map operations - O(1)
        this.contacts.set(event.id, {
            ...existing,
            [event.field]: event.value,
            version: event.version
        });
    }
}
```

## 5. Async Performance

### Efficient Patterns
- **Use `Promise.all()`** for parallel operations
- **Avoid async/await** in tight loops
- **Implement backpressure** for high-throughput

```typescript
// Parallel processing
async function processEvents(events: DomainEvent[]): Promise<void> {
    // Good: Parallel execution
    await Promise.all(events.map(e => this.process(e)));
    
    // Bad: Sequential execution
    // for (const event of events) {
    //     await this.process(event);
    // }
}

// Streaming with backpressure
async function* processStream(events: AsyncIterable<DomainEvent>) {
    let batch: DomainEvent[] = [];
    
    for await (const event of events) {
        batch.push(event);
        
        if (batch.length >= 100) {
            yield this.processBatch(batch);
            batch = []; // Clear for reuse
        }
    }
}
```

## 6. V8 Engine Optimizations

### Monomorphic Code
- **Avoid changing object shapes** for V8 optimization
- **Use integer math** when possible
- **Prefer for loops** in hot paths

```typescript
// Monomorphic - consistent object shape
interface ContactState {
    readonly id: string;
    readonly version: number;
    readonly name: string;
    readonly email: string;
}

function updateContact(state: ContactState, name: string): ContactState {
    // Always return same object shape
    return {
        id: state.id,
        version: (state.version + 1) | 0, // Force integer
        name,
        email: state.email
    };
}

// Hot path optimization
function sumArray(numbers: number[]): number {
    let sum = 0;
    // Faster than reduce() in hot paths
    for (let i = 0; i < numbers.length; i++) {
        sum = (sum + numbers[i]) | 0; // Keep as integer
    }
    return sum;
}
```

### Cache-Friendly Data Structures
- **Use sequential memory access** patterns
- **Structure of Arrays (SoA)** for better cache performance

```typescript
// Cache-friendly event store
class EventStore {
    private readonly types = new Uint8Array(10000);
    private readonly timestamps = new BigUint64Array(10000);
    private readonly data = new Array<Uint8Array>(10000);
    private count = 0;
    
    add(type: number, timestamp: bigint, eventData: Uint8Array): void {
        // Sequential writes - cache friendly
        this.types[this.count] = type;
        this.timestamps[this.count] = timestamp;
        this.data[this.count] = eventData;
        this.count++;
    }
}
```

## 7. Performance Monitoring

### Key Metrics
- **Track throughput** (events/commands per second)
- **Monitor memory usage** and GC frequency
- **Measure aggregate rebuild times**

```typescript
class PerformanceMonitor {
    private metrics = new Map<string, { count: number; totalTime: number }>();
    
    measure<T>(name: string, fn: () => T): T {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        const metric = this.metrics.get(name) ?? { count: 0, totalTime: 0 };
        metric.count++;
        metric.totalTime += duration;
        this.metrics.set(name, metric);
        
        return result;
    }
    
    getAverageTime(name: string): number {
        const metric = this.metrics.get(name);
        return metric ? metric.totalTime / metric.count : 0;
    }
}
```

## 8. Best Practices Summary

1. **Profile First**: Use browser dev tools to identify bottlenecks
2. **Batch Operations**: Group work to reduce per-operation overhead
3. **Reuse Memory**: Pre-allocate buffers and object pools
4. **Use Native Types**: Typed arrays for binary data operations
5. **Write Monomorphic Code**: Consistent object shapes for V8
6. **Cache Strategically**: Expensive computations with proper invalidation
7. **Monitor Continuously**: Track metrics in development and production

**Remember**: Measure before optimizing. Focus on actual bottlenecks, not theoretical performance.
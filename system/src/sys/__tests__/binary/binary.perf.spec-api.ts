import { expect } from "vitest"
import {
    type BitPosition, type ByteAddress, type Bit,
    createBitMemory, setByte, setBit, getBit, flipBit, getByte,
    type BitMemory
} from '../../binary'

export class PerformanceThreshold {
    constructor(private readonly milliseconds: number) { }

    get value(): number { return this.milliseconds }

    static standard(): PerformanceThreshold { return new PerformanceThreshold(75) }
    static large(): PerformanceThreshold { return new PerformanceThreshold(150) }
}

export class MemorySize {
    constructor(private readonly bytes: number) { }

    get value(): number { return this.bytes }
    get bits(): number { return this.bytes * 8 }

    static small(): MemorySize { return new MemorySize(64) }
    static medium(): MemorySize { return new MemorySize(256) }
    static large(): MemorySize { return new MemorySize(1024) }
    static extraLarge(): MemorySize { return new MemorySize(4096) }

    static of(bytes: number): MemorySize { return new MemorySize(bytes) }
}

export class IterationCount {
    constructor(private readonly count: number) { }

    get value(): number { return this.count }

    static standard(): IterationCount { return new IterationCount(10000) }
    static flip(): IterationCount { return new IterationCount(5000) }
    static batch(): IterationCount { return new IterationCount(1000) }
    static stress(): IterationCount { return new IterationCount(50000) }
    static scaling(): IterationCount { return new IterationCount(1000) }

    static of(count: number): IterationCount { return new IterationCount(count) }
}

export class TestConfiguration {
    constructor(
        public readonly memorySize: MemorySize,
        public readonly defaultIterations: IterationCount,
        public readonly flipIterations: IterationCount,
        public readonly batchOperations: IterationCount,
        public readonly memorySizes: readonly MemorySize[],
        public readonly formatSizes: readonly MemorySize[],
        public readonly scalingSizes: readonly MemorySize[],
        public readonly stressOperations: IterationCount
    ) { }

    static default(): TestConfiguration {
        return new TestConfiguration(
            MemorySize.large(),
            IterationCount.standard(),
            IterationCount.flip(),
            IterationCount.batch(),
            [MemorySize.small(), MemorySize.medium(), MemorySize.large(), MemorySize.extraLarge()],
            [MemorySize.of(16), MemorySize.small(), MemorySize.medium(), MemorySize.large()],
            [MemorySize.of(1), MemorySize.of(4), MemorySize.of(16), MemorySize.small(), MemorySize.medium(), MemorySize.large(), MemorySize.of(2048), MemorySize.extraLarge()],
            IterationCount.stress()
        )
    }
}

// Pattern value objects
export class BytePattern {
    constructor(private readonly value: number) { }

    get byte(): number { return this.value }

    static alternatingHigh(): BytePattern { return new BytePattern(170) } // 0b10101010
    static alternatingLow(): BytePattern { return new BytePattern(85) }   // 0b01010101
    static empty(): BytePattern { return new BytePattern(0) }
    static full(): BytePattern { return new BytePattern(255) }

    static of(value: number): BytePattern { return new BytePattern(value) }
}

// Hash calculation value object
export class HashConfiguration {
    constructor(
        private readonly multipliers: readonly number[],
        private readonly modulus: number
    ) { }

    calculateHashes(item: number): readonly number[] {
        return this.multipliers.map(mult => (item * mult) % this.modulus)
    }

    static bloomFilter(): HashConfiguration {
        return new HashConfiguration([17, 31, 47], 8192)
    }
}

export const standardThreshold = PerformanceThreshold.standard()
export const largeThreshold = PerformanceThreshold.large()
export const testConfig = TestConfiguration.default()

// Higher-order function for performance testing
export const measurePerformance = <T>(
    operation: () => T,
    threshold: PerformanceThreshold = standardThreshold
): { result: T; duration: number } => {
    const start = performance.now()
    const result = operation()
    const duration = performance.now() - start
    expect(duration).toBeLessThan(threshold.value)
    return { result, duration }
}

// Memory initialization patterns
export const initializeMemory = {
    empty: (size: MemorySize): BitMemory => createBitMemory(size.value),
    random: (size: MemorySize): BitMemory => {
        let memory = createBitMemory(size.value)
        for (let i = 0; i < size.value; i++) {
            memory = setByte(memory, i, Math.floor(Math.random() * 256))
        }
        return memory
    },
    pattern: (size: MemorySize, pattern: BytePattern): BitMemory => {
        let memory = createBitMemory(size.value)
        for (let i = 0; i < size.value; i++) {
            memory = setByte(memory, i, pattern.byte)
        }
        return memory
    },
    alternating: (size: MemorySize): BitMemory => {
        let memory = createBitMemory(size.value)
        for (let addr = 0; addr < size.value; addr++) {
            const pattern = addr % 2 === 0 ? BytePattern.alternatingHigh() : BytePattern.alternatingLow()
            memory = setByte(memory, addr, pattern.byte)
        }
        return memory
    },
    sparse: (size: MemorySize, setPosition: number = Math.floor(size.value * 0.8)): BitMemory => {
        let memory = createBitMemory(size.value)
        return setBit(memory, setPosition, 3, 1)
    }
} as const

// Operation generators for iteration patterns
export const createOperations = {
    setBitLoop: (memory: BitMemory, iterations: IterationCount, size: MemorySize) => () => {
        let testMemory = memory
        for (let i = 0; i < iterations.value; i++) {
            const address = i % size.value
            const bitPos = i % 8
            testMemory = setBit(testMemory, address, bitPos as BitPosition, 1)
        }
        return testMemory
    },

    getBitLoop: (memory: BitMemory, iterations: IterationCount, size: MemorySize) => () => {
        let totalBits = 0
        for (let i = 0; i < iterations.value; i++) {
            const address = i % size.value
            const bitPos = i % 8
            totalBits += getBit(memory, address, bitPos as BitPosition)
        }
        return totalBits
    },

    flipBitLoop: (memory: BitMemory, iterations: IterationCount, size: MemorySize) => () => {
        let testMemory = memory
        for (let i = 0; i < iterations.value; i++) {
            const address = i % size.value
            const bitPos = i % 8
            testMemory = flipBit(testMemory, address, bitPos as BitPosition)
        }
        return testMemory
    },

    byteOperationsLoop: (memory: BitMemory, iterations: IterationCount, size: MemorySize) => () => {
        let testMemory = memory
        for (let i = 0; i < iterations.value; i++) {
            const address = i % size.value
            const value = i % 256
            testMemory = setByte(testMemory, address, value)
            getByte(testMemory, address)
        }
        return testMemory
    }
} as const

// Batch operation generators
export const generateBatchOperations = {
    setBits: (count: IterationCount, memorySize: MemorySize) =>
        Array.from({ length: count.value }, (_, i) => ({
            address: (i % memorySize.value) as ByteAddress,
            bitPosition: (i % 8) as BitPosition,
            value: (i % 2) as Bit
        })),

    getBits: (count: IterationCount, memorySize: MemorySize) =>
        Array.from({ length: count.value }, (_, i) => ({
            address: (i % memorySize.value) as ByteAddress,
            bitPosition: (i % 8) as BitPosition
        }))
} as const
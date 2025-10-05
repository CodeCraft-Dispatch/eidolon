import { describe, it, expect, beforeEach } from 'vitest'
import {
  type Bit,
  type BitMemory,
  type BitPosition,
  createBitMemory,
  setBit,
  getBit,
  setByte,
  getByte,
  flipBit,
  setBits,
  getBits,
  countSetBits,
  findFirstSetBit,
  memoryToHex,
  memoryToBinary
} from '../../binary'

import {
  MemorySize,
  IterationCount,
  BytePattern,
  HashConfiguration,
  testConfig,
  initializeMemory,
  createOperations,
  generateBatchOperations,
  largeThreshold,
  measurePerformance,
  standardThreshold
} from './binary.perf.spec-api'

describe('binary performance tests', () => {
  describe('single operation performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = initializeMemory.empty(testConfig.memorySize)
    })

    // Declarative test configuration for single operations
    const singleOperationTests = [
      {
        name: 'setBit operations',
        setup: () => memory,
        operation: (mem: BitMemory) => createOperations.setBitLoop(mem, testConfig.defaultIterations, testConfig.memorySize)(),
        validate: (result: unknown) => expect(result).toBeDefined()
      },
      {
        name: 'getBit operations',
        setup: () => initializeMemory.random(testConfig.memorySize),
        operation: (mem: BitMemory) => createOperations.getBitLoop(mem, testConfig.defaultIterations, testConfig.memorySize)(),
        validate: (result: unknown) => expect(result as number).toBeGreaterThan(0)
      },
      {
        name: 'flipBit operations',
        setup: () => memory,
        operation: (mem: BitMemory) => createOperations.flipBitLoop(mem, testConfig.flipIterations, testConfig.memorySize)(),
        validate: (result: unknown) => expect(result).toBeDefined()
      },
      {
        name: 'setByte/getByte operations',
        setup: () => memory,
        operation: (mem: BitMemory) => createOperations.byteOperationsLoop(mem, testConfig.defaultIterations, testConfig.memorySize)(),
        validate: (result: unknown) => expect(result).toBeDefined()
      }
    ] as const

    singleOperationTests.forEach(({ name, setup, operation, validate }) => {
      it(`should perform ${name} quickly`, () => {
        const testMemory = setup()
        const { result } = measurePerformance(() => operation(testMemory))
        validate(result)
      })
    })
  })

  describe('batch operation performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = initializeMemory.empty(testConfig.memorySize)
    })

    const batchTests = [
      {
        name: 'setBits batch operations',
        setup: () => memory,
        operation: (mem: BitMemory) => {
          const operations = generateBatchOperations.setBits(
            testConfig.batchOperations,
            testConfig.memorySize
          )
          return setBits(mem, operations)
        },
        validate: (result: unknown) => expect(countSetBits(result as BitMemory)).toBeGreaterThan(0)
      },
      {
        name: 'getBits batch operations',
        setup: () => initializeMemory.pattern(MemorySize.of(100), BytePattern.alternatingHigh()),
        operation: (mem: BitMemory) => {
          const positions = generateBatchOperations.getBits(testConfig.batchOperations, MemorySize.of(100))
          return getBits(mem, positions)
        },
        validate: (result: unknown) => expect(result as Bit[]).toHaveLength(testConfig.batchOperations.value)
      }
    ] as const

    batchTests.forEach(({ name, setup, operation, validate }) => {
      it(`should perform ${name} quickly`, () => {
        const testMemory = setup?.() ?? memory
        const { result } = measurePerformance(() => operation(testMemory))
        validate(result)
      })
    })
  })

  describe('memory analysis performance', () => {
    const analysisTests = [
      {
        name: 'count set bits',
        memoryInit: initializeMemory.random,
        operation: countSetBits,
        validate: (result: unknown, size: MemorySize) => {
          const count = result as number
          expect(count).toBeGreaterThanOrEqual(0)
          expect(count).toBeLessThanOrEqual(size.bits)
        }
      },
      {
        name: 'find first set bit',
        memoryInit: initializeMemory.sparse,
        operation: findFirstSetBit,
        validate: (result: unknown, size: MemorySize) => {
          const expectedAddress = Math.floor(size.value * 0.8)
          expect(result).toEqual({ address: expectedAddress, bitPosition: 3 })
        }
      }
    ] as const

    testConfig.memorySizes.forEach(size => {
      describe(`${size.value} bytes memory`, () => {
        analysisTests.forEach(({ name, memoryInit, operation, validate }) => {
          it(`should ${name} quickly`, () => {
            const memory = memoryInit(size)
            const threshold = size.value > 1024 ? largeThreshold : standardThreshold
            const { result } = measurePerformance(() => operation(memory), threshold)
            validate(result, size)
          })
        })
      })
    })
  })

  describe('formatting performance', () => {
    const formatTests = [
      {
        name: 'format to hex',
        operation: memoryToHex,
        expectedLength: (size: MemorySize) => size.value * 3 - 1 // 2 chars per byte + spaces
      },
      {
        name: 'format to binary',
        operation: memoryToBinary,
        expectedLength: (size: MemorySize) => size.value * 9 - 1 // 8 chars per byte + spaces
      }
    ] as const

    testConfig.formatSizes.forEach(size => {
      describe(`${size.value} bytes memory formatting`, () => {
        let memory: BitMemory

        beforeEach(() => {
          memory = createBitMemory(size.value)
          for (let i = 0; i < size.value; i++) {
            memory = setByte(memory, i, i % 256)
          }
        })

        formatTests.forEach(({ name, operation, expectedLength }) => {
          it(`should ${name} quickly`, () => {
            const threshold = size.value > 256 ? largeThreshold : standardThreshold
            const { result } = measurePerformance(() => operation(memory), threshold)
            expect(result).toHaveLength(expectedLength(size))
          })
        })
      })
    })
  })

  describe('memory size scaling performance', () => {
    it('should maintain performance for single bit operations', () => {
      const results = testConfig.scalingSizes.map(size => {
        const memory = createBitMemory(size.value)
        const iterations = IterationCount.scaling()

        const { duration } = measurePerformance(() => {
          let testMemory = memory
          for (let i = 0; i < iterations.value; i++) {
            const address = i % size.value
            const bitPos = i % 8
            testMemory = setBit(testMemory, address, bitPos as BitPosition, 1)
            getBit(testMemory, address, bitPos as BitPosition)
          }
          return testMemory
        }, largeThreshold)

        return { size: size.value, duration }
      })

      // Verify that performance doesn't degrade significantly with size for individual operations
      const smallMemoryTime = results[0].duration
      const largeMemoryTime = results[results.length - 1].duration
      const expectedTime = smallMemoryTime * (testConfig.scalingSizes.length * 2) + 2
      expect(largeMemoryTime).toBeLessThan(expectedTime)
    })

    it('should show linear scaling for memory-wide operations', () => {
      const results = testConfig.scalingSizes.map(size => {
        const memory = initializeMemory.pattern(size, BytePattern.alternatingHigh())

        const { duration } = measurePerformance(() => {
          return countSetBits(memory) // O(n) operation
        }, largeThreshold)

        return { size: size.value, duration }
      })

      // Verify linear scaling for O(n) operations
      results.forEach(({ size, duration }) => {
        const timePerByte = duration / size
        expect(timePerByte).toBeLessThan(1) // Less than 1ms per byte
      })
    })
  })

  describe('stress testing', () => {
    it('should handle rapid successive operations', () => {
      const memory = createBitMemory(256)
      const operations = testConfig.stressOperations

      const { result } = measurePerformance(() => {
        let testMemory = memory

        for (let i = 0; i < operations.value; i++) {
          const address = i % 256
          const bitPos = i % 8
          const value = i % 2

          testMemory = setBit(testMemory, address, bitPos as BitPosition, value as Bit)
          if (i % 10 === 0) {
            testMemory = flipBit(testMemory, address, bitPos as BitPosition)
          }
          if (i % 100 === 0) {
            testMemory = setByte(testMemory, address, i % 256)
          }
        }

        return testMemory
      }, largeThreshold)

      expect(result).toBeDefined()
    })

    it('should handle memory reallocation patterns efficiently', () => {
      const iterations = IterationCount.scaling()

      const { result } = measurePerformance(() => {
        const results = []
        for (let i = 1; i <= iterations.value; i++) {
          const memory = createBitMemory(i % 100 + 1) // Varying sizes 1-100
          let testMemory = setBit(memory, 0, 0, 1)
          testMemory = flipBit(testMemory, 0, 0)
          const result = getBit(testMemory, 0, 0)
          results.push(result)
        }
        return results
      }, largeThreshold)

      expect(result).toHaveLength(iterations.value)
      result.forEach((bit: number) => expect(bit as Bit).toBe(0))
    })
  })

  // Real-world operation patterns
  const realWorldOperations = {
    bloomFilter: (memory: BitMemory, items: IterationCount) => () => {
      const hashConfig = HashConfiguration.bloomFilter()
      let testMemory = memory

      // Simulate adding items to bloom filter
      for (let i = 0; i < items.value; i++) {
        const hashes = hashConfig.calculateHashes(i)

        hashes.forEach(hash => {
          const addr = Math.floor(hash / 8)
          const bit = hash % 8
          testMemory = setBit(testMemory, addr, bit as BitPosition, 1)
        })
      }

      // Simulate checking items
      let falsePositives = 0
      for (let i = items.value; i < items.value + 100; i++) {
        const hashes = hashConfig.calculateHashes(i)

        const allBitsSet = hashes.every(hash => {
          const addr = Math.floor(hash / 8)
          const bit = hash % 8
          return getBit(testMemory, addr, bit as BitPosition)
        })

        if (allBitsSet) falsePositives++
      }

      return { memory: testMemory, falsePositives }
    },

    bitVector: (size: MemorySize) => () => {
      let testMemory = initializeMemory.alternating(size)

      const setBitCount = countSetBits(testMemory)

      const patternMatches = Array.from({ length: Math.floor(size.value / 2) }, (_, i) => i * 2)
        .filter(addr => addr < size.value - 1)
        .filter(addr => getByte(testMemory, addr) === BytePattern.alternatingHigh().byte &&
          getByte(testMemory, addr + 1) === BytePattern.alternatingLow().byte)
        .length

      return { memory: testMemory, setBitCount, patternMatches }
    }
  } as const

  describe('real-world usage patterns', () => {
    const realWorldTests = [
      {
        name: 'bloom filter-like operations',
        operation: () => {
          const memory = createBitMemory(1024)
          return realWorldOperations.bloomFilter(memory, IterationCount.scaling())()
        },
        validate: (result: unknown) => {
          const { falsePositives } = result as { memory: BitMemory; falsePositives: number }
          expect(falsePositives).toBeGreaterThanOrEqual(0)
        }
      },
      {
        name: 'bit vector operations',
        operation: () => realWorldOperations.bitVector(MemorySize.of(512))(),
        validate: (result: unknown) => {
          const { setBitCount, patternMatches } = result as { memory: BitMemory; setBitCount: number; patternMatches: number }
          expect(setBitCount).toBe(512 * 4) // Half the bits are set
          expect(patternMatches).toBeGreaterThan(0)
        }
      }
    ] as const

    realWorldTests.forEach(({ name, operation, validate }) => {
      it(`should handle ${name} efficiently`, () => {
        const { result } = measurePerformance(operation as () => unknown, largeThreshold)
        validate(result)
      })
    })
  })
})
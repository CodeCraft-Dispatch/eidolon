import { describe, it, expect, beforeEach } from 'vitest'
import {
  type Bit,
  type BitMemory,
  type ByteAddress,
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

describe('binary performance tests', () => {
  const PERFORMANCE_THRESHOLD_MS = 250 // 250ms threshold for most operations
  const LARGE_OPERATIONS_THRESHOLD_MS = 500 // 500ms for large-scale operations

  describe('single operation performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024) // 1KB for performance testing
    })

    it('should perform setBit operations quickly', () => {
      const iterations = 10000
      let testMemory = memory

      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const address = i % 1024
        const bitPos = i % 8
        testMemory = setBit(testMemory, address, bitPos as BitPosition, 1)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform getBit operations quickly', () => {
      // Pre-populate memory
      let testMemory = memory
      for (let i = 0; i < 1024; i++) {
        testMemory = setByte(testMemory, i, Math.floor(Math.random() * 256))
      }

      const iterations = 10000
      const start = performance.now()
      
      let totalBits = 0
      for (let i = 0; i < iterations; i++) {
        const address = i % 1024
        const bitPos = i % 8
        totalBits += getBit(testMemory, address, bitPos as BitPosition)
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      expect(totalBits).toBeGreaterThan(0) // Ensure we actually read bits
    })

    it('should perform flipBit operations quickly', () => {
      const iterations = 5000
      const start = performance.now()
      
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = i % 1024
        const bitPos = i % 8
        testMemory = flipBit(testMemory, address, bitPos as BitPosition)
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform setByte/getByte operations quickly', () => {
      const iterations = 10000
      const start = performance.now()
      
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = i % 1024
        const value = i % 256
        testMemory = setByte(testMemory, address, value)
        getByte(testMemory, address)
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('batch operation performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024)
    })

    it('should perform setBits batch operations quickly', () => {
      const operations = []
      for (let i = 0; i < 1000; i++) {
        operations.push({
          address: i % 1024 as ByteAddress,
          bitPosition: (i % 8) as BitPosition,
          value: (i % 2) as Bit
        })
      }

      const start = performance.now()
      const result = setBits(memory, operations)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      expect(countSetBits(result)).toBeGreaterThan(0)
    })

    it('should perform getBits batch operations quickly', () => {
      // Pre-populate memory
      let testMemory = memory
      for (let i = 0; i < 100; i++) {
        testMemory = setByte(testMemory, i, 170) // 0b10101010
      }

      const positions = []
      for (let i = 0; i < 1000; i++) {
        positions.push({
          address: (i % 100) as ByteAddress,
          bitPosition: (i % 8) as BitPosition
        })
      }

      const start = performance.now()
      const result = getBits(testMemory, positions)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      expect(result).toHaveLength(1000)
    })
  })

  describe('memory analysis performance', () => {
    const memorySizes = [64, 256, 1024, 4096] // Various sizes

    memorySizes.forEach(size => {
      describe(`${size} bytes memory`, () => {
        let memory: BitMemory

        beforeEach(() => {
          memory = createBitMemory(size)
        })

        it('should count set bits quickly', () => {
          // Pre-populate with random data
          let testMemory = memory
          for (let i = 0; i < size; i++) {
            testMemory = setByte(testMemory, i, Math.floor(Math.random() * 256))
          }

          const start = performance.now()
          const count = countSetBits(testMemory)
          const duration = performance.now() - start

          const threshold = size > 1024 ? LARGE_OPERATIONS_THRESHOLD_MS : PERFORMANCE_THRESHOLD_MS
          expect(duration).toBeLessThan(threshold)
          expect(count).toBeGreaterThanOrEqual(0)
          expect(count).toBeLessThanOrEqual(size * 8)
        })

        it('should find first set bit quickly', () => {
          // Create sparse memory with set bit near the end
          let testMemory = memory
          const setAddress = Math.floor(size * 0.8) // Set bit near end
          testMemory = setBit(testMemory, setAddress, 3, 1)

          const start = performance.now()
          const result = findFirstSetBit(testMemory)
          const duration = performance.now() - start

          const threshold = size > 1024 ? LARGE_OPERATIONS_THRESHOLD_MS : PERFORMANCE_THRESHOLD_MS
          expect(duration).toBeLessThan(threshold)
          expect(result).toEqual({ address: setAddress, bitPosition: 3 })
        })
      })
    })
  })

  describe('formatting performance', () => {
    const memorySizes = [16, 64, 256, 1024]

    memorySizes.forEach(size => {
      describe(`${size} bytes memory formatting`, () => {
        let memory: BitMemory

        beforeEach(() => {
          memory = createBitMemory(size)
          // Pre-populate with pattern
          for (let i = 0; i < size; i++) {
            memory = setByte(memory, i, i % 256)
          }
        })

        it('should format to hex quickly', () => {
          const start = performance.now()
          const hex = memoryToHex(memory)
          const duration = performance.now() - start

          const threshold = size > 256 ? LARGE_OPERATIONS_THRESHOLD_MS : PERFORMANCE_THRESHOLD_MS
          expect(duration).toBeLessThan(threshold)
          expect(hex).toHaveLength(size * 3 - 1) // 2 chars per byte + spaces
        })

        it('should format to binary quickly', () => {
          const start = performance.now()
          const binary = memoryToBinary(memory)
          const duration = performance.now() - start

          const threshold = size > 256 ? LARGE_OPERATIONS_THRESHOLD_MS : PERFORMANCE_THRESHOLD_MS
          expect(duration).toBeLessThan(threshold)
          expect(binary).toHaveLength(size * 9 - 1) // 8 chars per byte + spaces
        })
      })
    })
  })

  describe('memory size scaling performance', () => {
    const sizes = [1, 4, 16, 64, 256, 1024, 2048, 4096]

    it('should maintain O(1) performance for single bit operations', () => {
      const results: Array<{ size: number; duration: number }> = []

      sizes.forEach(size => {
        const memory = createBitMemory(size)
        const iterations = 1000

        const start = performance.now()
        let testMemory = memory
        for (let i = 0; i < iterations; i++) {
          const address = i % size
          const bitPos = i % 8
          testMemory = setBit(testMemory, address, bitPos as BitPosition, 1)
          getBit(testMemory, address, bitPos as BitPosition)
        }
        const duration = performance.now() - start

        results.push({ size, duration })
      })

      // Verify that performance doesn't degrade significantly with size
      // for individual operations (should be roughly O(1))
      const smallMemoryTime = results[0].duration
      const largeMemoryTime = results[results.length - 1].duration
      expect(largeMemoryTime).toBeLessThan(smallMemoryTime * (sizes.length * 2))
    })

    it('should show linear scaling for memory-wide operations', () => {
      const results: Array<{ size: number; duration: number }> = []

      sizes.forEach(size => {
        const memory = createBitMemory(size)
        let testMemory = memory
        
        // Fill memory with pattern
        for (let i = 0; i < size; i++) {
          testMemory = setByte(testMemory, i, 170) // 0b10101010
        }

        const start = performance.now()
        countSetBits(testMemory) // O(n) operation
        const duration = performance.now() - start

        results.push({ size, duration })
      })

      // Verify linear scaling for O(n) operations
      // Each result should be reasonable and roughly proportional to size
      results.forEach(({ size, duration }) => {
        const timePerByte = duration / size
        expect(timePerByte).toBeLessThan(1) // Less than 1ms per byte
      })
    })
  })

  describe('stress testing', () => {
    it('should handle rapid successive operations', () => {
      const memory = createBitMemory(256)
      const operations = 50000

      const start = performance.now()
      let testMemory = memory
      
      for (let i = 0; i < operations; i++) {
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
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(LARGE_OPERATIONS_THRESHOLD_MS)
    })

    it('should handle memory reallocation patterns efficiently', () => {
      const iterations = 1000
      const start = performance.now()

      for (let i = 1; i <= iterations; i++) {
        const memory = createBitMemory(i % 100 + 1) // Varying sizes 1-100
        let testMemory = setBit(memory, 0, 0, 1)
        testMemory = flipBit(testMemory, 0, 0)
        const result = getBit(testMemory, 0, 0)
        expect(result).toBe(0)
      }

      const duration = performance.now() - start
      expect(duration).toBeLessThan(LARGE_OPERATIONS_THRESHOLD_MS)
    })
  })

  describe('real-world usage patterns', () => {
    it('should handle bloom filter-like operations efficiently', () => {
      const memory = createBitMemory(1024) // 8KB bloom filter
      const items = 1000
      
      const start = performance.now()
      let testMemory = memory
      
      // Simulate adding items to bloom filter
      for (let i = 0; i < items; i++) {
        const hash1 = (i * 17) % 8192 // Bit position
        const hash2 = (i * 31) % 8192
        const hash3 = (i * 47) % 8192
        
        const addr1 = Math.floor(hash1 / 8)
        const bit1 = hash1 % 8
        const addr2 = Math.floor(hash2 / 8)
        const bit2 = hash2 % 8
        const addr3 = Math.floor(hash3 / 8)
        const bit3 = hash3 % 8
        
        testMemory = setBit(testMemory, addr1, bit1 as BitPosition, 1)
        testMemory = setBit(testMemory, addr2, bit2 as BitPosition, 1)
        testMemory = setBit(testMemory, addr3, bit3 as BitPosition, 1)
      }
      
      // Simulate checking items
      let falsePositives = 0
      for (let i = items; i < items + 100; i++) {
        const hash1 = (i * 17) % 8192
        const hash2 = (i * 31) % 8192
        const hash3 = (i * 47) % 8192
        
        const addr1 = Math.floor(hash1 / 8)
        const bit1 = hash1 % 8
        const addr2 = Math.floor(hash2 / 8)
        const bit2 = hash2 % 8
        const addr3 = Math.floor(hash3 / 8)
        const bit3 = hash3 % 8
        
        if (getBit(testMemory, addr1, bit1 as BitPosition) &&
            getBit(testMemory, addr2, bit2 as BitPosition) &&
            getBit(testMemory, addr3, bit3 as BitPosition)) {
          falsePositives++
        }
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(LARGE_OPERATIONS_THRESHOLD_MS)
      expect(falsePositives).toBeGreaterThanOrEqual(0) // Some false positives expected
    })

    it('should handle bit vector operations efficiently', () => {
      const size = 512
      const memory = createBitMemory(size)
      
      const start = performance.now()
      let testMemory = memory
      
      // Set alternating patterns
      for (let addr = 0; addr < size; addr++) {
        if (addr % 2 === 0) {
          testMemory = setByte(testMemory, addr, 170) // 0b10101010
        } else {
          testMemory = setByte(testMemory, addr, 85)  // 0b01010101
        }
      }
      
      // Count set bits
      const setBitCount = countSetBits(testMemory)
      
      // Find patterns
      let patternMatches = 0
      for (let addr = 0; addr < size - 1; addr += 2) {
        if (getByte(testMemory, addr) === 170 && getByte(testMemory, addr + 1) === 85) {
          patternMatches++
        }
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      expect(setBitCount).toBe(size * 4) // Half the bits are set
      expect(patternMatches).toBeGreaterThan(0)
    })
  })
})
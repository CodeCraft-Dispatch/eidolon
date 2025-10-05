import { describe, it, expect, beforeEach } from 'vitest'
import {
  type Endianness,
  getSystemEndianness,
  swapBytes16,
  swapBytes32,
  swapBytes64,
  readInt16,
  writeInt16,
  readInt32,
  writeInt32,
  readInt64,
  writeInt64,
  readUint16,
  writeUint16,
  readUint32,
  writeUint32,
  readUint64,
  writeUint64,
  readFloat32,
  writeFloat32,
  readFloat64,
  writeFloat64
} from '../../endianness'
import { type BitMemory, createBitMemory } from '../../binary'

describe('endianness performance tests', () => {
  const PERFORMANCE_THRESHOLD_MS = 250 // 250ms threshold for most operations
  const LARGE_OPERATIONS_THRESHOLD_MS = 500 // 500ms for large-scale operations

  describe('byte swapping performance', () => {
    it('should perform 16-bit byte swaps quickly', () => {
      const iterations = 100000
      const testValues = [0x0000, 0x1234, 0xABCD, 0xFFFF]
      
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const value = testValues[i % testValues.length]
        swapBytes16(value)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform 32-bit byte swaps quickly', () => {
      const iterations = 100000
      const testValues = [0x00000000, 0x12345678, 0xABCDEF01, 0xFFFFFFFF]
      
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const value = testValues[i % testValues.length]
        swapBytes32(value)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform 64-bit byte swaps quickly', () => {
      const iterations = 50000 // Reduced due to BigInt overhead
      const testValues = [0x0000000000000000n, 0x123456789ABCDEF0n, 0xFFFFFFFFFFFFFFFFn]
      
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const value = testValues[i % testValues.length]
        swapBytes64(value)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('16-bit integer performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024) // 1KB for performance testing
    })

    it('should perform signed 16-bit writes quickly', () => {
      const iterations = 10000
      const systemEndianness = getSystemEndianness()
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 2) % (memory.length - 1) // Ensure alignment
        const value = (i % 65536) - 32768 // Range: -32768 to 32767
        testMemory = writeInt16(testMemory, address, value, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform signed 16-bit reads quickly', () => {
      // Pre-populate memory
      let testMemory = memory
      const systemEndianness = getSystemEndianness()
      for (let i = 0; i < 500; i++) {
        const address = i * 2
        const value = (i % 65536) - 32768
        testMemory = writeInt16(testMemory, address, value, systemEndianness)
      }

      const iterations = 10000
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const address = (i * 2) % (memory.length - 1)
        readInt16(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform unsigned 16-bit operations quickly', () => {
      const iterations = 10000
      const systemEndianness = getSystemEndianness()
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 2) % (memory.length - 1)
        const value = i % 65536 // Range: 0 to 65535
        testMemory = writeUint16(testMemory, address, value, systemEndianness)
        readUint16(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('32-bit integer performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(2048) // 2KB for performance testing
    })

    it('should perform signed 32-bit writes quickly', () => {
      const iterations = 5000
      const systemEndianness = getSystemEndianness()
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 4) % (memory.length - 3) // Ensure 4-byte alignment
        const value = (i * 12345) | 0 // Signed 32-bit value
        testMemory = writeInt32(testMemory, address, value, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform signed 32-bit reads quickly', () => {
      // Pre-populate memory
      let testMemory = memory
      const systemEndianness = getSystemEndianness()
      for (let i = 0; i < 500; i++) {
        const address = i * 4
        const value = (i * 12345) | 0
        testMemory = writeInt32(testMemory, address, value, systemEndianness)
      }

      const iterations = 5000
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const address = (i * 4) % (memory.length - 3)
        readInt32(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform unsigned 32-bit operations quickly', () => {
      const iterations = 5000
      const systemEndianness = getSystemEndianness()
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 4) % (memory.length - 3)
        const value = (i * 12345) >>> 0 // Unsigned 32-bit value
        testMemory = writeUint32(testMemory, address, value, systemEndianness)
        readUint32(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('64-bit integer performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(4096) // 4KB for performance testing
    })

    it('should perform 64-bit writes quickly', () => {
      const iterations = 2000 // Reduced due to BigInt overhead
      const systemEndianness = getSystemEndianness()
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 8) % (memory.length - 7) // Ensure 8-byte alignment
        const value = BigInt(i) * 123456789n
        testMemory = writeInt64(testMemory, address, value, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform 64-bit reads quickly', () => {
      // Pre-populate memory
      let testMemory = memory
      const systemEndianness = getSystemEndianness()
      for (let i = 0; i < 200; i++) {
        const address = i * 8
        const value = BigInt(i) * 123456789n
        testMemory = writeInt64(testMemory, address, value, systemEndianness)
      }

      const iterations = 2000
      const start = performance.now()
      for (let i = 0; i < iterations; i++) {
        const address = (i * 8) % (memory.length - 7)
        readInt64(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('floating-point performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(2048) // 2KB for performance testing
    })

    it('should perform 32-bit float operations quickly', () => {
      const iterations = 5000
      const systemEndianness = getSystemEndianness()
      const testValues = [0.0, 1.0, -1.0, 3.14159, -3.14159, 1e6, -1e6]
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 4) % (memory.length - 3)
        const value = testValues[i % testValues.length] * (i + 1)
        testMemory = writeFloat32(testMemory, address, value, systemEndianness)
        readFloat32(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })

    it('should perform 64-bit float operations quickly', () => {
      const iterations = 2500
      const systemEndianness = getSystemEndianness()
      const testValues = [0.0, 1.0, -1.0, Math.PI, -Math.PI, 1e100, -1e100]
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 8) % (memory.length - 7)
        const value = testValues[i % testValues.length] * (i + 1)
        testMemory = writeFloat64(testMemory, address, value, systemEndianness)
        readFloat64(testMemory, address, systemEndianness)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('cross-endian performance', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024)
    })

    it('should handle endian conversions efficiently', () => {
      const iterations = 5000
      const littleEndian: Endianness = 'little'
      const bigEndian: Endianness = 'big'
      
      const start = performance.now()
      let testMemory = memory
      for (let i = 0; i < iterations; i++) {
        const address = (i * 4) % (memory.length - 3)
        const value = i * 12345
        
        // Write in little-endian, read in big-endian
        testMemory = writeInt32(testMemory, address, value, littleEndian)
        readInt32(testMemory, address, bigEndian)
        
        // Write in big-endian, read in little-endian  
        testMemory = writeInt32(testMemory, address, value, bigEndian)
        readInt32(testMemory, address, littleEndian)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
    })
  })

  describe('memory scaling performance', () => {
    const memorySizes = [256, 1024, 4096] // Different memory sizes

    memorySizes.forEach(size => {
      it(`should maintain performance with ${size} byte memory`, () => {
        const memory = createBitMemory(size)
        const iterations = Math.floor(1000 * (256 / size)) // Scale iterations with size
        const systemEndianness = getSystemEndianness()
        
        const start = performance.now()
        let testMemory = memory
        for (let i = 0; i < iterations; i++) {
          const address = (i * 4) % (size - 3)
          const value = i * 789
          testMemory = writeInt32(testMemory, address, value, systemEndianness)
          readInt32(testMemory, address, systemEndianness)
        }
        const duration = performance.now() - start
        
        expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS)
      })
    })
  })

  describe('real-world usage patterns', () => {
    it('should handle protocol header parsing efficiently', () => {
      const memory = createBitMemory(1024)
      const iterations = 1000
      
      const start = performance.now()
      let testMemory = memory
      
      // Simulate parsing network protocol headers
      for (let i = 0; i < iterations; i++) {
        const baseAddr = (i * 16) % (memory.length - 15)
        
        // Parse protocol header (mixed endianness like real protocols)
        testMemory = writeUint16(testMemory, baseAddr, 0x1234, 'big')      // Magic number (big-endian)
        testMemory = writeUint16(testMemory, baseAddr + 2, i, 'little')     // Sequence (little-endian)
        testMemory = writeUint32(testMemory, baseAddr + 4, i * 1000, 'big') // Timestamp (big-endian)
        testMemory = writeUint32(testMemory, baseAddr + 8, i % 256, 'little') // Flags (little-endian)
        testMemory = writeFloat32(testMemory, baseAddr + 12, i * 0.1, 'big') // Version (big-endian float)
        
        // Read back values
        readUint16(testMemory, baseAddr, 'big')
        readUint16(testMemory, baseAddr + 2, 'little')
        readUint32(testMemory, baseAddr + 4, 'big')
        readUint32(testMemory, baseAddr + 8, 'little')
        readFloat32(testMemory, baseAddr + 12, 'big')
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(LARGE_OPERATIONS_THRESHOLD_MS)
    })

    it('should handle binary file format operations efficiently', () => {
      const memory = createBitMemory(2048)
      const iterations = 500
      
      const start = performance.now()
      let testMemory = memory
      
      // Simulate binary file format with mixed data types
      for (let i = 0; i < iterations; i++) {
        const baseAddr = (i * 32) % (memory.length - 31)
        
        // File header simulation
        testMemory = writeUint32(testMemory, baseAddr, 0x4D5A9000, 'little')    // Magic signature
        testMemory = writeUint16(testMemory, baseAddr + 4, i, 'little')         // Version
        testMemory = writeUint16(testMemory, baseAddr + 6, i % 16, 'little')    // Flags
        testMemory = writeUint64(testMemory, baseAddr + 8, BigInt(i) * 1000n, 'little') // File size
        testMemory = writeFloat64(testMemory, baseAddr + 16, i * Math.PI, 'little')     // Timestamp
        testMemory = writeInt32(testMemory, baseAddr + 24, -i, 'little')        // Offset
        testMemory = writeUint32(testMemory, baseAddr + 28, ~i, 'little')       // Checksum
        
        // Verify data integrity
        const magic = readUint32(testMemory, baseAddr, 'little')
        const version = readUint16(testMemory, baseAddr + 4, 'little')
        const fileSize = readUint64(testMemory, baseAddr + 8, 'little')
        const timestamp = readFloat64(testMemory, baseAddr + 16, 'little')
        const offset = readInt32(testMemory, baseAddr + 24, 'little')
        
        // Basic validation
        expect(magic).toBe(0x4D5A9000)
        expect(version).toBe(i)
        expect(fileSize).toBe(BigInt(i) * 1000n)
        // Handle edge case of negative zero for i = 0
        if (i === 0) {
          expect(offset).toBe(0)
        } else {
          expect(offset).toBe(-i)
        }
      }
      
      const duration = performance.now() - start
      expect(duration).toBeLessThan(LARGE_OPERATIONS_THRESHOLD_MS)
    })
  })
})
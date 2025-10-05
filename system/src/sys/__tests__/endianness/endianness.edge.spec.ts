import { describe, it, expect, beforeEach } from 'vitest'
import {
  convertEndianness,
  writeInt16,
  writeInt32,
  writeInt64,
  writeUint16,
  writeUint32,
  writeUint64,
  writeFloat32,
  writeFloat64,
  readInt16,
  readInt32,
  readInt64,
  readUint16,
  readUint32,
  readUint64,
  readFloat32,
  readFloat64,
  swapBytes16,
  swapBytes32,
  swapBytes64,
  getSystemEndianness
} from '../../endianness'
import { createBitMemory, type BitMemory } from '../../binary'

describe('endianness edge cases and error handling', () => {
  describe('invalid parameters and error conditions', () => {
    describe('convertEndianness parameter validation', () => {
      it('should reject invalid byte sizes', () => {
        expect(() => convertEndianness(0x1234, 'little', 'big', 1 as any))
          .toThrow('Unsupported byte size: 1')
        expect(() => convertEndianness(0x1234, 'little', 'big', 3 as any))
          .toThrow('Unsupported byte size: 3')
        expect(() => convertEndianness(0x1234, 'little', 'big', 5 as any))
          .toThrow('Unsupported byte size: 5')
        expect(() => convertEndianness(0x1234, 'little', 'big', 16 as any))
          .toThrow('Unsupported byte size: 16')
        expect(() => convertEndianness(0x1234, 'little', 'big', 0 as any))
          .toThrow('Unsupported byte size: 0')
        expect(() => convertEndianness(0x1234, 'little', 'big', -1 as any))
          .toThrow('Unsupported byte size: -1')
      })

      it('should handle null and undefined gracefully', () => {
        expect(() => convertEndianness(null as any, 'little', 'big', 4))
          .not.toThrow() // JavaScript coerces null to 0
        expect(() => convertEndianness(undefined as any, 'little', 'big', 4))
          .not.toThrow() // JavaScript coerces undefined to NaN, then to 0
      })

      it('should handle non-numeric values', () => {
        expect(() => convertEndianness('hello' as any, 'little', 'big', 4))
          .not.toThrow() // JavaScript coerces string to NaN, then to 0
        expect(() => convertEndianness({} as any, 'little', 'big', 4))
          .not.toThrow() // JavaScript coerces object to NaN, then to 0
      })
    })

    describe('memory bounds validation', () => {
      it('should handle zero-sized memory gracefully', () => {
        const emptyMemory = createBitMemory(0)
        
        // All operations on empty memory should fail
        expect(() => writeInt16(emptyMemory, 0, 0x1234))
          .toThrow('Address 0 out of bounds for 16-bit write')
        expect(() => writeInt32(emptyMemory, 0, 0x12345678))
          .toThrow('Address 0 out of bounds for 32-bit write')
        expect(() => writeInt64(emptyMemory, 0, 0x123456789ABCDEF0n))
          .toThrow('Address 0 out of bounds for 64-bit write')
        expect(() => writeFloat32(emptyMemory, 0, 3.14))
          .toThrow('Address 0 out of bounds for 32-bit write')
        expect(() => writeFloat64(emptyMemory, 0, 3.14159))
          .toThrow('Address 0 out of bounds for 64-bit write')
      })

      it('should handle negative addresses gracefully', () => {
        const memory = createBitMemory(16)
        
        // Negative addresses should be handled by bounds checking
        expect(() => writeInt16(memory, -1, 0x1234))
          .toThrow('Address -1 out of bounds for 16-bit write')
        expect(() => writeInt32(memory, -5, 0x12345678))
          .toThrow('Address -5 out of bounds for 32-bit write')
        expect(() => readInt16(memory, -1))
          .toThrow('Address -1 out of bounds for 16-bit read')
        expect(() => readInt32(memory, -1))
          .toThrow('Address -1 out of bounds for 32-bit read')
      })

      it('should handle extremely large addresses', () => {
        const memory = createBitMemory(16)
        const largeAddress = Number.MAX_SAFE_INTEGER
        
        expect(() => writeInt16(memory, largeAddress, 0x1234))
          .toThrow(`Address ${largeAddress} out of bounds for 16-bit write`)
        expect(() => writeInt32(memory, largeAddress, 0x12345678))
          .toThrow(`Address ${largeAddress} out of bounds for 32-bit write`)
        expect(() => readInt16(memory, largeAddress))
          .toThrow(`Address ${largeAddress} out of bounds for 16-bit read`)
      })

      it('should handle fractional addresses', () => {
        const memory = createBitMemory(16)
        
        // Fractional addresses should work due to JavaScript number coercion
        expect(() => writeInt16(memory, 1.5, 0x1234)).not.toThrow()
        expect(() => writeInt32(memory, 2.7, 0x12345678)).not.toThrow()
        
        // But still respect bounds (error message shows truncated address)
        expect(() => writeInt16(memory, 15.9, 0x1234))
          .toThrow('Address 15 out of bounds for 16-bit write')
      })

      it('should handle off-by-one boundary conditions', () => {
        const memory = createBitMemory(16)
        
        // Last valid addresses for each operation type
        expect(() => writeInt16(memory, 14, 0x1234)).not.toThrow() // 14 + 2 - 1 = 15 (last byte)
        expect(() => writeInt32(memory, 12, 0x12345678)).not.toThrow() // 12 + 4 - 1 = 15
        expect(() => writeInt64(memory, 8, 0x123456789ABCDEF0n)).not.toThrow() // 8 + 8 - 1 = 15
        expect(() => writeFloat32(memory, 12, 3.14)).not.toThrow()
        expect(() => writeFloat64(memory, 8, 3.14159)).not.toThrow()
        
        // First invalid addresses
        expect(() => writeInt16(memory, 15, 0x1234))
          .toThrow('Address 15 out of bounds for 16-bit write')
        expect(() => writeInt32(memory, 13, 0x12345678))
          .toThrow('Address 13 out of bounds for 32-bit write')
        expect(() => writeInt64(memory, 9, 0x123456789ABCDEF0n))
          .toThrow('Address 9 out of bounds for 64-bit write')
        expect(() => writeFloat32(memory, 13, 3.14))
          .toThrow('Address 13 out of bounds for 32-bit write')
        expect(() => writeFloat64(memory, 9, 3.14159))
          .toThrow('Address 9 out of bounds for 64-bit write')
      })
    })
  })

  describe('numeric boundary conditions and overflow handling', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(32)
    })

    describe('16-bit integer boundaries', () => {
      it('should handle 16-bit signed integer boundaries correctly', () => {
        const maxInt16 = 32767
        const minInt16 = -32768
        
        // Test maximum positive value
        let testMemory = writeInt16(memory, 0, maxInt16, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(maxInt16)
        
        // Test minimum negative value
        testMemory = writeInt16(memory, 0, minInt16, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(minInt16)
        
        // Test both endiannesses
        testMemory = writeInt16(memory, 0, maxInt16, 'big')
        expect(readInt16(testMemory, 0, 'big')).toBe(maxInt16)
        
        testMemory = writeInt16(memory, 0, minInt16, 'big')
        expect(readInt16(testMemory, 0, 'big')).toBe(minInt16)
      })

      it('should handle 16-bit unsigned integer boundaries correctly', () => {
        const maxUint16 = 65535
        const minUint16 = 0
        
        let testMemory = writeUint16(memory, 0, maxUint16, 'little')
        expect(readUint16(testMemory, 0, 'little')).toBe(maxUint16)
        
        testMemory = writeUint16(memory, 0, minUint16, 'little')
        expect(readUint16(testMemory, 0, 'little')).toBe(minUint16)
      })

      it('should handle 16-bit overflow conditions', () => {
        // Values larger than 16-bit should wrap around
        const overflowValue = 65536 // 2^16
        let testMemory = writeInt16(memory, 0, overflowValue, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(0) // Wraps to 0
        
        const largeValue = 65537 // 2^16 + 1
        testMemory = writeInt16(memory, 0, largeValue, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(1) // Wraps to 1
        
        // Negative overflow
        const negativeOverflow = -32769 // Below min int16
        testMemory = writeInt16(memory, 0, negativeOverflow, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(32767) // Wraps to max positive
      })
    })

    describe('32-bit integer boundaries', () => {
      it('should handle 32-bit signed integer boundaries correctly', () => {
        const maxInt32 = 2147483647 // 2^31 - 1
        const minInt32 = -2147483648 // -2^31
        
        let testMemory = writeInt32(memory, 0, maxInt32, 'little')
        expect(readInt32(testMemory, 0, 'little')).toBe(maxInt32)
        
        testMemory = writeInt32(memory, 0, minInt32, 'little')
        expect(readInt32(testMemory, 0, 'little')).toBe(minInt32)
        
        // Test big-endian as well
        testMemory = writeInt32(memory, 0, maxInt32, 'big')
        expect(readInt32(testMemory, 0, 'big')).toBe(maxInt32)
        
        testMemory = writeInt32(memory, 0, minInt32, 'big')
        expect(readInt32(testMemory, 0, 'big')).toBe(minInt32)
      })

      it('should handle 32-bit unsigned integer boundaries correctly', () => {
        const maxUint32 = 4294967295 // 2^32 - 1
        const minUint32 = 0
        
        let testMemory = writeUint32(memory, 0, maxUint32, 'little')
        expect(readUint32(testMemory, 0, 'little')).toBe(maxUint32)
        
        testMemory = writeUint32(memory, 0, minUint32, 'little')
        expect(readUint32(testMemory, 0, 'little')).toBe(minUint32)
      })

      it('should handle JavaScript number precision limits', () => {
        // JavaScript numbers lose precision beyond Number.MAX_SAFE_INTEGER
        const safeBoundary = Number.MAX_SAFE_INTEGER
        let testMemory = writeUint32(memory, 0, safeBoundary, 'little')
        
        // The value will be truncated to 32-bit
        const truncated = safeBoundary >>> 0 // Convert to 32-bit unsigned
        expect(readUint32(testMemory, 0, 'little')).toBe(truncated)
      })
    })

    describe('64-bit integer boundaries', () => {
      it('should handle 64-bit signed integer boundaries correctly', () => {
        const maxInt64 = 9223372036854775807n // 2^63 - 1
        const minInt64 = -9223372036854775808n // -2^63
        
        let testMemory = writeInt64(memory, 0, maxInt64, 'little')
        expect(readInt64(testMemory, 0, 'little')).toBe(maxInt64)
        
        testMemory = writeInt64(memory, 0, minInt64, 'little')
        expect(readInt64(testMemory, 0, 'little')).toBe(minInt64)
        
        // Test big-endian as well
        testMemory = writeInt64(memory, 0, maxInt64, 'big')
        expect(readInt64(testMemory, 0, 'big')).toBe(maxInt64)
        
        testMemory = writeInt64(memory, 0, minInt64, 'big')
        expect(readInt64(testMemory, 0, 'big')).toBe(minInt64)
      })

      it('should handle 64-bit unsigned integer boundaries correctly', () => {
        const maxUint64 = 18446744073709551615n // 2^64 - 1
        const minUint64 = 0n
        
        let testMemory = writeUint64(memory, 0, maxUint64, 'little')
        expect(readUint64(testMemory, 0, 'little')).toBe(maxUint64)
        
        testMemory = writeUint64(memory, 0, minUint64, 'little')
        expect(readUint64(testMemory, 0, 'little')).toBe(minUint64)
      })

      it('should handle BigInt edge cases', () => {
        // Very large BigInt values that exceed 64-bit
        const hugeBigInt = 123456789012345678901234567890n
        let testMemory = writeInt64(memory, 0, hugeBigInt, 'little')
        
        // Should be truncated to 64-bit representation
        const truncated = hugeBigInt & ((1n << 64n) - 1n)
        const result = readUint64(testMemory, 0, 'little') // Read as unsigned to compare
        expect(result).toBe(truncated)
      })
    })
  })

  describe('floating-point edge cases and special values', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(32)
    })

    describe('32-bit float special values', () => {
      it('should handle IEEE 754 special values correctly', () => {
        const specialValues = [
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NaN,
          0.0,
          -0.0,
          Number.EPSILON // Use EPSILON instead of MIN_VALUE for float32 tests
        ]
        
        specialValues.forEach(value => {
          const testMemory = writeFloat32(memory, 0, value, 'little')
          const result = readFloat32(testMemory, 0, 'little')
          
          if (Number.isNaN(value)) {
            expect(Number.isNaN(result)).toBe(true)
          } else if (value === 0) {
            // Handle both +0 and -0 - they should be close to 0
            expect(Math.abs(result)).toBe(0)
          } else {
            expect(result).toBe(value)
          }
        })
        
        // Test MIN_VALUE separately as it underflows to 0 in float32
        const minValueMemory = writeFloat32(memory, 0, Number.MIN_VALUE, 'little')
        const minValueResult = readFloat32(minValueMemory, 0, 'little')
        expect(minValueResult).toBe(0) // MIN_VALUE underflows to 0 in float32
        
        // Test MAX_VALUE separately as it overflows to Infinity in float32
        const maxValueMemory = writeFloat32(memory, 0, Number.MAX_VALUE, 'little')
        const maxValueResult = readFloat32(maxValueMemory, 0, 'little')
        expect(maxValueResult).toBe(Number.POSITIVE_INFINITY) // MAX_VALUE overflows to Infinity
      })

      it('should handle denormalized numbers', () => {
        // Very small numbers that become denormalized in float32
        const smallValues = [
          1.175494e-38, // Near float32 minimum normal
          1e-45,        // Denormalized
          5e-324        // JavaScript minimum (way below float32 range)
        ]
        
        smallValues.forEach(value => {
          const testMemory = writeFloat32(memory, 0, value, 'little')
          const result = readFloat32(testMemory, 0, 'little')
          
          // For very small values, expect some precision loss
          if (value < 1e-38) {
            expect(result).toBeCloseTo(0, 10)
          } else {
            expect(result).toBeCloseTo(value, 6)
          }
        })
      })

      it('should preserve precision across endianness for normal values', () => {
        const precisionValues = [
          Math.PI,
          Math.E,
          1.23456789,
          123.456789 // Use a larger number for better cross-endian distinction
        ]
        
        precisionValues.forEach(value => {
          // Write in little-endian, read in little-endian
          let testMemory = writeFloat32(memory, 0, value, 'little')
          expect(readFloat32(testMemory, 0, 'little')).toBeCloseTo(value, 4) // Further reduced precision for float32
          
          // Write in big-endian, read in big-endian
          testMemory = writeFloat32(memory, 0, value, 'big')
          expect(readFloat32(testMemory, 0, 'big')).toBeCloseTo(value, 4) // Further reduced precision for float32
          
          // Cross-endian should not match (use a much larger difference threshold)
          const crossEndianResult = readFloat32(testMemory, 0, 'little')
          expect(Math.abs(crossEndianResult - value)).toBeGreaterThan(Math.abs(value) * 0.01) // Must differ by more than 1%
        })
      })
    })

    describe('64-bit float special values', () => {
      it('should handle IEEE 754 double special values correctly', () => {
        const specialValues = [
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NaN,
          0.0,
          -0.0,
          Number.MIN_VALUE,
          Number.MAX_VALUE,
          Number.EPSILON
        ]
        
        specialValues.forEach(value => {
          const testMemory = writeFloat64(memory, 0, value, 'little')
          const result = readFloat64(testMemory, 0, 'little')
          
          if (Number.isNaN(value)) {
            expect(Number.isNaN(result)).toBe(true)
          } else if (value === 0) {
            // Handle both +0 and -0 - they should be close to 0
            expect(Math.abs(result)).toBe(0)
          } else {
            expect(result).toBe(value)
          }
        })
      })

      it('should handle extreme precision values', () => {
        const extremeValues = [
          1e-308,  // Near double minimum
          1e308,   // Near double maximum
          1.7976931348623157e+308, // Near MAX_VALUE
          2.2250738585072014e-308  // Near MIN_VALUE
        ]
        
        extremeValues.forEach(value => {
          const testMemory = writeFloat64(memory, 0, value, 'little')
          const result = readFloat64(testMemory, 0, 'little')
          
          if (value > Number.MAX_VALUE) {
            expect(result).toBe(Number.POSITIVE_INFINITY)
          } else {
            expect(result).toBeCloseTo(value, 14)
          }
        })
      })
    })
  })

  describe('byte swapping edge cases', () => {
    it('should handle swapBytes16 edge cases', () => {
      const edgeCases = [
        0x0000,
        0xFFFF,
        0x00FF,
        0xFF00,
        0x8000, // Sign bit
        0x7FFF  // Max positive
      ]
      
      edgeCases.forEach(value => {
        const swapped = swapBytes16(value)
        const doubleSwapped = swapBytes16(swapped)
        expect(doubleSwapped).toBe(value) // Should be inverse
      })
    })

    it('should handle swapBytes32 edge cases', () => {
      const edgeCases = [
        0x00000000,
        0xFFFFFFFF,
        0x000000FF,
        0xFF000000,
        0x80000000, // Sign bit
        0x7FFFFFFF  // Max positive
      ]
      
      edgeCases.forEach(value => {
        const swapped = swapBytes32(value)
        const doubleSwapped = swapBytes32(swapped)
        expect(doubleSwapped).toBe(value >>> 0) // Should be inverse (unsigned)
      })
    })

    it('should handle swapBytes64 edge cases', () => {
      const edgeCases = [
        0x0000000000000000n,
        0xFFFFFFFFFFFFFFFFn,
        0x00000000000000FFn,
        0xFF00000000000000n,
        0x8000000000000000n, // Sign bit
        0x7FFFFFFFFFFFFFFFn  // Max positive
      ]
      
      edgeCases.forEach(value => {
        const swapped = swapBytes64(value)
        const doubleSwapped = swapBytes64(swapped)
        expect(doubleSwapped).toBe(value) // Should be inverse
      })
    })

    it('should handle non-integer values for byte swapping', () => {
      // JavaScript will convert non-integers
      expect(() => swapBytes16(3.14)).not.toThrow()
      expect(() => swapBytes32(3.14159)).not.toThrow()
      expect(() => swapBytes64(3n)).not.toThrow() // Valid BigInt
      
      // Result should be predictable based on truncation
      expect(swapBytes16(3.14)).toBe(swapBytes16(3))
      expect(swapBytes32(3.14159)).toBe(swapBytes32(3))
    })
  })

  describe('system endianness consistency', () => {
    it('should consistently detect system endianness', () => {
      const detections = Array.from({ length: 100 }, () => getSystemEndianness())
      const firstDetection = detections[0]
      
      // All detections should be identical
      detections.forEach(detection => {
        expect(detection).toBe(firstDetection)
      })
      
      // Should be one of the valid values
      expect(['little', 'big']).toContain(firstDetection)
    })

    it('should handle concurrent endianness detection', async () => {
      const promises = Array.from({ length: 50 }, () => 
        Promise.resolve(getSystemEndianness())
      )
      
      const results = await Promise.all(promises)
      const firstResult = results[0]
      
      results.forEach(result => {
        expect(result).toBe(firstResult)
      })
    })
  })

  describe('memory state consistency after errors', () => {
    it('should not modify memory when operations fail', () => {
      const memory = createBitMemory(4)
      const originalMemory = new Uint8Array(memory)
      
      // Try operations that should fail
      try {
        writeInt32(memory, 2, 0x12345678) // Should fail due to bounds
      } catch {
        // Memory should be unchanged
        expect(Array.from(memory)).toEqual(Array.from(originalMemory))
      }
      
      try {
        writeInt64(memory, 0, 0x123456789ABCDEF0n) // Should fail due to bounds
      } catch {
        // Memory should be unchanged
        expect(Array.from(memory)).toEqual(Array.from(originalMemory))
      }
    })

    it('should maintain immutability principle even on errors', () => {
      const memory = createBitMemory(4)
      const originalLength = memory.length
      
      try {
        writeInt32(memory, 10, 0x12345678) // Should fail
      } catch {
        // Original memory object should be unchanged
        expect(memory.length).toBe(originalLength)
        expect(Array.from(memory)).toEqual(new Array(4).fill(0))
      }
    })
  })
})
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSystemEndianness,
  swapBytes16,
  swapBytes32,
  swapBytes64,
  convertEndianness,
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
  readFloat32,
  writeFloat32,
  readFloat64,
  writeFloat64,
  isLittleEndian,
  isBigEndian
} from '../../endianness'
import { type BitMemory, createBitMemory } from '../../binary'

describe('endianness module', () => {
  let memory: BitMemory

  beforeEach(() => {
    memory = createBitMemory(16) // 16 bytes for testing
  })

  describe('system endianness detection', () => {
    it('should detect system endianness consistently', () => {
      const endianness = getSystemEndianness()
      expect(endianness).toMatch(/^(little|big)$/)
      
      // Should be consistent across calls
      expect(getSystemEndianness()).toBe(endianness)
      expect(getSystemEndianness()).toBe(endianness)
    })

    it('should provide convenience functions for endianness checking', () => {
      const isLittle = isLittleEndian()
      const isBig = isBigEndian()
      
      expect(isLittle).toBe(!isBig)
      expect(isLittle).toBe(getSystemEndianness() === 'little')
      expect(isBig).toBe(getSystemEndianness() === 'big')
    })
  })

  describe('byte swapping functions', () => {
    describe('16-bit byte swapping', () => {
      it('should swap bytes in 16-bit values correctly', () => {
        expect(swapBytes16(0x1234)).toBe(0x3412)
        expect(swapBytes16(0x0000)).toBe(0x0000)
        expect(swapBytes16(0xFFFF)).toBe(0xFFFF)
        expect(swapBytes16(0x00FF)).toBe(0xFF00)
        expect(swapBytes16(0xFF00)).toBe(0x00FF)
      })

      it('should be its own inverse', () => {
        const values = [0x0000, 0x1234, 0xABCD, 0xFFFF, 0x00FF, 0xFF00]
        values.forEach(value => {
          expect(swapBytes16(swapBytes16(value))).toBe(value)
        })
      })
    })

    describe('32-bit byte swapping', () => {
      it('should swap bytes in 32-bit values correctly', () => {
        expect(swapBytes32(0x12345678)).toBe(0x78563412)
        expect(swapBytes32(0x00000000)).toBe(0x00000000)
        expect(swapBytes32(0xFFFFFFFF)).toBe(0xFFFFFFFF)
        expect(swapBytes32(0x000000FF)).toBe(0xFF000000)
        expect(swapBytes32(0xFF000000)).toBe(0x000000FF)
      })

      it('should be its own inverse', () => {
        const values = [0x00000000, 0x12345678, 0xABCDEF01, 0xFFFFFFFF]
        values.forEach(value => {
          expect(swapBytes32(swapBytes32(value))).toBe(value)
        })
      })
    })

    describe('64-bit byte swapping', () => {
      it('should swap bytes in 64-bit values correctly', () => {
        expect(swapBytes64(0x123456789ABCDEF0n)).toBe(0xF0DEBC9A78563412n)
        expect(swapBytes64(0x0000000000000000n)).toBe(0x0000000000000000n)
        expect(swapBytes64(0xFFFFFFFFFFFFFFFFn)).toBe(0xFFFFFFFFFFFFFFFFn)
        expect(swapBytes64(0x00000000000000FFn)).toBe(0xFF00000000000000n)
      })

      it('should be its own inverse', () => {
        const values = [
          0x0000000000000000n,
          0x123456789ABCDEF0n,
          0xFFFFFFFFFFFFFFFFn,
          0x00000000000000FFn
        ]
        values.forEach(value => {
          expect(swapBytes64(swapBytes64(value))).toBe(value)
        })
      })
    })
  })

  describe('endianness conversion', () => {
    it('should return the same value when converting between same endianness', () => {
      expect(convertEndianness(0x1234, 'little', 'little', 2)).toBe(0x1234)
      expect(convertEndianness(0x1234, 'big', 'big', 2)).toBe(0x1234)
      expect(convertEndianness(0x12345678, 'little', 'little', 4)).toBe(0x12345678)
      expect(convertEndianness(0x12345678, 'big', 'big', 4)).toBe(0x12345678)
    })

    it('should swap bytes when converting between different endianness', () => {
      expect(convertEndianness(0x1234, 'little', 'big', 2)).toBe(0x3412)
      expect(convertEndianness(0x1234, 'big', 'little', 2)).toBe(0x3412)
      expect(convertEndianness(0x12345678, 'little', 'big', 4)).toBe(0x78563412)
      expect(convertEndianness(0x12345678, 'big', 'little', 4)).toBe(0x78563412)
    })

    it('should handle 64-bit values', () => {
      expect(convertEndianness(0x123456789ABCDEF0n, 'little', 'big', 8)).toBe(0xF0DEBC9A78563412n)
      expect(convertEndianness(0x123456789ABCDEF0n, 'big', 'little', 8)).toBe(0xF0DEBC9A78563412n)
    })
  })

  describe('16-bit integer operations', () => {
    describe('signed 16-bit integers', () => {
      it('should write and read 16-bit signed integers in little-endian', () => {
        const testMemory = writeInt16(memory, 0, 0x1234, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(0x1234)
        
        // Verify byte order in memory (little-endian: LSB first)
        expect(testMemory[0]).toBe(0x34) // LSB
        expect(testMemory[1]).toBe(0x12) // MSB
      })

      it('should write and read 16-bit signed integers in big-endian', () => {
        const testMemory = writeInt16(memory, 0, 0x1234, 'big')
        expect(readInt16(testMemory, 0, 'big')).toBe(0x1234)
        
        // Verify byte order in memory (big-endian: MSB first)
        expect(testMemory[0]).toBe(0x12) // MSB
        expect(testMemory[1]).toBe(0x34) // LSB
      })

      it('should handle negative values correctly', () => {
        const negativeValue = -32768 // 0x8000 as signed 16-bit
        const testMemory = writeInt16(memory, 0, negativeValue, 'little')
        expect(readInt16(testMemory, 0, 'little')).toBe(negativeValue)
        
        // Should handle the full range
        const testMemory2 = writeInt16(memory, 0, 32767, 'little') // Max positive
        expect(readInt16(testMemory2, 0, 'little')).toBe(32767)
      })

      it('should use system endianness by default', () => {
        const testMemory = writeInt16(memory, 0, 0x1234)
        expect(readInt16(testMemory, 0)).toBe(0x1234)
      })
    })

    describe('unsigned 16-bit integers', () => {
      it('should write and read 16-bit unsigned integers', () => {
        const testMemory = writeUint16(memory, 0, 0xFFFF, 'little')
        expect(readUint16(testMemory, 0, 'little')).toBe(0xFFFF)
        
        const testMemory2 = writeUint16(memory, 0, 0xFFFF, 'big')
        expect(readUint16(testMemory2, 0, 'big')).toBe(0xFFFF)
      })

      it('should handle full unsigned range', () => {
        const testMemory = writeUint16(memory, 0, 65535, 'little') // Max unsigned 16-bit
        expect(readUint16(testMemory, 0, 'little')).toBe(65535)
        
        const testMemory2 = writeUint16(memory, 0, 0, 'little') // Min unsigned 16-bit
        expect(readUint16(testMemory2, 0, 'little')).toBe(0)
      })
    })
  })

  describe('32-bit integer operations', () => {
    describe('signed 32-bit integers', () => {
      it('should write and read 32-bit signed integers in little-endian', () => {
        const testMemory = writeInt32(memory, 0, 0x12345678, 'little')
        expect(readInt32(testMemory, 0, 'little')).toBe(0x12345678)
        
        // Verify byte order (little-endian)
        expect(testMemory[0]).toBe(0x78)
        expect(testMemory[1]).toBe(0x56)
        expect(testMemory[2]).toBe(0x34)
        expect(testMemory[3]).toBe(0x12)
      })

      it('should write and read 32-bit signed integers in big-endian', () => {
        const testMemory = writeInt32(memory, 0, 0x12345678, 'big')
        expect(readInt32(testMemory, 0, 'big')).toBe(0x12345678)
        
        // Verify byte order (big-endian)
        expect(testMemory[0]).toBe(0x12)
        expect(testMemory[1]).toBe(0x34)
        expect(testMemory[2]).toBe(0x56)
        expect(testMemory[3]).toBe(0x78)
      })

      it('should handle negative values correctly', () => {
        const negativeValue = -2147483648 // Min signed 32-bit
        const testMemory = writeInt32(memory, 0, negativeValue, 'little')
        expect(readInt32(testMemory, 0, 'little')).toBe(negativeValue)
      })
    })

    describe('unsigned 32-bit integers', () => {
      it('should write and read 32-bit unsigned integers', () => {
        const testMemory = writeUint32(memory, 0, 0xFFFFFFFF, 'little')
        expect(readUint32(testMemory, 0, 'little')).toBe(0xFFFFFFFF)
      })

      it('should handle full unsigned range', () => {
        const testMemory = writeUint32(memory, 0, 4294967295, 'little') // Max unsigned 32-bit
        expect(readUint32(testMemory, 0, 'little')).toBe(4294967295)
      })
    })
  })

  describe('64-bit integer operations', () => {
    it('should write and read 64-bit integers in little-endian', () => {
      const value = 0x123456789ABCDEF0n
      const testMemory = writeInt64(memory, 0, value, 'little')
      expect(readInt64(testMemory, 0, 'little')).toBe(value)
    })

    it('should write and read 64-bit integers in big-endian', () => {
      const value = 0x123456789ABCDEF0n
      const testMemory = writeInt64(memory, 0, value, 'big')
      expect(readInt64(testMemory, 0, 'big')).toBe(value)
    })

    it('should handle negative 64-bit values', () => {
      const negativeValue = -9223372036854775808n // Min signed 64-bit
      const testMemory = writeInt64(memory, 0, negativeValue, 'little')
      expect(readInt64(testMemory, 0, 'little')).toBe(negativeValue)
    })
  })

  describe('floating-point operations', () => {
    describe('32-bit floats', () => {
      it('should write and read 32-bit floats correctly', () => {
        const values = [0.0, 1.0, -1.0, 3.14159, -3.14159, 1e10, -1e10]
        
        values.forEach(value => {
          const testMemory = writeFloat32(memory, 0, value, 'little')
          expect(readFloat32(testMemory, 0, 'little')).toBeCloseTo(value, 6)
          
          const testMemory2 = writeFloat32(memory, 0, value, 'big')
          expect(readFloat32(testMemory2, 0, 'big')).toBeCloseTo(value, 6)
        })
      })

      it('should handle special float values', () => {
        const specialValues = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
        
        specialValues.forEach(value => {
          const testMemory = writeFloat32(memory, 0, value, 'little')
          expect(readFloat32(testMemory, 0, 'little')).toBe(value)
        })

        // NaN test
        const testMemory = writeFloat32(memory, 0, NaN, 'little')
        expect(Number.isNaN(readFloat32(testMemory, 0, 'little'))).toBe(true)
      })
    })

    describe('64-bit floats', () => {
      it('should write and read 64-bit floats correctly', () => {
        const values = [0.0, 1.0, -1.0, Math.PI, -Math.PI, 1e100, -1e100]
        
        values.forEach(value => {
          const testMemory = writeFloat64(memory, 0, value, 'little')
          expect(readFloat64(testMemory, 0, 'little')).toBeCloseTo(value, 14)
          
          const testMemory2 = writeFloat64(memory, 0, value, 'big')
          expect(readFloat64(testMemory2, 0, 'big')).toBeCloseTo(value, 14)
        })
      })

      it('should handle special double values', () => {
        const specialValues = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.MAX_VALUE, Number.MIN_VALUE]
        
        specialValues.forEach(value => {
          const testMemory = writeFloat64(memory, 0, value, 'little')
          expect(readFloat64(testMemory, 0, 'little')).toBe(value)
        })

        // NaN test
        const testMemory = writeFloat64(memory, 0, NaN, 'little')
        expect(Number.isNaN(readFloat64(testMemory, 0, 'little'))).toBe(true)
      })
    })
  })

  describe('bounds checking', () => {
    it('should throw error when reading beyond memory bounds', () => {
      expect(() => readInt16(memory, 15, 'little')).toThrow('Address 15 out of bounds for 16-bit read')
      expect(() => readInt32(memory, 13, 'little')).toThrow('Address 13 out of bounds for 32-bit read')
      expect(() => readInt64(memory, 9, 'little')).toThrow('Address 9 out of bounds for 64-bit read')
      expect(() => readFloat32(memory, 13, 'little')).toThrow('Address 13 out of bounds for 32-bit read')
      expect(() => readFloat64(memory, 9, 'little')).toThrow('Address 9 out of bounds for 64-bit read')
    })

    it('should throw error when writing beyond memory bounds', () => {
      expect(() => writeInt16(memory, 15, 0x1234, 'little')).toThrow('Address 15 out of bounds for 16-bit write')
      expect(() => writeInt32(memory, 13, 0x12345678, 'little')).toThrow('Address 13 out of bounds for 32-bit write')
      expect(() => writeInt64(memory, 9, 0x123456789ABCDEF0n, 'little')).toThrow('Address 9 out of bounds for 64-bit write')
      expect(() => writeFloat32(memory, 13, 3.14, 'little')).toThrow('Address 13 out of bounds for 32-bit write')
      expect(() => writeFloat64(memory, 9, 3.14159, 'little')).toThrow('Address 9 out of bounds for 64-bit write')
    })
  })

  describe('cross-endian compatibility', () => {
    it('should read little-endian data as big-endian with proper conversion', () => {
      // Write in little-endian
      const littleMemory = writeInt16(memory, 0, 0x1234, 'little')
      
      // Read as big-endian should give swapped result
      expect(readInt16(littleMemory, 0, 'big')).toBe(0x3412)
    })

    it('should read big-endian data as little-endian with proper conversion', () => {
      // Write in big-endian
      const bigMemory = writeInt16(memory, 0, 0x1234, 'big')
      
      // Read as little-endian should give swapped result
      expect(readInt16(bigMemory, 0, 'little')).toBe(0x3412)
    })

    it('should handle round-trip conversions correctly', () => {
      const originalValue = 0x12345678
      
      // Write as little-endian, read as big-endian, convert back
      const littleMemory = writeInt32(memory, 0, originalValue, 'little')
      const bigEndianRead = readInt32(littleMemory, 0, 'big')
      const convertedBack = convertEndianness(bigEndianRead, 'big', 'little', 4)
      
      expect(convertedBack).toBe(originalValue)
    })
  })

  describe('memory alignment considerations', () => {
    it('should handle unaligned reads and writes', () => {
      // Write at odd addresses to test unaligned access
      const testMemory = writeInt16(memory, 1, 0x1234, 'little')
      expect(readInt16(testMemory, 1, 'little')).toBe(0x1234)
      
      const testMemory2 = writeInt32(memory, 1, 0x12345678, 'little')
      expect(readInt32(testMemory2, 1, 'little')).toBe(0x12345678)
    })

    it('should handle overlapping writes correctly', () => {
      let testMemory = writeInt32(memory, 0, 0x12345678, 'little')
      testMemory = writeInt16(testMemory, 2, 0xABCD, 'little')
      
      // The first 16-bit read should still work (as unsigned to avoid sign issues)
      expect(readUint16(testMemory, 0, 'little')).toBe(0x5678)
      // The overlapping write should be visible (as unsigned to match the written value)
      expect(readUint16(testMemory, 2, 'little')).toBe(0xABCD)
    })
  })
})
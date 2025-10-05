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
  byteToBits,
  bitsToByte,
  getMemoryBits,
  setMemoryBits,
  countSetBits,
  findFirstSetBit,
  getMemorySize,
  getTotalBitCapacity,
  memoryToHex,
  memoryToBinary,
  isValidBitPosition,
  isInvalidBitPosition,
  isValidAddress,
  isValidBit
} from '../../binary'

describe('binary', () => {
  let memory: BitMemory

  beforeEach(() => {
    memory = createBitMemory(4) // 4 bytes = 32 bits
  })

  describe('createBitMemory', () => {
    it('should create memory with specified size', () => {
      const testMemory = createBitMemory(8)
      expect(getMemorySize(testMemory)).toBe(8)
    })

    it('should create empty memory when size is zero', () => {
      const emptyMemory = createBitMemory(0)
      expect(getMemorySize(emptyMemory)).toBe(0)
    })
  })

  describe('setBit', () => {
    it('should set bit to 1', () => {
      const newMemory = setBit(memory, 0, 3, 1)
      expect(getBit(newMemory, 0, 3)).toBe(1)
    })

    it('should set bit to 0', () => {
      const testMemory = setBit(memory, 0, 3, 1)
      const newMemory = setBit(testMemory, 0, 3, 0)
      expect(getBit(newMemory, 0, 3)).toBe(0)
    })

    it('should maintain immutability', () => {
      const newMemory = setBit(memory, 0, 0, 1)
      expect(getBit(memory, 0, 0)).toBe(0) // Original unchanged
      expect(getBit(newMemory, 0, 0)).toBe(1) // New memory modified
    })

    it('should throw error for out of bounds address', () => {
      expect(() => setBit(memory, 10, 0, 1)).toThrow('Address 10 out of bounds')
    })
  })

  describe('getBit', () => {
    it('should get bit value', () => {
      const testMemory = setBit(memory, 1, 5, 1)
      expect(getBit(testMemory, 1, 5)).toBe(1)
    })

    it('should return 0 for unset bit', () => {
      expect(getBit(memory, 0, 0)).toBe(0)
    })

    it('should throw error for out of bounds address', () => {
      expect(() => getBit(memory, 10, 0)).toThrow('Address 10 out of bounds')
    })
  })

  describe('flipBit', () => {
    it('should flip bit from 0 to 1', () => {
      const newMemory = flipBit(memory, 0, 3)
      expect(getBit(newMemory, 0, 3)).toBe(1)
    })

    it('should flip bit from 1 to 0', () => {
      const testMemory = setBit(memory, 0, 6, 1)
      const newMemory = flipBit(testMemory, 0, 6)
      expect(getBit(newMemory, 0, 6)).toBe(0)
    })
  })

  describe('setByte', () => {
    it('should set byte value', () => {
      const newMemory = setByte(memory, 1, 255)
      expect(getByte(newMemory, 1)).toBe(255)
    })

    it('should mask values larger than 255', () => {
      const newMemory = setByte(memory, 0, 256)
      expect(getByte(newMemory, 0)).toBe(0)
    })

    it('should throw error for out of bounds address', () => {
      expect(() => setByte(memory, 10, 255)).toThrow('Address 10 out of bounds')
    })
  })

  describe('getByte', () => {
    it('should get byte value', () => {
      const testMemory = setByte(memory, 2, 128)
      expect(getByte(testMemory, 2)).toBe(128)
    })

    it('should throw error for out of bounds address', () => {
      expect(() => getByte(memory, 10)).toThrow('Address 10 out of bounds')
    })
  })

  describe('setBits', () => {
    it('should set multiple bits', () => {
      const operations = [
        { address: 0 as ByteAddress, bitPosition: 0 as BitPosition, value: 1 as Bit },
        { address: 0 as ByteAddress, bitPosition: 2 as BitPosition, value: 1 as Bit }
      ]
      const newMemory = setBits(memory, operations)
      expect(getBit(newMemory, 0, 0)).toBe(1)
      expect(getBit(newMemory, 0, 2)).toBe(1)
    })

    it('should handle empty operations array', () => {
      const operations: Array<{ address: ByteAddress; bitPosition: BitPosition; value: Bit }> = []
      const result = setBits(memory, operations)
      expect(result).toEqual(memory)
    })
  })

  describe('getBits', () => {
    it('should get multiple bits', () => {
      const testMemory = setBits(memory, [
        { address: 0, bitPosition: 1, value: 1 },
        { address: 0, bitPosition: 3, value: 1 }
      ])
      const positions = [
        { address: 0 as ByteAddress, bitPosition: 1 as BitPosition },
        { address: 0 as ByteAddress, bitPosition: 3 as BitPosition }
      ]
      const result = getBits(testMemory, positions)
      expect(result).toEqual([1, 1])
    })

    it('should handle empty positions array', () => {
      const positions: Array<{ address: ByteAddress; bitPosition: BitPosition }> = []
      const result = getBits(memory, positions)
      expect(result).toEqual([])
    })
  })

  describe('byteToBits', () => {
    it('should convert byte to bit array (LSB-first)', () => {
      const bits = byteToBits(170) // 0b10101010
      expect(bits).toEqual([0, 1, 0, 1, 0, 1, 0, 1]) // LSB-first: bit 0,1,2,3,4,5,6,7
    })

    it('should convert zero byte to all zeros', () => {
      const bits = byteToBits(0)
      expect(bits).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
    })
  })

  describe('bitsToByte', () => {
    it('should convert bit array to byte (LSB-first)', () => {
      const bits: Bit[] = [0, 1, 0, 1, 0, 1, 0, 1] // LSB-first representation
      const byte = bitsToByte(bits)
      expect(byte).toBe(170) // 0b10101010
    })

    it('should throw error for invalid bit array length', () => {
      const invalidBits: Bit[] = [1, 0, 1] // Only 3 bits
      expect(() => bitsToByte(invalidBits)).toThrow('Must provide exactly 8 bits')
    })
  })

  describe('getMemoryBits', () => {
    it('should get bits from memory address (LSB-first)', () => {
      const testMemory = setByte(memory, 0, 204) // 0b11001100
      const bits = getMemoryBits(testMemory, 0)
      expect(bits).toEqual([0, 0, 1, 1, 0, 0, 1, 1]) // LSB-first representation
    })
  })

  describe('setMemoryBits', () => {
    it('should set bits in memory address (LSB-first)', () => {
      const bits: Bit[] = [0, 0, 1, 1, 0, 0, 1, 1] // LSB-first representation
      const newMemory = setMemoryBits(memory, 0, bits)
      expect(getByte(newMemory, 0)).toBe(204) // 0b11001100
    })
  })

  describe('countSetBits', () => {
    it('should count set bits in memory', () => {
      let testMemory = setByte(memory, 0, 170) // 4 bits set
      testMemory = setByte(testMemory, 1, 15)  // 4 bits set
      const count = countSetBits(testMemory)
      expect(count).toBe(8)
    })

    it('should return zero for empty memory', () => {
      const emptyMemory = createBitMemory(0)
      expect(countSetBits(emptyMemory)).toBe(0)
    })
  })

  describe('findFirstSetBit', () => {
    it('should find first set bit', () => {
      const testMemory = setBit(memory, 1, 3, 1)
      const result = findFirstSetBit(testMemory)
      expect(result).toEqual({ address: 1, bitPosition: 3 })
    })

    it('should return null when no bits are set', () => {
      const result = findFirstSetBit(memory)
      expect(result).toBeNull()
    })

    it('should find earliest address when multiple bits are set', () => {
      let testMemory = setBit(memory, 3, 7, 1) // Set later byte
      testMemory = setBit(testMemory, 1, 2, 1) // Set earlier byte
      const result = findFirstSetBit(testMemory)
      expect(result).toEqual({ address: 1, bitPosition: 2 })
    })
  })

  describe('getMemorySize', () => {
    it('should return memory size in bytes', () => {
      expect(getMemorySize(memory)).toBe(4)
    })
  })

  describe('getTotalBitCapacity', () => {
    it('should return total bit capacity', () => {
      expect(getTotalBitCapacity(memory)).toBe(32)
    })
  })

  describe('memoryToHex', () => {
    it('should format memory as hex string', () => {
      let testMemory = setByte(memory, 0, 255)
      testMemory = setByte(testMemory, 1, 128)
      const hex = memoryToHex(testMemory)
      expect(hex).toBe('ff 80 00 00')
    })
  })

  describe('memoryToBinary', () => {
    it('should format memory as binary string', () => {
      const testMemory = setByte(memory, 0, 170) // 0b10101010
      const binary = memoryToBinary(testMemory)
      expect(binary).toBe('10101010 00000000 00000000 00000000')
    })
  })

  describe('isValidBitPosition', () => {
    it('should validate valid bit positions', () => {
      expect(isValidBitPosition(0)).toBe(true)
      expect(isValidBitPosition(7)).toBe(true)
    })

    it('should reject invalid bit positions', () => {
      expect(isValidBitPosition(8)).toBe(false)
      expect(isValidBitPosition(-1)).toBe(false)
      expect(isValidBitPosition(3.5)).toBe(false)
    })
  })

  describe('isInvalidBitPosition', () => {
    describe('bit position validation scenarios', () => {
      const scenarios = [
        {
          name: 'valid integer positions within range',
          values: [0, 1, 2, 3, 4, 5, 6, 7],
          expected: false
        },
        {
          name: 'boundary values (exact boundaries, valid)',
          values: [0, 7],
          expected: false
        },
        {
          name: 'out of range (below minimum)',
          values: [-1, -5, -100],
          expected: true
        },
        {
          name: 'out of range (above maximum)',
          values: [8, 9, 15, 100],
          expected: true
        },
        {
          name: 'non-integers within valid range',
          values: [0.5, 3.14, 6.99, 7.1],
          expected: true
        },
        {
          name: 'non-integers outside valid range',
          values: [-1.5, 8.5, 10.75],
          expected: true
        },
        {
          name: 'special numeric values',
          values: [NaN, Infinity, -Infinity],
          expected: true
        },
        {
          name: 'boundary values (just below/above)',
          values: [-0.1, 7.1],
          expected: true
        },
        {
          name: 'very large and very small numbers',
          values: [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 1e10, -1e10],
          expected: true
        }
      ]

      scenarios.forEach(({ name, values, expected }) => {
        it(`should return ${expected} for ${name}`, () => {
          values.forEach(value => {
            expect(isInvalidBitPosition(value)).toBe(expected)
          })
        })
      })
    })

    describe('type compatibility', () => {
      it('should be inverse of isValidBitPosition for integers', () => {
        const testValues = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        testValues.forEach(value => {
          expect(isInvalidBitPosition(value)).toBe(!isValidBitPosition(value))
        })
      })

      it('should return true for non-integer values', () => {
        const nonIntegerValues = [0.1, 0.9, 1.5, 3.14, 6.9, 7.1]
        nonIntegerValues.forEach(value => {
          expect(isInvalidBitPosition(value)).toBe(true)
          expect(isValidBitPosition(value)).toBe(false)
        })
      })
    })
  })

  describe('isValidAddress', () => {
    it('should validate valid addresses', () => {
      expect(isValidAddress(memory, 0)).toBe(true)
      expect(isValidAddress(memory, 3)).toBe(true)
    })

    it('should reject invalid addresses', () => {
      expect(isValidAddress(memory, 4)).toBe(false)
      expect(isValidAddress(memory, -1)).toBe(false)
    })
  })

  describe('isValidBit', () => {
    it('should validate valid bit values', () => {
      expect(isValidBit(0)).toBe(true)
      expect(isValidBit(1)).toBe(true)
    })

    it('should reject invalid bit values', () => {
      expect(isValidBit(2)).toBe(false)
      expect(isValidBit('1')).toBe(false)
      expect(isValidBit(true)).toBe(false)
      expect(isValidBit(null)).toBe(false)
    })
  })
})
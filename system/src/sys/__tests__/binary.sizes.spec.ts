import { describe, it, expect, beforeEach } from 'vitest'
import {
  type BitMemory,
  type BitPosition,
  createBitMemory,
  setBit,
  getBit,
  setByte,
  getByte,
  flipBit,
  countSetBits,
  findFirstSetBit,
  getMemorySize,
  getTotalBitCapacity,
  memoryToHex,
  memoryToBinary,
  isValidAddress
} from '../binary'

describe('binary memory sizes and extreme cases', () => {
  describe('minimal memory (1 byte)', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1)
    })

    it('should handle 1 byte memory correctly', () => {
      expect(getMemorySize(memory)).toBe(1)
      expect(getTotalBitCapacity(memory)).toBe(8)
    })

    it('should set and get all 8 bit positions', () => {
      let testMemory = memory
      
      // Set all bits to 1
      for (let bitPos = 0; bitPos <= 7; bitPos++) {
        testMemory = setBit(testMemory, 0, bitPos as BitPosition, 1)
        expect(getBit(testMemory, 0, bitPos as BitPosition)).toBe(1)
      }
      
      expect(getByte(testMemory, 0)).toBe(255) // All bits set: 0b11111111
      expect(countSetBits(testMemory)).toBe(8)
    })

    it('should handle bit flipping in 1 byte', () => {
      let testMemory = setBit(memory, 0, 4, 1)
      expect(getBit(testMemory, 0, 4)).toBe(1)
      
      testMemory = flipBit(testMemory, 0, 4)
      expect(getBit(testMemory, 0, 4)).toBe(0)
    })

    it('should find first set bit in 1 byte memory', () => {
      const testMemory = setBit(memory, 0, 5, 1)
      const result = findFirstSetBit(testMemory)
      expect(result).toEqual({ address: 0, bitPosition: 5 })
    })

    it('should format 1 byte memory correctly', () => {
      const testMemory = setByte(memory, 0, 170) // 0b10101010
      expect(memoryToHex(testMemory)).toBe('aa')
      expect(memoryToBinary(testMemory)).toBe('10101010')
    })
  })

  describe('empty memory (0 bytes)', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(0)
    })

    it('should handle empty memory correctly', () => {
      expect(getMemorySize(memory)).toBe(0)
      expect(getTotalBitCapacity(memory)).toBe(0)
      expect(countSetBits(memory)).toBe(0)
      expect(findFirstSetBit(memory)).toBeNull()
    })

    it('should format empty memory correctly', () => {
      expect(memoryToHex(memory)).toBe('')
      expect(memoryToBinary(memory)).toBe('')
    })

    it('should validate addresses correctly for empty memory', () => {
      expect(isValidAddress(memory, 0)).toBe(false)
      expect(isValidAddress(memory, -1)).toBe(false)
    })

    it('should throw errors for operations on empty memory', () => {
      expect(() => setBit(memory, 0, 0, 1)).toThrow('Address 0 out of bounds')
      expect(() => getBit(memory, 0, 0)).toThrow('Address 0 out of bounds')
      expect(() => setByte(memory, 0, 255)).toThrow('Address 0 out of bounds')
      expect(() => getByte(memory, 0)).toThrow('Address 0 out of bounds')
    })
  })

  describe('large memory (1KB)', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024) // 1KB = 8192 bits
    })

    it('should handle large memory correctly', () => {
      expect(getMemorySize(memory)).toBe(1024)
      expect(getTotalBitCapacity(memory)).toBe(8192)
    })

    it('should handle operations at memory boundaries', () => {
      // Test first bit
      let testMemory = setBit(memory, 0, 0, 1)
      expect(getBit(testMemory, 0, 0)).toBe(1)
      
      // Test last bit
      testMemory = setBit(testMemory, 1023, 7, 1)
      expect(getBit(testMemory, 1023, 7)).toBe(1)
      
      // Test middle bit
      testMemory = setBit(testMemory, 512, 3, 1)
      expect(getBit(testMemory, 512, 3)).toBe(1)
      
      expect(countSetBits(testMemory)).toBe(3)
    })

    it('should find first set bit in large memory', () => {
      // Set a bit in the middle
      const testMemory = setBit(memory, 500, 2, 1)
      const result = findFirstSetBit(testMemory)
      expect(result).toEqual({ address: 500, bitPosition: 2 })
    })

    it('should handle large memory address validation', () => {
      expect(isValidAddress(memory, 0)).toBe(true)
      expect(isValidAddress(memory, 1023)).toBe(true)
      expect(isValidAddress(memory, 1024)).toBe(false)
      expect(isValidAddress(memory, -1)).toBe(false)
    })
  })

  describe('very large memory (1MB)', () => {
    let memory: BitMemory

    beforeEach(() => {
      memory = createBitMemory(1024 * 1024) // 1MB = 8,388,608 bits
    })

    it('should handle very large memory correctly', () => {
      expect(getMemorySize(memory)).toBe(1048576)
      expect(getTotalBitCapacity(memory)).toBe(8388608)
    })

    it('should handle operations on very large memory', () => {
      const maxAddress = 1048575 // 1MB - 1
      
      // Test boundary operations
      let testMemory = setBit(memory, 0, 0, 1)          // First bit
      testMemory = setBit(testMemory, maxAddress, 7, 1) // Last bit
      testMemory = setBit(testMemory, 524288, 4, 1)     // Middle bit
      
      expect(getBit(testMemory, 0, 0)).toBe(1)
      expect(getBit(testMemory, maxAddress, 7)).toBe(1)
      expect(getBit(testMemory, 524288, 4)).toBe(1)
      expect(countSetBits(testMemory)).toBe(3)
    })

    it('should handle address validation for very large memory', () => {
      expect(isValidAddress(memory, 0)).toBe(true)
      expect(isValidAddress(memory, 1048575)).toBe(true)
      expect(isValidAddress(memory, 1048576)).toBe(false)
    })
  })

  describe('power-of-2 memory sizes', () => {
    const powerOf2Sizes = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]

    powerOf2Sizes.forEach(size => {
      it(`should handle ${size} byte memory correctly`, () => {
        const memory = createBitMemory(size)
        
        expect(getMemorySize(memory)).toBe(size)
        expect(getTotalBitCapacity(memory)).toBe(size * 8)
        
        // Test first and last addressable positions
        const lastAddress = size - 1
        
        let testMemory = setBit(memory, 0, 0, 1)
        if (size > 1) {
          testMemory = setBit(testMemory, lastAddress, 7, 1)
        }
        
        expect(getBit(testMemory, 0, 0)).toBe(1)
        if (size > 1) {
          expect(getBit(testMemory, lastAddress, 7)).toBe(1)
          expect(countSetBits(testMemory)).toBe(2)
        } else {
          expect(countSetBits(testMemory)).toBe(1)
        }
      })
    })
  })

  describe('odd memory sizes', () => {
    const oddSizes = [3, 5, 7, 9, 13, 17, 23, 31, 63, 127, 255]

    oddSizes.forEach(size => {
      it(`should handle ${size} byte memory correctly`, () => {
        const memory = createBitMemory(size)
        
        expect(getMemorySize(memory)).toBe(size)
        expect(getTotalBitCapacity(memory)).toBe(size * 8)
        
        // Test operations across the memory
        const middleAddress = Math.floor(size / 2)
        const lastAddress = size - 1
        
        let testMemory = setBit(memory, 0, 1, 1)               // First byte
        testMemory = setBit(testMemory, middleAddress, 3, 1)   // Middle byte
        testMemory = setBit(testMemory, lastAddress, 6, 1)     // Last byte
        
        expect(getBit(testMemory, 0, 1)).toBe(1)
        expect(getBit(testMemory, middleAddress, 3)).toBe(1)
        expect(getBit(testMemory, lastAddress, 6)).toBe(1)
        expect(countSetBits(testMemory)).toBe(3)
      })
    })
  })

  describe('boundary conditions', () => {
    it('should handle maximum safe integer size', () => {
      // Test with a reasonably large size that won't cause memory issues
      const largeSize = 10000 // 10KB
      const memory = createBitMemory(largeSize)
      
      expect(getMemorySize(memory)).toBe(largeSize)
      expect(getTotalBitCapacity(memory)).toBe(largeSize * 8)
      
      // Test sparse bit setting
      let testMemory = setBit(memory, 0, 0, 1)
      testMemory = setBit(testMemory, largeSize - 1, 7, 1)
      
      expect(getBit(testMemory, 0, 0)).toBe(1)
      expect(getBit(testMemory, largeSize - 1, 7)).toBe(1)
      expect(countSetBits(testMemory)).toBe(2)
    })

    it('should handle dense bit patterns in various memory sizes', () => {
      const sizes = [1, 8, 64, 256]
      
      sizes.forEach(size => {
        const memory = createBitMemory(size)
        let testMemory = memory
        
        // Set every other bit in first byte
        for (let bitPos = 0; bitPos < 8; bitPos += 2) {
          testMemory = setBit(testMemory, 0, bitPos as BitPosition, 1)
        }
        
        expect(getByte(testMemory, 0)).toBe(85) // 0b01010101
        
        // Verify pattern
        expect(getBit(testMemory, 0, 0)).toBe(1)
        expect(getBit(testMemory, 0, 1)).toBe(0)
        expect(getBit(testMemory, 0, 2)).toBe(1)
        expect(getBit(testMemory, 0, 3)).toBe(0)
      })
    })

    it('should handle all-ones and all-zeros patterns', () => {
      const sizes = [1, 4, 16, 64]
      
      sizes.forEach(size => {
        const memory = createBitMemory(size)
        
        // Test all zeros (default state)
        expect(countSetBits(memory)).toBe(0)
        expect(findFirstSetBit(memory)).toBeNull()
        
        // Test all ones
        let testMemory = memory
        for (let addr = 0; addr < size; addr++) {
          testMemory = setByte(testMemory, addr, 255)
        }
        
        expect(countSetBits(testMemory)).toBe(size * 8)
        expect(findFirstSetBit(testMemory)).toEqual({ address: 0, bitPosition: 0 })
      })
    })
  })
})
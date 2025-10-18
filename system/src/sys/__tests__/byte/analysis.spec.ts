import { describe, it, expect } from 'vitest'
import { unsafeByte } from '../../byte/core'
import {
    countSetBits,
    countClearBits,
    findFirstSetBit,
    findLastSetBit,
    findAllSetBits,
    findAllClearBits,
    isInRange,
    areAllBitsSet,
    areAllBitsClear,
    isPowerOfTwo,
    hammingWeight,
    hammingDistance,
} from '../../byte/analysis'

describe('Byte Analysis Domain', () => {
    describe('bit counting operations', () => {
        it('should count set bits correctly', () => {
            expect(countSetBits(unsafeByte(0b00000000))).toBe(0)  // 0
            expect(countSetBits(unsafeByte(0b11111111))).toBe(8)  // 255
            expect(countSetBits(unsafeByte(0b10101010))).toBe(4)  // 170
            expect(countSetBits(unsafeByte(0b01010101))).toBe(4)  // 85
            expect(countSetBits(unsafeByte(0b00000001))).toBe(1)  // 1
            expect(countSetBits(unsafeByte(0b10000000))).toBe(1)  // 128
        })

        it('should count clear bits correctly', () => {
            expect(countClearBits(unsafeByte(0b00000000))).toBe(8)  // All clear
            expect(countClearBits(unsafeByte(0b11111111))).toBe(0)  // None clear
            expect(countClearBits(unsafeByte(0b10101010))).toBe(4)  // 4 clear
            expect(countClearBits(unsafeByte(0b01010101))).toBe(4)  // 4 clear
        })

        it('should satisfy set + clear = 8', () => {
            const testValues = [0, 1, 15, 85, 170, 240, 255]

            testValues.forEach(value => {
                const byte = unsafeByte(value)
                const setBits = countSetBits(byte)
                const clearBits = countClearBits(byte)

                expect(setBits + clearBits).toBe(8)
            })
        })

        it('should match hamming weight', () => {
            const testValues = [0, 1, 15, 85, 170, 240, 255]

            testValues.forEach(value => {
                const byte = unsafeByte(value)
                expect(countSetBits(byte)).toBe(hammingWeight(byte))
            })
        })
    })

    describe('bit position finding', () => {
        it('should find first set bit (rightmost)', () => {
            expect(findFirstSetBit(unsafeByte(0b00000001))).toBe(0)  // Position 0
            expect(findFirstSetBit(unsafeByte(0b00000010))).toBe(1)  // Position 1
            expect(findFirstSetBit(unsafeByte(0b00000100))).toBe(2)  // Position 2
            expect(findFirstSetBit(unsafeByte(0b10000000))).toBe(7)  // Position 7
            expect(findFirstSetBit(unsafeByte(0b10101010))).toBe(1)  // First set bit
            expect(findFirstSetBit(unsafeByte(0b00000000))).toBe(-1) // No set bits
        })

        it('should find last set bit (leftmost)', () => {
            expect(findLastSetBit(unsafeByte(0b00000001))).toBe(0)  // Position 0
            expect(findLastSetBit(unsafeByte(0b00000010))).toBe(1)  // Position 1
            expect(findLastSetBit(unsafeByte(0b10000000))).toBe(7)  // Position 7
            expect(findLastSetBit(unsafeByte(0b10101010))).toBe(7)  // Last set bit
            expect(findLastSetBit(unsafeByte(0b01010101))).toBe(6)  // Last set bit
            expect(findLastSetBit(unsafeByte(0b00000000))).toBe(-1) // No set bits
        })

        it('should find all set bit positions', () => {
            expect(findAllSetBits(unsafeByte(0b00000000))).toEqual([])
            expect(findAllSetBits(unsafeByte(0b11111111))).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
            expect(findAllSetBits(unsafeByte(0b10101010))).toEqual([1, 3, 5, 7])
            expect(findAllSetBits(unsafeByte(0b01010101))).toEqual([0, 2, 4, 6])
            expect(findAllSetBits(unsafeByte(0b00000001))).toEqual([0])
            expect(findAllSetBits(unsafeByte(0b10000000))).toEqual([7])
        })

        it('should find all clear bit positions', () => {
            expect(findAllClearBits(unsafeByte(0b11111111))).toEqual([])
            expect(findAllClearBits(unsafeByte(0b00000000))).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
            expect(findAllClearBits(unsafeByte(0b10101010))).toEqual([0, 2, 4, 6])
            expect(findAllClearBits(unsafeByte(0b01010101))).toEqual([1, 3, 5, 7])
            expect(findAllClearBits(unsafeByte(0b11111110))).toEqual([0])
            expect(findAllClearBits(unsafeByte(0b01111111))).toEqual([7])
        })

        it('should have complementary set and clear positions', () => {
            const testValues = [0, 85, 170, 255]

            testValues.forEach(value => {
                const byte = unsafeByte(value)
                const setBits = findAllSetBits(byte)
                const clearBits = findAllClearBits(byte)

                // All positions should be accounted for
                const allPositions = [...setBits, ...clearBits].sort((a, b) => a - b)
                expect(allPositions).toEqual([0, 1, 2, 3, 4, 5, 6, 7])

                // No overlaps
                const intersection = setBits.filter(pos => clearBits.includes(pos))
                expect(intersection).toEqual([])
            })
        })
    })

    describe('range and boundary checks', () => {
        it('should check if byte is in range', () => {
            const min = unsafeByte(10)
            const max = unsafeByte(20)

            expect(isInRange(unsafeByte(5), min, max)).toBe(false)   // Below range
            expect(isInRange(unsafeByte(10), min, max)).toBe(true)  // At min
            expect(isInRange(unsafeByte(15), min, max)).toBe(true)  // In range
            expect(isInRange(unsafeByte(20), min, max)).toBe(true)  // At max
            expect(isInRange(unsafeByte(25), min, max)).toBe(false) // Above range
        })

        it('should check if all bits are set', () => {
            expect(areAllBitsSet(unsafeByte(255))).toBe(true)  // 0b11111111
            expect(areAllBitsSet(unsafeByte(254))).toBe(false) // 0b11111110
            expect(areAllBitsSet(unsafeByte(0))).toBe(false)   // 0b00000000
            expect(areAllBitsSet(unsafeByte(127))).toBe(false) // 0b01111111
        })

        it('should check if all bits are clear', () => {
            expect(areAllBitsClear(unsafeByte(0))).toBe(true)    // 0b00000000
            expect(areAllBitsClear(unsafeByte(1))).toBe(false)   // 0b00000001
            expect(areAllBitsClear(unsafeByte(255))).toBe(false) // 0b11111111
            expect(areAllBitsClear(unsafeByte(128))).toBe(false) // 0b10000000
        })

        it('should check if byte is power of two', () => {
            // Powers of 2: 1, 2, 4, 8, 16, 32, 64, 128
            expect(isPowerOfTwo(unsafeByte(1))).toBe(true)     // 2^0
            expect(isPowerOfTwo(unsafeByte(2))).toBe(true)     // 2^1
            expect(isPowerOfTwo(unsafeByte(4))).toBe(true)     // 2^2
            expect(isPowerOfTwo(unsafeByte(8))).toBe(true)     // 2^3
            expect(isPowerOfTwo(unsafeByte(16))).toBe(true)    // 2^4
            expect(isPowerOfTwo(unsafeByte(32))).toBe(true)    // 2^5
            expect(isPowerOfTwo(unsafeByte(64))).toBe(true)    // 2^6
            expect(isPowerOfTwo(unsafeByte(128))).toBe(true)   // 2^7

            // Not powers of 2
            expect(isPowerOfTwo(unsafeByte(0))).toBe(false)    // Special case
            expect(isPowerOfTwo(unsafeByte(3))).toBe(false)
            expect(isPowerOfTwo(unsafeByte(5))).toBe(false)
            expect(isPowerOfTwo(unsafeByte(6))).toBe(false)
            expect(isPowerOfTwo(unsafeByte(7))).toBe(false)
            expect(isPowerOfTwo(unsafeByte(9))).toBe(false)
            expect(isPowerOfTwo(unsafeByte(15))).toBe(false)
            expect(isPowerOfTwo(unsafeByte(255))).toBe(false)
        })

        it('should identify powers of 2 as having exactly one set bit', () => {
            const powersOfTwo = [1, 2, 4, 8, 16, 32, 64, 128]

            powersOfTwo.forEach(value => {
                const byte = unsafeByte(value)
                expect(isPowerOfTwo(byte)).toBe(true)
                expect(countSetBits(byte)).toBe(1)
            })
        })
    })

    describe('hamming distance calculations', () => {
        it('should calculate hamming distance correctly', () => {
            const a = unsafeByte(0b10101010) // 170
            const b = unsafeByte(0b01010101) // 85

            // All bits differ
            expect(hammingDistance(a, b)).toBe(8)
        })

        it('should return 0 for identical bytes', () => {
            const byte = unsafeByte(123)
            expect(hammingDistance(byte, byte)).toBe(0)
        })

        it('should be symmetric', () => {
            const a = unsafeByte(100)
            const b = unsafeByte(200)

            expect(hammingDistance(a, b)).toBe(hammingDistance(b, a))
        })

        it('should calculate specific hamming distances', () => {
            // Test cases with known distances
            expect(hammingDistance(unsafeByte(0b00000000), unsafeByte(0b11111111))).toBe(8)
            expect(hammingDistance(unsafeByte(0b00000001), unsafeByte(0b00000010))).toBe(2)
            expect(hammingDistance(unsafeByte(0b11110000), unsafeByte(0b00001111))).toBe(8)
            expect(hammingDistance(unsafeByte(0b10101010), unsafeByte(0b10101011))).toBe(1)
        })

        it('should satisfy triangle inequality', () => {
            const a = unsafeByte(100)
            const b = unsafeByte(150)
            const c = unsafeByte(200)

            const ab = hammingDistance(a, b)
            const bc = hammingDistance(b, c)
            const ac = hammingDistance(a, c)

            // Triangle inequality: d(a,c) <= d(a,b) + d(b,c)
            expect(ac).toBeLessThanOrEqual(ab + bc)
        })
    })

    describe('comprehensive analysis', () => {
        it('should analyze specific byte patterns', () => {
            const alternating1 = unsafeByte(0b10101010) // 170
            const alternating2 = unsafeByte(0b01010101) // 85

            // Alternating patterns should have 4 set bits each
            expect(countSetBits(alternating1)).toBe(4)
            expect(countSetBits(alternating2)).toBe(4)

            // Should not be powers of 2
            expect(isPowerOfTwo(alternating1)).toBe(false)
            expect(isPowerOfTwo(alternating2)).toBe(false)

            // Maximum hamming distance for 8-bit values
            expect(hammingDistance(alternating1, alternating2)).toBe(8)
        })

        it('should analyze edge cases', () => {
            const zero = unsafeByte(0)
            const max = unsafeByte(255)

            // Zero analysis
            expect(countSetBits(zero)).toBe(0)
            expect(countClearBits(zero)).toBe(8)
            expect(findFirstSetBit(zero)).toBe(-1)
            expect(findLastSetBit(zero)).toBe(-1)
            expect(areAllBitsClear(zero)).toBe(true)
            expect(areAllBitsSet(zero)).toBe(false)
            expect(isPowerOfTwo(zero)).toBe(false)

            // Max analysis
            expect(countSetBits(max)).toBe(8)
            expect(countClearBits(max)).toBe(0)
            expect(findFirstSetBit(max)).toBe(0)
            expect(findLastSetBit(max)).toBe(7)
            expect(areAllBitsClear(max)).toBe(false)
            expect(areAllBitsSet(max)).toBe(true)
            expect(isPowerOfTwo(max)).toBe(false)

            // Maximum hamming distance
            expect(hammingDistance(zero, max)).toBe(8)
        })

        it('should maintain consistency across all analysis functions', () => {
            const testValues = [0, 1, 15, 85, 128, 170, 240, 255]

            testValues.forEach(value => {
                const byte = unsafeByte(value)

                // Set + clear bits should equal 8
                expect(countSetBits(byte) + countClearBits(byte)).toBe(8)

                // Set bit positions should match count
                expect(findAllSetBits(byte).length).toBe(countSetBits(byte))

                // Clear bit positions should match count
                expect(findAllClearBits(byte).length).toBe(countClearBits(byte))

                // Powers of 2 should have exactly 1 set bit (except 0)
                if (isPowerOfTwo(byte)) {
                    expect(countSetBits(byte)).toBe(1)
                }

                // All bits set/clear should match bit counts
                if (areAllBitsSet(byte)) {
                    expect(countSetBits(byte)).toBe(8)
                }
                if (areAllBitsClear(byte)) {
                    expect(countSetBits(byte)).toBe(0)
                }
            })
        })
    })
})
import { describe, it, expect } from 'vitest'
import { unsafeByte, byteToNumberValue } from '../../byte/core'
import {
    mapBitsInByte,
    reduceBitsInByte,
    filterBitsInByte,
    everyBitInByte,
    someBitInByte,
    foldLeftByte,
    foldRightByte,
    foldByte,
    forEachBitInByte,
    forEachBitInByteReverse,
    transformByte,
    zipBytes,
} from '../../byte/functional'
import { getBitFromByteAt } from '@/sys/byte/bits'
import type { BitPosition } from '@/sys/bit/bit.position'

describe('Functional Composition Domain', () => {
    describe('map operations', () => {
        it('should map bits with transformation function', () => {
            const byte = unsafeByte(0b10101010) // 170

            // Flip all bits
            const flipped = mapBitsInByte(byte, (bit) => (bit === 0 ? 1 : 0) as any)
            expect(byteToNumberValue(flipped)).toBe(0b01010101) // 85

            // Identity mapping
            const identity = mapBitsInByte(byte, (bit) => bit)
            expect(identity).toBe(byte)

            // Always set to 1
            const allOnes = mapBitsInByte(byte, () => 1 as any)
            expect(byteToNumberValue(allOnes)).toBe(255)
        })

        it('should provide position information in mapper', () => {
            const byte = unsafeByte(0b00000000)
            const positions: number[] = []

            mapBitsInByte(byte, (bit, position) => {
                positions.push(position)
                return bit
            })

            expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
        })

        it('should create selective patterns', () => {
            const byte = unsafeByte(0)

            // Set bits at even positions
            const evenBits = mapBitsInByte(byte, (bit, position) => (position % 2 === 0 ? 1 : 0) as any)
            expect(byteToNumberValue(evenBits)).toBe(0b01010101) // 85

            // Set bits at odd positions  
            const oddBits = mapBitsInByte(byte, (bit, position) => (position % 2 === 1 ? 1 : 0) as any)
            expect(byteToNumberValue(oddBits)).toBe(0b10101010) // 170
        })
    })

    describe('reduce operations', () => {
        it('should reduce bits to count set bits', () => {
            const byte = unsafeByte(0b10101010) // 4 set bits

            const count = reduceBitsInByte(byte, (acc, bit) => acc + bit, 0)
            expect(count).toBe(4)
        })

        it('should reduce bits to calculate weighted sum', () => {
            const byte = unsafeByte(0b00000101) // bits at positions 0 and 2

            const weightedSum = reduceBitsInByte(byte, (acc, bit, position) =>
                acc + (bit * Math.pow(2, position)), 0)
            expect(weightedSum).toBe(5) // 1*2^0 + 0*2^1 + 1*2^2 = 1 + 0 + 4 = 5
        })

        it('should reduce bits to find first set position', () => {
            const byte = unsafeByte(0b00001000) // bit at position 3

            const firstSet = reduceBitsInByte(byte, (acc, bit, position) =>
                acc === -1 && bit === 1 ? position : acc, -1)
            expect(firstSet).toBe(3)
        })

        it('should handle empty reduction', () => {
            const byte = unsafeByte(0b00000000)

            const anySet = reduceBitsInByte(byte, (acc, bit) => acc || bit === 1, false)
            expect(anySet).toBe(false)
        })
    })

    describe('filter operations', () => {
        it('should filter set bits', () => {
            const byte = unsafeByte(0b10101010) // bits at positions 1, 3, 5, 7

            const setBitPositions = filterBitsInByte(byte, (bit) => bit === 1)
            expect(setBitPositions).toEqual([1, 3, 5, 7])
        })

        it('should filter clear bits', () => {
            const byte = unsafeByte(0b10101010) // bits at positions 0, 2, 4, 6 are clear

            const clearBitPositions = filterBitsInByte(byte, (bit) => bit === 0)
            expect(clearBitPositions).toEqual([0, 2, 4, 6])
        })

        it('should filter by position', () => {
            const byte = unsafeByte(0b11111111)

            // Even positions
            const evenPositions = filterBitsInByte(byte, (bit, position) => position % 2 === 0)
            expect(evenPositions).toEqual([0, 2, 4, 6])

            // Odd positions
            const oddPositions = filterBitsInByte(byte, (bit, position) => position % 2 === 1)
            expect(oddPositions).toEqual([1, 3, 5, 7])
        })

        it('should filter by complex conditions', () => {
            const byte = unsafeByte(0b10101010) // alternating pattern

            // Set bits at even positions (should be empty for this pattern)
            const setBitsAtEven = filterBitsInByte(byte, (bit, position) =>
                bit === 1 && position % 2 === 0)
            expect(setBitsAtEven).toEqual([])

            // Set bits at odd positions
            const setBitsAtOdd = filterBitsInByte(byte, (bit, position) =>
                bit === 1 && position % 2 === 1)
            expect(setBitsAtOdd).toEqual([1, 3, 5, 7])
        })
    })

    describe('quantifier operations', () => {
        it('should check if every bit satisfies condition', () => {
            const allOnes = unsafeByte(0b11111111)
            const allZeros = unsafeByte(0b00000000)
            const mixed = unsafeByte(0b10101010)

            expect(everyBitInByte(allOnes, (bit) => bit === 1)).toBe(true)
            expect(everyBitInByte(allZeros, (bit) => bit === 0)).toBe(true)
            expect(everyBitInByte(mixed, (bit) => bit === 1)).toBe(false)
            expect(everyBitInByte(mixed, (bit) => bit === 0)).toBe(false)
        })

        it('should check if some bits satisfy condition', () => {
            const allOnes = unsafeByte(0b11111111)
            const allZeros = unsafeByte(0b00000000)
            const mixed = unsafeByte(0b10101010)

            expect(someBitInByte(allOnes, (bit) => bit === 1)).toBe(true)
            expect(someBitInByte(allZeros, (bit) => bit === 1)).toBe(false)
            expect(someBitInByte(mixed, (bit) => bit === 1)).toBe(true)
            expect(someBitInByte(mixed, (bit) => bit === 0)).toBe(true)
        })

        it('should work with position-based conditions', () => {
            const byte = unsafeByte(0b11111111)

            // Every position is valid
            expect(everyBitInByte(byte, (bit, position) => position >= 0 && position < 8)).toBe(true)

            // Some positions are even
            expect(someBitInByte(byte, (bit, position) => position % 2 === 0)).toBe(true)
        })
    })

    describe('fold operations', () => {
        it('should fold left correctly', () => {
            const byte = unsafeByte(0b00000101) // bits at positions 0 and 2

            // Build string representation (left to right)
            const leftResult = foldLeftByte(byte, (acc, bit, position) =>
                acc + `${bit}`, '')
            expect(leftResult).toBe('10100000') // Position 0,1,2,3,4,5,6,7
        })

        it('should fold right correctly', () => {
            const byte = unsafeByte(0b10100000) // bits at positions 0 and 2

            // Build string representation (right to left)
            const rightResult = foldRightByte(byte, (bit, acc, position) =>
                `${bit}` + acc, '')
            expect(rightResult).toBe('00000101') // Position 7,6,5,4,3,2,1,0
        })

        it('should have fold as alias for foldLeft', () => {
            const byte = unsafeByte(0b10101010)

            const leftResult = foldLeftByte(byte, (acc, bit) => acc + bit, 0)
            const foldResult = foldByte(byte, (acc, bit) => acc + bit, 0)

            expect(leftResult).toBe(foldResult)
        })

        it('should fold to reconstruct byte value', () => {
            const byte = unsafeByte(123) // Any value

            // Reconstruct the byte value using fold
            const reconstructed = foldLeftByte(byte, (acc, bit, position) =>
                acc + (bit << position), 0)

            expect(reconstructed).toBe(byteToNumberValue(byte))
        })
    })

    describe('iteration operations', () => {
        it('should iterate over bits with side effects', () => {
            const byte = unsafeByte(0b10101010)
            const bits: number[] = []
            const positions: number[] = []

            forEachBitInByte(byte, (bit, position) => {
                bits.push(bit)
                positions.push(position)
            })

            expect(bits).toEqual([0, 1, 0, 1, 0, 1, 0, 1])
            expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
        })

        it('should iterate in reverse order', () => {
            const byte = unsafeByte(0b10101010)
            const positions: number[] = []

            forEachBitInByteReverse(byte, (bit, position) => {
                positions.push(position)
            })

            expect(positions).toEqual([7, 6, 5, 4, 3, 2, 1, 0])
        })

        it('should not return values from iteration', () => {
            const byte = unsafeByte(123)

            const result = forEachBitInByte(byte, () => { })
            expect(result).toBeUndefined()
        })
    })

    describe('transformation operations', () => {
        it('should transform bits with position awareness', () => {
            const byte = unsafeByte(0b00000000)

            // Set bits at positions divisible by 3
            const transformed = transformByte(byte, (bit, position) =>
                position % 3 === 0 ? 1 as any : bit)

            // Positions 0, 3, 6 should be set
            expect(byteToNumberValue(transformed)).toBe(0b01001001) // 73
        })

        it('should transform conditionally', () => {
            const byte = unsafeByte(0b11111111)

            // Clear bits at even positions
            const transformed = transformByte(byte, (bit, position) =>
                position % 2 === 0 ? 0 as any : bit)

            expect(byteToNumberValue(transformed)).toBe(0b10101010) // 170
        })

        it('should preserve bits when no transformation needed', () => {
            const byte = unsafeByte(123)

            // Identity transformation
            const transformed = transformByte(byte, (bit) => bit)
            expect(transformed).toBe(byte)
        })
    })

    describe('zip operations', () => {
        it('should zip bytes with AND operation', () => {
            const a = unsafeByte(0b11110000)
            const b = unsafeByte(0b10101010)

            const result = zipBytes(a, b, (bitA, bitB) => (bitA & bitB) as any)
            expect(byteToNumberValue(result)).toBe(0b10100000) // 160
        })

        it('should zip bytes with OR operation', () => {
            const a = unsafeByte(0b11110000)
            const b = unsafeByte(0b00001111)

            const result = zipBytes(a, b, (bitA, bitB) => (bitA | bitB) as any)
            expect(byteToNumberValue(result)).toBe(0b11111111) // 255
        })

        it('should zip bytes with XOR operation', () => {
            const a = unsafeByte(0b11110000)
            const b = unsafeByte(0b10101010)

            const result = zipBytes(a, b, (bitA, bitB) => (bitA ^ bitB) as any)
            expect(byteToNumberValue(result)).toBe(0b01011010) // 90
        })

        it('should zip with position-aware operations', () => {
            const a = unsafeByte(0b11111111)
            const b = unsafeByte(0b00000000)

            // Take bit from 'a' at even positions, 'b' at odd positions
            const result = zipBytes(a, b, (bitA, bitB, position) =>
                position % 2 === 0 ? bitA : bitB)

            expect(byteToNumberValue(result)).toBe(0b01010101) // 85
        })

        it('should be consistent with manual bit operations', () => {
            const a = unsafeByte(123)
            const b = unsafeByte(45)

            // Manual AND
            const manualAnd = byteToNumberValue(a) & byteToNumberValue(b)
            const zippedAnd = byteToNumberValue(zipBytes(a, b, (bitA, bitB) => (bitA & bitB) as any))

            expect(zippedAnd).toBe(manualAnd)
        })
    })

    describe('functional composition', () => {
        it('should chain functional operations', () => {
            const byte = unsafeByte(0b10101010)

            // Count set bits using functional approach
            const setBitCount = reduceBitsInByte(byte, (acc, bit) => acc + bit, 0)

            // Get positions of set bits
            const setBitPositions = filterBitsInByte(byte, (bit) => bit === 1)

            // Verify consistency
            expect(setBitCount).toBe(setBitPositions.length)
            expect(setBitCount).toBe(4)
            expect(setBitPositions).toEqual([1, 3, 5, 7])
        })

        it('should combine operations for complex transformations', () => {
            const byte = unsafeByte(0b11110000)

            // Rotate bits right by 1 (move each bit from position N to position N-1, with wraparound)
            const rotated = mapBitsInByte(byte, (bit, position) => {
                // For right rotation, bit at current position comes from position+1 (with wraparound)
                const sourcePos: BitPosition = (position === 7 ? 0 : position + 1) as BitPosition;
                return getBitFromByteAt(byte, sourcePos) as any
            })

            expect(byteToNumberValue(rotated)).toBe(0b01111000) // Rotated right by 1
        })

        it('should maintain functional purity', () => {
            const originalByte = unsafeByte(123)

            // Multiple operations should not mutate original
            mapBitsInByte(originalByte, (bit) => (bit === 0 ? 1 : 0) as any)
            reduceBitsInByte(originalByte, (acc, bit) => acc + bit, 0)
            filterBitsInByte(originalByte, (bit) => bit === 1)
            transformByte(originalByte, (bit, position) => position % 2 === 0 ? 1 as any : 0 as any)

            // Original should be unchanged
            expect(byteToNumberValue(originalByte)).toBe(123)
        })
    })
})
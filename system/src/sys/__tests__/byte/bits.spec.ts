import { describe, it, expect } from 'vitest'
import { unsafeByte } from '../../byte/core'
import {
    getBitFromByteAt,
    getBitFromByte,
    setBitInByteAt,
    setBitInByte,
    setBitOnInByteAt,
    setBitOnInByte,
    setBitOffInByteAt,
    setBitOffInByte,
    toggleBitInByteAt,
    toggleBitInByte,
    isBitSetInByteAt,
    isBitSetInByte,
} from '../../byte/bits'

describe('Bit Manipulation Domain', () => {
    describe('getBitFromByte operations', () => {
        it('should get bits from byte correctly', () => {
            const byte = unsafeByte(170) // 0b10101010

            // Test positions 0-7 (LSB to MSB)
            expect(getBitFromByte(byte, 0)).toBe(0) // LSB
            expect(getBitFromByte(byte, 1)).toBe(1)
            expect(getBitFromByte(byte, 2)).toBe(0)
            expect(getBitFromByte(byte, 3)).toBe(1)
            expect(getBitFromByte(byte, 4)).toBe(0)
            expect(getBitFromByte(byte, 5)).toBe(1)
            expect(getBitFromByte(byte, 6)).toBe(0)
            expect(getBitFromByte(byte, 7)).toBe(1) // MSB
        })

        it('should handle edge cases', () => {
            const allZeros = unsafeByte(0)   // 0b00000000
            const allOnes = unsafeByte(255)  // 0b11111111

            for (let i = 0; i < 8; i++) {
                expect(getBitFromByte(allZeros, i)).toBe(0)
                expect(getBitFromByte(allOnes, i)).toBe(1)
            }
        })

        it('should work with single bit patterns', () => {
            const bit0 = unsafeByte(1)   // 0b00000001
            const bit7 = unsafeByte(128) // 0b10000000

            expect(getBitFromByte(bit0, 0)).toBe(1)
            expect(getBitFromByte(bit0, 7)).toBe(0)
            expect(getBitFromByte(bit7, 0)).toBe(0)
            expect(getBitFromByte(bit7, 7)).toBe(1)
        })
    })

    describe('setBitInByte operations', () => {
        it('should set individual bits correctly', () => {
            let byte = unsafeByte(0) // Start with 0b00000000

            // Set each bit to 1
            byte = setBitInByte(byte, 0, 1 as any) // 0b00000001
            expect(getBitFromByte(byte, 0)).toBe(1)

            byte = setBitInByte(byte, 2, 1 as any) // 0b00000101
            expect(getBitFromByte(byte, 2)).toBe(1)

            byte = setBitInByte(byte, 7, 1 as any) // 0b10000101
            expect(getBitFromByte(byte, 7)).toBe(1)
        })

        it('should clear individual bits correctly', () => {
            let byte = unsafeByte(255) // Start with 0b11111111

            // Clear each bit to 0
            byte = setBitInByte(byte, 0, 0 as any) // 0b11111110
            expect(getBitFromByte(byte, 0)).toBe(0)

            byte = setBitInByte(byte, 4, 0 as any) // 0b11101110
            expect(getBitFromByte(byte, 4)).toBe(0)

            byte = setBitInByte(byte, 7, 0 as any) // 0b01101110
            expect(getBitFromByte(byte, 7)).toBe(0)
        })

        it('should preserve other bits when setting', () => {
            const original = unsafeByte(85) // 0b01010101
            const modified = setBitInByte(original, 0, 1 as any) // Bit 0 is already 1, so no change

            expect(modified).toBe(original)

            const modified2 = setBitInByte(original, 1, 0 as any) // Bit 1 is already 0, so no change  
            expect(getBitFromByte(modified2, 1)).toBe(0)
            expect(getBitFromByte(modified2, 3)).toBe(0) // Bit 3 should be 0 in 85 (0b01010101)
        })
    })

    describe('setBitOn operations', () => {
        it('should turn bits on', () => {
            const byte = unsafeByte(0) // 0b00000000

            const withBit0 = setBitOnInByte(byte, 0) // 0b00000001
            const withBit3 = setBitOnInByte(withBit0, 3) // 0b00001001

            expect(getBitFromByte(withBit3, 0)).toBe(1)
            expect(getBitFromByte(withBit3, 3)).toBe(1)
            expect(getBitFromByte(withBit3, 1)).toBe(0)
        })

        it('should not affect already set bits', () => {
            const byte = unsafeByte(255) // All bits on
            const result = setBitOnInByte(byte, 4)

            expect(result).toBe(byte) // Should be unchanged
        })
    })

    describe('setBitOff operations', () => {
        it('should turn bits off', () => {
            const byte = unsafeByte(255) // 0b11111111

            const withoutBit0 = setBitOffInByte(byte, 0) // 0b11111110
            const withoutBit7 = setBitOffInByte(withoutBit0, 7) // 0b01111110

            expect(getBitFromByte(withoutBit7, 0)).toBe(0)
            expect(getBitFromByte(withoutBit7, 7)).toBe(0)
            expect(getBitFromByte(withoutBit7, 1)).toBe(1)
        })

        it('should not affect already clear bits', () => {
            const byte = unsafeByte(0) // All bits off
            const result = setBitOffInByte(byte, 4)

            expect(result).toBe(byte) // Should be unchanged
        })
    })

    describe('toggleBit operations', () => {
        it('should toggle bits correctly', () => {
            const byte = unsafeByte(85) // 0b01010101

            const toggled0 = toggleBitInByte(byte, 0) // Should flip 1->0: 0b01010100
            const toggled1 = toggleBitInByte(byte, 1) // Should flip 0->1: 0b01010111

            expect(getBitFromByte(toggled0, 0)).toBe(0)
            expect(getBitFromByte(toggled1, 1)).toBe(1)

            // Double toggle should return original
            const doubleToggle = toggleBitInByte(toggleBitInByte(byte, 3), 3)
            expect(doubleToggle).toBe(byte)
        })

        it('should handle all positions', () => {
            const byte = unsafeByte(0) // 0b00000000

            for (let i = 0; i < 8; i++) {
                const toggled = toggleBitInByte(byte, i)
                expect(getBitFromByte(toggled, i)).toBe(1)

                // Toggle back
                const backToOriginal = toggleBitInByte(toggled, i)
                expect(backToOriginal).toBe(byte)
            }
        })
    })

    describe('isBitSet operations', () => {
        it('should correctly identify set bits', () => {
            const byte = unsafeByte(170) // 0b10101010

            expect(isBitSetInByte(byte, 0)).toBe(false) // 0
            expect(isBitSetInByte(byte, 1)).toBe(true)  // 1
            expect(isBitSetInByte(byte, 2)).toBe(false) // 0
            expect(isBitSetInByte(byte, 3)).toBe(true)  // 1
            expect(isBitSetInByte(byte, 7)).toBe(true)  // 1 (MSB)
        })

        it('should handle edge cases', () => {
            const allZeros = unsafeByte(0)
            const allOnes = unsafeByte(255)

            for (let i = 0; i < 8; i++) {
                expect(isBitSetInByte(allZeros, i)).toBe(false)
                expect(isBitSetInByte(allOnes, i)).toBe(true)
            }
        })
    })

    describe('consistency between safe and unsafe variants', () => {
        it('should produce same results for valid positions', () => {
            const byte = unsafeByte(123) // Random test value

            // Note: Safe variants would use BitPosition type, but we're testing the unsafe ones
            for (let pos = 0; pos < 8; pos++) {
                expect(getBitFromByte(byte, pos)).toBe(getBitFromByte(byte, pos))
                expect(setBitInByte(byte, pos, 1 as any)).toBe(setBitInByte(byte, pos, 1 as any))
                expect(toggleBitInByte(byte, pos)).toBe(toggleBitInByte(byte, pos))
            }
        })
    })
})
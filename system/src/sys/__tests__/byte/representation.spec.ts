import { describe, it, expect } from 'vitest'
import { unsafeByte } from '../../byte/core'
import {
    byteToHex,
    byteToBinary,
    byteToNumber,
    byteToBitArray,
    byteToStrictBitArray,
    byteToDecimal,
    byteToOctal,
} from '../../byte/representation'

describe('Byte Representation Domain', () => {
    describe('byteToHex', () => {
        it('should convert bytes to hex strings', () => {
            expect(byteToHex(unsafeByte(255))).toBe('0xFF')
            expect(byteToHex(unsafeByte(0))).toBe('0x00')
            expect(byteToHex(unsafeByte(42))).toBe('0x2A')
            expect(byteToHex(unsafeByte(15))).toBe('0x0F')
        })

        it('should always produce uppercase hex', () => {
            expect(byteToHex(unsafeByte(171))).toBe('0xAB')
            expect(byteToHex(unsafeByte(255))).toBe('0xFF')
        })

        it('should pad single digits', () => {
            expect(byteToHex(unsafeByte(1))).toBe('0x01')
            expect(byteToHex(unsafeByte(15))).toBe('0x0F')
        })
    })

    describe('byteToBinary', () => {
        it('should convert bytes to binary strings', () => {
            expect(byteToBinary(unsafeByte(255))).toBe('11111111')
            expect(byteToBinary(unsafeByte(0))).toBe('00000000')
            expect(byteToBinary(unsafeByte(1))).toBe('00000001')
            expect(byteToBinary(unsafeByte(170))).toBe('10101010')
        })

        it('should always pad to 8 bits', () => {
            expect(byteToBinary(unsafeByte(1))).toBe('00000001')
            expect(byteToBinary(unsafeByte(15))).toBe('00001111')
        })
    })

    describe('byteToNumber', () => {
        it('should convert bytes to numbers', () => {
            expect(byteToNumber(unsafeByte(42))).toBe(42)
            expect(byteToNumber(unsafeByte(255))).toBe(255)
            expect(byteToNumber(unsafeByte(0))).toBe(0)
        })
    })

    describe('byteToBitArray', () => {
        it('should convert bytes to bit arrays (LSB first)', () => {
            const bits = byteToBitArray(unsafeByte(170)) // 0b10101010
            expect(bits).toEqual([0, 1, 0, 1, 0, 1, 0, 1])
        })

        it('should handle edge cases', () => {
            expect(byteToBitArray(unsafeByte(0))).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
            expect(byteToBitArray(unsafeByte(255))).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
            expect(byteToBitArray(unsafeByte(1))).toEqual([1, 0, 0, 0, 0, 0, 0, 0])
            expect(byteToBitArray(unsafeByte(128))).toEqual([0, 0, 0, 0, 0, 0, 0, 1])
        })

        it('should always produce 8 bits', () => {
            expect(byteToBitArray(unsafeByte(1))).toHaveLength(8)
            expect(byteToBitArray(unsafeByte(255))).toHaveLength(8)
        })
    })

    describe('byteToStrictBitArray', () => {
        it('should return exactly 8 bits with type guarantee', () => {
            const bits = byteToStrictBitArray(unsafeByte(85))
            expect(bits).toHaveLength(8)
            expect(Array.isArray(bits)).toBe(true)
        })
    })

    describe('byteToDecimal', () => {
        it('should convert bytes to decimal strings', () => {
            expect(byteToDecimal(unsafeByte(42))).toBe('42')
            expect(byteToDecimal(unsafeByte(255))).toBe('255')
            expect(byteToDecimal(unsafeByte(0))).toBe('0')
        })
    })

    describe('byteToOctal', () => {
        it('should convert bytes to octal strings', () => {
            expect(byteToOctal(unsafeByte(64))).toBe('100')
            expect(byteToOctal(unsafeByte(255))).toBe('377')
            expect(byteToOctal(unsafeByte(0))).toBe('0')
            expect(byteToOctal(unsafeByte(8))).toBe('10')
        })
    })

    describe('consistency across representations', () => {
        it('should maintain consistency between different representations', () => {
            const testValues = [0, 1, 15, 42, 85, 128, 170, 255]

            testValues.forEach(value => {
                const byte = unsafeByte(value)

                // All representations should be consistent
                expect(byteToNumber(byte)).toBe(value)
                expect(parseInt(byteToHex(byte), 16)).toBe(value)
                expect(parseInt(byteToBinary(byte), 2)).toBe(value)
                expect(parseInt(byteToDecimal(byte), 10)).toBe(value)
                expect(parseInt(byteToOctal(byte), 8)).toBe(value)

                // Bit array should represent the same value
                const bits = byteToBitArray(byte)
                const reconstructed = bits.reduce((acc: number, bit: number, i: number) => acc + (bit << i), 0)
                expect(reconstructed).toBe(value)
            })
        })
    })
})
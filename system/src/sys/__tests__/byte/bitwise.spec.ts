import { describe, it, expect } from 'vitest'
import { unsafeByte, byteToNumberValue } from '../../byte/core'
import {
    andBytes,
    orBytes,
    xorBytes,
    notByte,
    andMultipleBytes,
    orMultipleBytes,
    xorMultipleBytes,
    andBytesWithBits,
    orBytesWithBits,
    xorBytesWithBits,
    notByteWithBits,
} from '../../byte/bitwise'

describe('Bitwise Operations Domain', () => {
    describe('binary operations', () => {
        it('should perform AND operations correctly', () => {
            const a = unsafeByte(0b11110000) // 240
            const b = unsafeByte(0b10101010) // 170
            const result = andBytes(a, b)

            expect(byteToNumberValue(result)).toBe(0b10100000) // 160
        })

        it('should perform OR operations correctly', () => {
            const a = unsafeByte(0b11110000) // 240
            const b = unsafeByte(0b00001111) // 15
            const result = orBytes(a, b)

            expect(byteToNumberValue(result)).toBe(0b11111111) // 255
        })

        it('should perform XOR operations correctly', () => {
            const a = unsafeByte(0b11110000) // 240
            const b = unsafeByte(0b10101010) // 170
            const result = xorBytes(a, b)

            expect(byteToNumberValue(result)).toBe(0b01011010) // 90
        })

        it('should perform NOT operations correctly', () => {
            const a = unsafeByte(0b10101010) // 170
            const result = notByte(a)

            expect(byteToNumberValue(result)).toBe(0b01010101) // 85
        })
    })

    describe('identity properties', () => {
        it('should satisfy AND identity properties', () => {
            const byte = unsafeByte(123)
            const zero = unsafeByte(0)
            const ones = unsafeByte(255)

            // A AND 0 = 0
            expect(byteToNumberValue(andBytes(byte, zero))).toBe(0)
            // A AND 1s = A  
            expect(andBytes(byte, ones)).toBe(byte)
            // A AND A = A
            expect(andBytes(byte, byte)).toBe(byte)
        })

        it('should satisfy OR identity properties', () => {
            const byte = unsafeByte(123)
            const zero = unsafeByte(0)
            const ones = unsafeByte(255)

            // A OR 0 = A
            expect(orBytes(byte, zero)).toBe(byte)
            // A OR 1s = 1s
            expect(byteToNumberValue(orBytes(byte, ones))).toBe(255)
            // A OR A = A
            expect(orBytes(byte, byte)).toBe(byte)
        })

        it('should satisfy XOR identity properties', () => {
            const byte = unsafeByte(123)
            const zero = unsafeByte(0)

            // A XOR 0 = A
            expect(xorBytes(byte, zero)).toBe(byte)
            // A XOR A = 0
            expect(byteToNumberValue(xorBytes(byte, byte))).toBe(0)
        })

        it('should satisfy NOT properties', () => {
            const byte = unsafeByte(123)

            // NOT(NOT(A)) = A
            expect(notByte(notByte(byte))).toBe(byte)
        })
    })

    describe('commutative properties', () => {
        it('should be commutative for AND', () => {
            const a = unsafeByte(85)  // 0b01010101
            const b = unsafeByte(170) // 0b10101010

            expect(andBytes(a, b)).toBe(andBytes(b, a))
        })

        it('should be commutative for OR', () => {
            const a = unsafeByte(85)  // 0b01010101
            const b = unsafeByte(170) // 0b10101010

            expect(orBytes(a, b)).toBe(orBytes(b, a))
        })

        it('should be commutative for XOR', () => {
            const a = unsafeByte(85)  // 0b01010101
            const b = unsafeByte(170) // 0b10101010

            expect(xorBytes(a, b)).toBe(xorBytes(b, a))
        })
    })

    describe('associative properties', () => {
        it('should be associative for AND', () => {
            const a = unsafeByte(240) // 0b11110000
            const b = unsafeByte(204) // 0b11001100
            const c = unsafeByte(170) // 0b10101010

            const left = andBytes(andBytes(a, b), c)
            const right = andBytes(a, andBytes(b, c))

            expect(left).toBe(right)
        })

        it('should be associative for OR', () => {
            const a = unsafeByte(15)  // 0b00001111
            const b = unsafeByte(51)  // 0b00110011
            const c = unsafeByte(85)  // 0b01010101

            const left = orBytes(orBytes(a, b), c)
            const right = orBytes(a, orBytes(b, c))

            expect(left).toBe(right)
        })

        it('should be associative for XOR', () => {
            const a = unsafeByte(240) // 0b11110000
            const b = unsafeByte(204) // 0b11001100
            const c = unsafeByte(170) // 0b10101010

            const left = xorBytes(xorBytes(a, b), c)
            const right = xorBytes(a, xorBytes(b, c))

            expect(left).toBe(right)
        })
    })

    describe('multiple byte operations', () => {
        it('should handle AND of multiple bytes', () => {
            const bytes = [
                unsafeByte(0b11111111), // 255
                unsafeByte(0b11110000), // 240
                unsafeByte(0b11001100), // 204
                unsafeByte(0b10101010)  // 170
            ]

            const result = andMultipleBytes(bytes)
            expect(byteToNumberValue(result)).toBe(0b10000000) // 128
        })

        it('should handle OR of multiple bytes', () => {
            const bytes = [
                unsafeByte(0b00000001), // 1
                unsafeByte(0b00000010), // 2
                unsafeByte(0b00000100), // 4
                unsafeByte(0b00001000)  // 8
            ]

            const result = orMultipleBytes(bytes)
            expect(byteToNumberValue(result)).toBe(0b00001111) // 15
        })

        it('should handle XOR of multiple bytes', () => {
            const bytes = [
                unsafeByte(0b11111111), // 255
                unsafeByte(0b10101010), // 170
                unsafeByte(0b01010101)  // 85
            ]

            const result = xorMultipleBytes(bytes)
            expect(byteToNumberValue(result)).toBe(0b00000000) // 0
        })

        it('should handle single byte in multiple operations', () => {
            const single = [unsafeByte(123)]

            expect(andMultipleBytes(single)).toBe(single[0])
            expect(orMultipleBytes(single)).toBe(single[0])
            expect(xorMultipleBytes(single)).toBe(single[0])
        })
    })

    describe('bit-level operations', () => {
        it('should perform bit-level AND correctly', () => {
            const a = unsafeByte(0b11110000) // 240
            const b = unsafeByte(0b10101010) // 170

            const result1 = andBytes(a, b)
            const result2 = andBytesWithBits(a, b)

            // Should produce same results
            expect(result1).toBe(result2)
        })

        it('should perform bit-level OR correctly', () => {
            const a = unsafeByte(0b11110000) // 240
            const b = unsafeByte(0b00001111) // 15

            const result1 = orBytes(a, b)
            const result2 = orBytesWithBits(a, b)

            expect(result1).toBe(result2)
        })

        it('should perform bit-level XOR correctly', () => {
            const a = unsafeByte(0b11110000) // 240
            const b = unsafeByte(0b10101010) // 170

            const result1 = xorBytes(a, b)
            const result2 = xorBytesWithBits(a, b)

            expect(result1).toBe(result2)
        })

        it('should perform bit-level NOT correctly', () => {
            const a = unsafeByte(0b10101010) // 170

            const result1 = notByte(a)
            const result2 = notByteWithBits(a)

            expect(result1).toBe(result2)
        })
    })

    describe('edge cases', () => {
        it('should handle all zeros', () => {
            const zero = unsafeByte(0)

            expect(andBytes(zero, zero)).toBe(zero)
            expect(orBytes(zero, zero)).toBe(zero)
            expect(xorBytes(zero, zero)).toBe(zero)
            expect(byteToNumberValue(notByte(zero))).toBe(255)
        })

        it('should handle all ones', () => {
            const ones = unsafeByte(255)

            expect(andBytes(ones, ones)).toBe(ones)
            expect(orBytes(ones, ones)).toBe(ones)
            expect(byteToNumberValue(xorBytes(ones, ones))).toBe(0)
            expect(byteToNumberValue(notByte(ones))).toBe(0)
        })

        it('should maintain byte boundaries', () => {
            // Operations should never produce values outside 0-255
            const testValues = [0, 1, 85, 128, 170, 240, 255]

            testValues.forEach(a => {
                testValues.forEach(b => {
                    const byteA = unsafeByte(a)
                    const byteB = unsafeByte(b)

                    const andResult = byteToNumberValue(andBytes(byteA, byteB))
                    const orResult = byteToNumberValue(orBytes(byteA, byteB))
                    const xorResult = byteToNumberValue(xorBytes(byteA, byteB))

                    expect(andResult).toBeGreaterThanOrEqual(0)
                    expect(andResult).toBeLessThanOrEqual(255)
                    expect(orResult).toBeGreaterThanOrEqual(0)
                    expect(orResult).toBeLessThanOrEqual(255)
                    expect(xorResult).toBeGreaterThanOrEqual(0)
                    expect(xorResult).toBeLessThanOrEqual(255)
                })
            })
        })
    })
})
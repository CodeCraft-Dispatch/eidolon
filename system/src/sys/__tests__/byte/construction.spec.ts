import { describe, it, expect, test } from 'vitest'
import { byteToNumberValue } from '../../byte/core'
import {
    parseByteFromHex,
    parseByteFromBinary,
    parseByteFromBits,
    createByteFromBits,
    parseByteArray,
    unsafeByteFromHex,
    unsafeByteFromBinary,
} from '../../byte/construction'

describe('Byte Construction Domain', () => {
    describe.each([
        {
            scenarios: [
                { input: '0xFF', expected: 255 },
                { input: '0x42', expected: 66 },
                { input: '0x00', expected: 0 },
                { input: '0xAB', expected: 171 },
                { input: '0x0F', expected: 15 },
            ],
            operation: (test: string) => parseByteFromHex(test),
            description: 'parseByteFromHex',
            testName: 'should parse valid hex strings'
        },
        {
            scenarios: [
                { input: '0b11111111', expected: 255 },
                { input: '0b01000010', expected: 66 },
                { input: '0b00000000', expected: 0 },
                { input: '0b1', expected: 1 },
                { input: '0b10101010', expected: 170 },
            ],
            operation: (test: string) => parseByteFromBinary(test),
            description: 'parseByteFromBinary',
            testName: 'should parse valid binary strings'
        }
    ])('$description', ({ testName, scenarios, operation }) => {
        it(testName, () => {
            scenarios.forEach(({ input, expected }) => {
                const result = operation(input)
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(byteToNumberValue(result.value)).toBe(expected)
                }
            })
        });
    });

    describe('parseByteFromHex', () => {
        it('should handle lowercase hex', () => {
            const result = parseByteFromHex('0xff')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(byteToNumberValue(result.value)).toBe(255)
            }
        })

        it('should reject invalid hex strings', () => {
            const invalid = ['xFF', '0xGG', '0x', '0x123', 'not-hex']
            invalid.forEach(input => {
                expect(parseByteFromHex(input).success).toBe(false)
            })
        })

        it('should handle whitespace', () => {
            const result = parseByteFromHex('  0x42  ')
            expect(result.success).toBe(true)
            if (result.success) {
                expect(byteToNumberValue(result.value)).toBe(66)
            }
        })
    })

    describe('parseByteFromBinary', () => {
        it('should reject invalid binary strings', () => {
            const invalid = ['b11111111', '0b2', '0b', '0b111111111', 'not-binary']
            invalid.forEach(input => {
                expect(parseByteFromBinary(input).success).toBe(false)
            })
        })
    })

    describe('parseByteFromBits', () => {
        it('should parse valid bit arrays', () => {
            const bits = [0, 1, 0, 1, 0, 1, 0, 1] as any
            const result = parseByteFromBits(bits)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(byteToNumberValue(result.value)).toBe(170) // 0b10101010
            }
        })

        it('should reject arrays with wrong length', () => {
            const shortBits = [1, 0, 1] as any
            const longBits = [1, 0, 1, 0, 1, 0, 1, 0, 1] as any

            expect(parseByteFromBits(shortBits).success).toBe(false)
            expect(parseByteFromBits(longBits).success).toBe(false)
        })

        it('should handle all zeros and all ones', () => {
            const allZeros = [0, 0, 0, 0, 0, 0, 0, 0] as any
            const allOnes = [1, 1, 1, 1, 1, 1, 1, 1] as any

            const zerosResult = parseByteFromBits(allZeros)
            const onesResult = parseByteFromBits(allOnes)

            expect(zerosResult.success).toBe(true)
            expect(onesResult.success).toBe(true)

            if (zerosResult.success && onesResult.success) {
                expect(byteToNumberValue(zerosResult.value)).toBe(0)
                expect(byteToNumberValue(onesResult.value)).toBe(255)
            }
        })
    })

    describe('createByteFromBits', () => {
        it('should create byte from bits without validation', () => {
            const bits = [1, 0, 1, 0, 1, 0, 1, 0] as any
            const byte = createByteFromBits(bits)
            expect(byteToNumberValue(byte)).toBe(85) // 0b01010101
        })
    })

    describe('parseByteArray', () => {
        it('should parse valid number arrays', () => {
            const numbers = [0, 128, 255, 42]
            const result = parseByteArray(numbers)

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.value).toHaveLength(4)
                expect(byteToNumberValue(result.value[0])).toBe(0)
                expect(byteToNumberValue(result.value[1])).toBe(128)
                expect(byteToNumberValue(result.value[2])).toBe(255)
                expect(byteToNumberValue(result.value[3])).toBe(42)
            }
        })

        it('should reject arrays with invalid values', () => {
            const invalid = [0, 256, 128] // 256 is invalid
            const result = parseByteArray(invalid)

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain('index 1')
            }
        })

        it('should handle empty arrays', () => {
            const result = parseByteArray([])
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.value).toHaveLength(0)
            }
        })
    })

    describe('unsafe construction functions', () => {
        it('should create bytes without validation', () => {
            expect(byteToNumberValue(unsafeByteFromHex('0xFF'))).toBe(255)
            expect(byteToNumberValue(unsafeByteFromBinary('0b11111111'))).toBe(255)
        })

        it('should handle malformed input gracefully', () => {
            // These should not throw but may return unexpected values
            expect(() => unsafeByteFromHex('invalid')).not.toThrow()
            expect(() => unsafeByteFromBinary('invalid')).not.toThrow()
        })
    })
})
import { describe, it, expect } from 'vitest'
import { unsafeByte, byteToNumberValue } from '../../byte/core'
import {
    addBytes,
    subtractBytes,
    multiplyBytes,
    shiftLeftByte,
    shiftRightByte,
    unsafeShiftLeftByte,
    unsafeShiftRightByte,
    sumBytes,
    averageBytes,
    incrementByte,
    decrementByte,
} from '../../byte/math'

describe('Arithmetic Operations Domain', () => {
    describe('basic arithmetic', () => {
        it('should add bytes with overflow wrapping', () => {
            expect(byteToNumberValue(addBytes(unsafeByte(100), unsafeByte(50)))).toBe(150)
            expect(byteToNumberValue(addBytes(unsafeByte(200), unsafeByte(100)))).toBe(44) // Wraps: 300 & 0xFF = 44
            expect(byteToNumberValue(addBytes(unsafeByte(255), unsafeByte(1)))).toBe(0)   // Wraps: 256 & 0xFF = 0
        })

        it('should subtract bytes with underflow wrapping', () => {
            expect(byteToNumberValue(subtractBytes(unsafeByte(100), unsafeByte(50)))).toBe(50)
            expect(byteToNumberValue(subtractBytes(unsafeByte(50), unsafeByte(100)))).toBe(206) // Wraps: -50 & 0xFF = 206
            expect(byteToNumberValue(subtractBytes(unsafeByte(0), unsafeByte(1)))).toBe(255)   // Wraps: -1 & 0xFF = 255
        })

        it('should multiply bytes with overflow wrapping', () => {
            expect(byteToNumberValue(multiplyBytes(unsafeByte(10), unsafeByte(5)))).toBe(50)
            expect(byteToNumberValue(multiplyBytes(unsafeByte(16), unsafeByte(16)))).toBe(0)   // Wraps: 256 & 0xFF = 0
            expect(byteToNumberValue(multiplyBytes(unsafeByte(15), unsafeByte(17)))).toBe(255) // 255 exactly
        })

        it('should handle arithmetic identity properties', () => {
            const byte = unsafeByte(123)
            const zero = unsafeByte(0)
            const one = unsafeByte(1)

            // Addition identity
            expect(addBytes(byte, zero)).toBe(byte)

            // Subtraction identity
            expect(subtractBytes(byte, zero)).toBe(byte)

            // Multiplication identity
            expect(multiplyBytes(byte, one)).toBe(byte)

            // Multiplication by zero
            expect(byteToNumberValue(multiplyBytes(byte, zero))).toBe(0)
        })
    })

    describe('shift operations', () => {
        it.each([
            {
                description: 'shift left from bit 0',
                source: 0b00000001,
                shifts: [
                    { positions: 1, expected: 0b00000010 },
                    { positions: 2, expected: 0b00000100 },
                    { positions: 3, expected: 0b00001000 }
                ],
                operation: 'left'
            },
            {
                description: 'shift right from bit 7',
                source: 0b10000000,
                shifts: [
                    { positions: 1, expected: 0b01000000 },
                    { positions: 2, expected: 0b00100000 },
                    { positions: 3, expected: 0b00010000 }
                ],
                operation: 'right'
            }
        ])('should $description', ({ source, shifts, operation }) => {
            const byte = unsafeByte(source)

            shifts.forEach(({ positions, expected }) => {
                const result = operation === 'left'
                    ? shiftLeftByte(byte, positions)
                    : shiftRightByte(byte, positions)

                expect(result.success).toBe(true)
                if (result.success) {
                    expect(byteToNumberValue(result.value)).toBe(expected)
                }
            })
        })

        it('should handle shift overflow with masking', () => {
            const byte = unsafeByte(0b11000000) // 192

            // Shift left by 2 should lose the high bits
            const shiftLeft = shiftLeftByte(byte, 2)
            expect(shiftLeft.success).toBe(true)
            if (shiftLeft.success) {
                expect(byteToNumberValue(shiftLeft.value)).toBe(0b00000000) // Masked to 0
            }

            // Shift right by large amount
            const shiftRight = shiftRightByte(byte, 7)
            expect(shiftRight.success).toBe(true)
            if (shiftRight.success) {
                expect(byteToNumberValue(shiftRight.value)).toBe(0b00000001) // 1
            }
        })

        it('should validate shift positions', () => {
            const byte = unsafeByte(123)

            // Valid positions (0-7)
            expect(shiftLeftByte(byte, 0).success).toBe(true)
            expect(shiftLeftByte(byte, 7).success).toBe(true)

            // Invalid positions
            expect(shiftLeftByte(byte, -1).success).toBe(false)
            expect(shiftLeftByte(byte, 8).success).toBe(false)
            expect(shiftLeftByte(byte, 10).success).toBe(false)
        })

        it('should provide meaningful error messages for invalid shifts', () => {
            const byte = unsafeByte(123)

            const invalidShift = shiftLeftByte(byte, 9)
            expect(invalidShift.success).toBe(false)
            if (!invalidShift.success) {
                expect(invalidShift.error).toContain('Shift positions must be')
                expect(invalidShift.error).toContain('9')
            }
        })
    })

    describe('unsafe shift operations', () => {
        it('should perform shifts without validation', () => {
            const byte = unsafeByte(0b00000001) // 1

            expect(byteToNumberValue(unsafeShiftLeftByte(byte, 2))).toBe(4)
            expect(byteToNumberValue(unsafeShiftRightByte(unsafeByte(16), 2))).toBe(4)
        })

        it('should handle invalid positions gracefully', () => {
            const byte = unsafeByte(123)

            // Should not throw but may produce unexpected results
            expect(() => unsafeShiftLeftByte(byte, 10)).not.toThrow()
            expect(() => unsafeShiftRightByte(byte, -1)).not.toThrow()
        })
    })

    describe('array operations', () => {
        it('should sum byte arrays correctly', () => {
            const bytes = [
                unsafeByte(100),
                unsafeByte(50),
                unsafeByte(25)
            ]

            const result = sumBytes(bytes)
            expect(byteToNumberValue(result)).toBe(175) // 100 + 50 + 25 = 175
        })

        it('should handle sum overflow with wrapping', () => {
            const bytes = [
                unsafeByte(200),
                unsafeByte(100),
                unsafeByte(50)
            ]

            const result = sumBytes(bytes)
            // 200 + 100 + 50 = 350, 350 & 0xFF = 94
            expect(byteToNumberValue(result)).toBe(94)
        })

        it('should calculate average correctly', () => {
            const bytes = [
                unsafeByte(100),
                unsafeByte(50),
                unsafeByte(25),
                unsafeByte(25)
            ]

            const result = averageBytes(bytes)
            // (100 + 50 + 25 + 25) / 4 = 50
            expect(byteToNumberValue(result)).toBe(50)
        })

        it('should handle empty arrays', () => {
            const result = averageBytes([])
            expect(byteToNumberValue(result)).toBe(0)
        })

        it('should handle single element arrays', () => {
            const single = [unsafeByte(123)]

            expect(sumBytes(single)).toBe(single[0])
            expect(averageBytes(single)).toBe(single[0])
        })

        it('should round averages correctly', () => {
            const bytes = [
                unsafeByte(1),
                unsafeByte(2)
            ]

            const result = averageBytes(bytes)
            // (1 + 2) / 2 = 1.5, rounded to 2
            expect(byteToNumberValue(result)).toBe(2)
        })
    })

    describe('increment and decrement operations', () => {
        it('should increment bytes correctly', () => {
            expect(byteToNumberValue(incrementByte(unsafeByte(100)))).toBe(101)
            expect(byteToNumberValue(incrementByte(unsafeByte(0)))).toBe(1)
        })

        it('should handle increment overflow', () => {
            expect(byteToNumberValue(incrementByte(unsafeByte(255)))).toBe(0) // Wraps
        })

        it('should decrement bytes correctly', () => {
            expect(byteToNumberValue(decrementByte(unsafeByte(100)))).toBe(99)
            expect(byteToNumberValue(decrementByte(unsafeByte(1)))).toBe(0)
        })

        it('should handle decrement underflow', () => {
            expect(byteToNumberValue(decrementByte(unsafeByte(0)))).toBe(255) // Wraps
        })

        it('should be inverse operations (except at boundaries)', () => {
            const testValues = [1, 50, 100, 200, 254]

            testValues.forEach(value => {
                const byte = unsafeByte(value)

                // increment then decrement should return original
                expect(decrementByte(incrementByte(byte))).toBe(byte)

                // decrement then increment should return original  
                expect(incrementByte(decrementByte(byte))).toBe(byte)
            })
        })
    })

    describe('mathematical properties', () => {
        it('should maintain commutativity for addition', () => {
            const a = unsafeByte(123)
            const b = unsafeByte(45)

            expect(addBytes(a, b)).toBe(addBytes(b, a))
        })

        it('should maintain commutativity for multiplication', () => {
            const a = unsafeByte(12)
            const b = unsafeByte(5)

            expect(multiplyBytes(a, b)).toBe(multiplyBytes(b, a))
        })

        it('should handle associativity for addition', () => {
            const a = unsafeByte(10)
            const b = unsafeByte(20)
            const c = unsafeByte(30)

            const left = addBytes(addBytes(a, b), c)
            const right = addBytes(a, addBytes(b, c))

            expect(left).toBe(right)
        })

        it('should maintain byte boundaries for all operations', () => {
            const testValues = [0, 1, 50, 100, 200, 255]

            testValues.forEach(a => {
                testValues.forEach(b => {
                    const byteA = unsafeByte(a)
                    const byteB = unsafeByte(b)

                    const addResult = byteToNumberValue(addBytes(byteA, byteB))
                    const subResult = byteToNumberValue(subtractBytes(byteA, byteB))
                    const mulResult = byteToNumberValue(multiplyBytes(byteA, byteB))

                    expect(addResult).toBeGreaterThanOrEqual(0)
                    expect(addResult).toBeLessThanOrEqual(255)
                    expect(subResult).toBeGreaterThanOrEqual(0)
                    expect(subResult).toBeLessThanOrEqual(255)
                    expect(mulResult).toBeGreaterThanOrEqual(0)
                    expect(mulResult).toBeLessThanOrEqual(255)
                })
            })
        })
    })
})
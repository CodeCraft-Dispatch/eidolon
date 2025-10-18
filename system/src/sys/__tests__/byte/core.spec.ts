import { describe, it, expect } from 'vitest'
import {
    parseByte,
    isByte,
    byteToNumberValue,
    compareBytes,
    clampToByte,
    unsafeByte,
    BYTE_ZERO,
    BYTE_MAX,
    BYTE_MIN_VALUE,
    BYTE_MAX_VALUE,
    BITS_PER_BYTE,
    COMPARISON_LESS,
    COMPARISON_EQUAL,
    COMPARISON_GREATER,
} from '../../byte/core'

describe('Byte Core Domain', () => {
    describe('Constants', () => {
        it('should have correct byte constants', () => {
            expect(BYTE_MIN_VALUE).toBe(0)
            expect(BYTE_MAX_VALUE).toBe(255)
            expect(BITS_PER_BYTE).toBe(8)
            expect(BYTE_ZERO).toBe(0)
            expect(BYTE_MAX).toBe(255)
        })

        it('should have correct comparison constants', () => {
            expect(COMPARISON_LESS).toBe(-1)
            expect(COMPARISON_EQUAL).toBe(0)
            expect(COMPARISON_GREATER).toBe(1)
        })
    })

    describe('parseByte', () => {
        it('should parse valid byte values', () => {
            const result = parseByte(42)
            if (result.success) {
                expect(byteToNumberValue(result.value)).toBe(42)
            } else {
                expect.fail(`parseByte failed: ${result.error ?? 'unknown error'}`)
            }
        })

        it('should handle boundary values', () => {
            const min = parseByte(0)
            const max = parseByte(255)

            expect(min.success).toBe(true)
            expect(max.success).toBe(true)

            if (min.success && max.success) {
                expect(byteToNumberValue(min.value)).toBe(0)
                expect(byteToNumberValue(max.value)).toBe(255)
            } else {
                expect.fail(`parseByte boundary value handling failed`)
            }
        })

        it('should reject invalid values', () => {
            expect(parseByte(-1).success).toBe(false)
            expect(parseByte(256).success).toBe(false)
            expect(parseByte(1.5).success).toBe(false)
            expect(parseByte(NaN).success).toBe(false)
        })

        it('should provide meaningful error messages', () => {
            const negResult = parseByte(-1)
            const highResult = parseByte(300)
            const floatResult = parseByte(1.5)

            expect(negResult.success).toBe(false)
            expect(highResult.success).toBe(false)
            expect(floatResult.success).toBe(false)

            if (!negResult.success) expect(negResult.error).toContain('>='); else expect.fail(`parseByte negative value handling failed`)
            if (!highResult.success) expect(highResult.error).toContain('<='); else expect.fail(`parseByte overflow value handling failed`)
            if (!floatResult.success) expect(floatResult.error).toContain('integer'); else expect.fail(`parseByte float value handling failed`)
        })
    })

    describe('isByte', () => {
        it('should correctly identify valid byte values', () => {
            expect(isByte(0)).toBe(true)
            expect(isByte(255)).toBe(true)
            expect(isByte(128)).toBe(true)
        })

        it('should reject invalid values', () => {
            expect(isByte(-1)).toBe(false)
            expect(isByte(256)).toBe(false)
            expect(isByte(1.5)).toBe(false)
            expect(isByte(NaN)).toBe(false)
        })
    })

    describe('compareBytes', () => {
        it('should compare bytes correctly', () => {
            const a = unsafeByte(10)
            const b = unsafeByte(20)
            const c = unsafeByte(10)

            expect(compareBytes(a, b)).toBe(COMPARISON_LESS)
            expect(compareBytes(b, a)).toBe(COMPARISON_GREATER)
            expect(compareBytes(a, c)).toBe(COMPARISON_EQUAL)
        })
    })

    describe('clampToByte', () => {
        it('should clamp values to valid byte range', () => {
            expect(clampToByte(-10)).toBe(0)
            expect(clampToByte(300)).toBe(255)
            expect(clampToByte(128)).toBe(128)
            expect(clampToByte(1.7)).toBe(1)
        })
    })

    describe('unsafeByte', () => {
        it('should create byte without validation', () => {
            const byte = unsafeByte(42)
            expect(byteToNumberValue(byte)).toBe(42)
        })

        it('should mask values to byte range', () => {
            const byte = unsafeByte(256)
            expect(byteToNumberValue(byte)).toBe(0) // 256 & 0xFF = 0
        })
    })
})
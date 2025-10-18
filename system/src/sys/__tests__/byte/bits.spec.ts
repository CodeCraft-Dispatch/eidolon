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
    // Test data factory
    const createTestByte = (value: number) => unsafeByte(value)
    const testCases = [
        { name: 'alternating pattern', value: 170, binary: '0b10101010' },
        { name: 'all zeros', value: 0, binary: '0b00000000' },
        { name: 'all ones', value: 255, binary: '0b11111111' },
        { name: 'single bit (LSB)', value: 1, binary: '0b00000001' },
        { name: 'single bit (MSB)', value: 128, binary: '0b10000000' },
        { name: 'mixed pattern', value: 85, binary: '0b01010101' },
    ]

    // Helper to test both safe and unsafe variants
    const testBothVariants = <T extends any[]>(
        description: string,
        unsafeFunc: (...args: T) => any,
        safeFunc: (...args: T) => any,
        testFn: (func: (...args: T) => any, variant: 'unsafe' | 'safe') => void
    ) => {
        describe(description, () => {
            describe('unsafe variant', () => {
                testFn(unsafeFunc, 'unsafe')
            })

            describe('safe variant (At)', () => {
                testFn(safeFunc, 'safe')
            })
        })
    }

    testBothVariants(
        'getBit operations',
        getBitFromByte,
        getBitFromByteAt,
        (getBitFunc, variant) => {
            it('should get bits correctly for various patterns', () => {
                testCases.forEach(({ name, value, binary }) => {
                    const byte = createTestByte(value)

                    // Test all bit positions
                    for (let pos = 0; pos < 8; pos++) {
                        const expected = (value >> pos) & 1
                        expect(getBitFunc(byte, pos as any)).toBe(expected)
                    }
                })
            })

            it('should handle specific bit patterns correctly', () => {
                const byte = createTestByte(170) // 0b10101010

                expect(getBitFunc(byte, 0 as any)).toBe(0) // LSB
                expect(getBitFunc(byte, 1 as any)).toBe(1)
                expect(getBitFunc(byte, 7 as any)).toBe(1) // MSB
            })

            if (variant === 'safe') {
                it('should handle invalid positions gracefully', () => {
                    const byte = createTestByte(170)

                    // Test boundary conditions - adjust based on actual implementation
                    expect(getBitFunc(byte, -1 as any)).toBe(0)
                    expect(getBitFunc(byte, 8 as any)).toBe(0)
                })
            }
        }
    )

    testBothVariants(
        'setBit operations',
        setBitInByte,
        setBitInByteAt,
        (setBitFunc, variant) => {
            it('should set bits to 1 correctly', () => {
                let byte = createTestByte(0)

                for (let pos = 0; pos < 8; pos++) {
                    byte = setBitFunc(byte, pos as any, 1 as any)
                    expect((byte >> pos) & 1).toBe(1)
                }
            })

            it('should set bits to 0 correctly', () => {
                let byte = createTestByte(255)

                for (let pos = 0; pos < 8; pos++) {
                    byte = setBitFunc(byte, pos as any, 0 as any)
                    expect((byte >> pos) & 1).toBe(0)
                }
            })

            it('should preserve other bits when setting', () => {
                const original = createTestByte(85) // 0b01010101
                const modified = setBitFunc(original, 0 as any, 1 as any)

                // Verify only target bit changed (or stayed same)
                for (let pos = 1; pos < 8; pos++) {
                    const originalBit = (original >> pos) & 1
                    const modifiedBit = (modified >> pos) & 1
                    expect(modifiedBit).toBe(originalBit)
                }
            })
        }
    )

    testBothVariants(
        'setBitOn operations',
        setBitOnInByte,
        setBitOnInByteAt,
        (setBitOnFunc, variant) => {
            it('should turn bits on', () => {
                testCases.forEach(({ value }) => {
                    const byte = createTestByte(value)

                    for (let pos = 0; pos < 8; pos++) {
                        const result = setBitOnFunc(byte, pos as any)
                        expect((result >> pos) & 1).toBe(1)
                    }
                })
            })

            it('should not affect already set bits', () => {
                const byte = createTestByte(255) // All bits on

                for (let pos = 0; pos < 8; pos++) {
                    const result = setBitOnFunc(byte, pos as any)
                    expect(result).toBe(byte)
                }
            })
        }
    )

    testBothVariants(
        'setBitOff operations',
        setBitOffInByte,
        setBitOffInByteAt,
        (setBitOffFunc, variant) => {
            it('should turn bits off', () => {
                testCases.forEach(({ value }) => {
                    const byte = createTestByte(value)

                    for (let pos = 0; pos < 8; pos++) {
                        const result = setBitOffFunc(byte, pos as any)
                        expect((result >> pos) & 1).toBe(0)
                    }
                })
            })

            it('should not affect already clear bits', () => {
                const byte = createTestByte(0) // All bits off

                for (let pos = 0; pos < 8; pos++) {
                    const result = setBitOffFunc(byte, pos as any)
                    expect(result).toBe(byte)
                }
            })
        }
    )

    testBothVariants(
        'toggleBit operations',
        toggleBitInByte,
        toggleBitInByteAt,
        (toggleBitFunc, variant) => {
            it('should toggle bits correctly', () => {
                testCases.forEach(({ value }) => {
                    const byte = createTestByte(value)

                    for (let pos = 0; pos < 8; pos++) {
                        const originalBit = (byte >> pos) & 1
                        const toggled = toggleBitFunc(byte, pos as any)
                        const toggledBit = (toggled >> pos) & 1

                        expect(toggledBit).toBe(originalBit === 1 ? 0 : 1)
                    }
                })
            })

            it('should return to original after double toggle', () => {
                const byte = createTestByte(123) // Arbitrary test value

                for (let pos = 0; pos < 8; pos++) {
                    const doubleToggled = toggleBitFunc(toggleBitFunc(byte, pos as any), pos as any)
                    expect(doubleToggled).toBe(byte)
                }
            })
        }
    )

    testBothVariants(
        'isBitSet operations',
        isBitSetInByte,
        isBitSetInByteAt,
        (isBitSetFunc, variant) => {
            it('should correctly identify set bits', () => {
                testCases.forEach(({ name, value }) => {
                    const byte = createTestByte(value)

                    for (let pos = 0; pos < 8; pos++) {
                        const expected = ((value >> pos) & 1) === 1
                        expect(isBitSetFunc(byte, pos as any)).toBe(expected)
                    }
                })
            })

            it('should handle specific patterns correctly', () => {
                const alternating = createTestByte(170) // 0b10101010

                expect(isBitSetFunc(alternating, 0 as any)).toBe(false)
                expect(isBitSetFunc(alternating, 1 as any)).toBe(true)
                expect(isBitSetFunc(alternating, 7 as any)).toBe(true)
            })
        }
    )

    describe('cross-function consistency', () => {
        it('should maintain consistency between get/set operations', () => {
            const byte = createTestByte(123)

            for (let pos = 0; pos < 8; pos++) {
                // Test unsafe variants
                const withBitSet = setBitInByte(byte, pos, 1 as any)
                const withBitClear = setBitInByte(byte, pos, 0 as any)

                expect(getBitFromByte(withBitSet, pos)).toBe(1)
                expect(getBitFromByte(withBitClear, pos)).toBe(0)
                expect(isBitSetInByte(withBitSet, pos)).toBe(true)
                expect(isBitSetInByte(withBitClear, pos)).toBe(false)

                // Test safe variants
                expect(getBitFromByteAt(withBitSet, pos as any)).toBe(1)
                expect(getBitFromByteAt(withBitClear, pos as any)).toBe(0)
                expect(isBitSetInByteAt(withBitSet, pos as any)).toBe(true)
                expect(isBitSetInByteAt(withBitClear, pos as any)).toBe(false)
            }
        })

        it('should maintain consistency between toggle and set operations', () => {
            const byte = createTestByte(85) // 0b01010101

            for (let pos = 0; pos < 8; pos++) {
                const originalBit = getBitFromByte(byte, pos)
                const toggled = toggleBitInByte(byte, pos)
                const toggledAt = toggleBitInByteAt(byte, pos as any)
                const manuallySet = setBitInByte(byte, pos, (originalBit === 1 ? 0 : 1) as any)

                expect(toggled).toBe(manuallySet)
                expect(toggledAt).toBe(manuallySet)
            }
        })
    })
})
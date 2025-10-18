import { describe, it, expect, test } from 'vitest'
import {
    type BIT,
    isBitOn,
    isBitOff,
    isBit,
    parseBitOn,
    parseBitOff,
    parseBit,
    foldBit,
    createBit,
    bitToBoolean,
    booleanToBit,
    toggleBit,
    setBitOn,
    setBitOff,
    andBits,
    orBits,
    xorBits,
    notBit
} from '../../bit/bit'

describe('Bit Domain', () => {
    // Test data constants
    const validBits = [0, 1] as const
    const invalidValues = [-1, 2, 1.5, 0.5, NaN, Infinity, -Infinity, '0', '1', null, undefined, {}, [], true, false] as const
    const allTestValues = [...validBits, ...invalidValues] as const

    describe('Type Predicates', () => {
        describe('isBitOn', () => {
            test.each([
                { input: 1, expected: true, description: 'should correctly identify bit on (1)' },
                { input: 0, expected: false, description: 'should reject bit off (0)' }
            ])('$description', ({ input, expected }) => {
                expect(isBitOn(input)).toBe(expected)
            })

            test.each(invalidValues)(
                'should reject invalid value: %s',
                (invalidValue) => {
                    expect(isBitOn(invalidValue)).toBe(false)
                }
            )
        })

        describe('isBitOff', () => {
            test.each([
                { input: 0, expected: true, description: 'should correctly identify bit off (0)' },
                { input: 1, expected: false, description: 'should reject bit on (1)' }
            ])('$description', ({ input, expected }) => {
                expect(isBitOff(input)).toBe(expected)
            })

            test.each(invalidValues)(
                'should reject invalid value: %s',
                (invalidValue) => {
                    expect(isBitOff(invalidValue)).toBe(false)
                }
            )
        })

        describe('isBit', () => {
            test.each(validBits)(
                'should correctly identify valid bit: %s',
                (validBit) => {
                    expect(isBit(validBit)).toBe(true)
                }
            )

            test.each(invalidValues)(
                'should reject invalid value: %s',
                (invalidValue) => {
                    expect(isBit(invalidValue)).toBe(false)
                }
            )
        })
    })

    describe('Parsing and Validation', () => {
        describe('parseBitOn', () => {
            it('should parse valid bit on (1)', () => {
                const result = parseBitOn(1)
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.value).toBe(1)
                }
            })

            it('should reject bit off (0)', () => {
                const result = parseBitOn(0)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toBe('Expected 1, received: 0')
                }
            })

            test.each([
                { input: 2, expected: 'Expected 1, received: 2' },
                { input: -1, expected: 'Expected 1, received: -1' },
                { input: '1', expected: 'Expected 1, received: 1' },
                { input: null, expected: 'Expected 1, received: null' },
                { input: undefined, expected: 'Expected 1, received: undefined' },
                { input: NaN, expected: 'Expected 1, received: NaN' }
            ])('should reject $input with error: "$expected"', ({ input, expected }) => {
                const result = parseBitOn(input)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toBe(expected)
                }
            })
        })

        describe('parseBitOff', () => {
            it('should parse valid bit off (0)', () => {
                const result = parseBitOff(0)
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.value).toBe(0)
                }
            })

            it('should reject bit on (1)', () => {
                const result = parseBitOff(1)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toBe('Expected 0, received: 1')
                }
            })

            test.each([
                { input: 2, expected: 'Expected 0, received: 2' },
                { input: -1, expected: 'Expected 0, received: -1' },
                { input: '0', expected: 'Expected 0, received: 0' },
                { input: null, expected: 'Expected 0, received: null' },
                { input: undefined, expected: 'Expected 0, received: undefined' },
                { input: NaN, expected: 'Expected 0, received: NaN' }
            ])('should reject $input with error: "$expected"', ({ input, expected }) => {
                const result = parseBitOff(input)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toBe(expected)
                }
            })
        })

        describe('parseBit', () => {
            test.each(validBits)(
                'should parse valid bit: %s',
                (validBit) => {
                    const result = parseBit(validBit)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toBe(validBit)
                    }
                }
            )

            test.each([
                { input: 2, expected: 'Expected 0 or 1, received: 2' },
                { input: -1, expected: 'Expected 0 or 1, received: -1' },
                { input: 1.5, expected: 'Expected 0 or 1, received: 1.5' },
                { input: '1', expected: 'Expected 0 or 1, received: 1' },
                { input: null, expected: 'Expected 0 or 1, received: null' },
                { input: undefined, expected: 'Expected 0 or 1, received: undefined' },
                { input: NaN, expected: 'Expected 0 or 1, received: NaN' },
                { input: Infinity, expected: 'Expected 0 or 1, received: Infinity' },
                { input: {}, expected: 'Expected 0 or 1, received: [object Object]' },
                { input: [], expected: 'Expected 0 or 1, received: ' },
                { input: true, expected: 'Expected 0 or 1, received: true' },
                { input: false, expected: 'Expected 0 or 1, received: false' }
            ])('should reject $input with error: "$expected"', ({ input, expected }) => {
                const result = parseBit(input)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toBe(expected)
                }
            })
        })
    })

    describe('Functional Composition', () => {
        describe('foldBit', () => {
            test.each([
                { input: 0, expected: 'Bit value: 0', description: 'should handle valid bit 0' },
                { input: 1, expected: 'Bit value: 1', description: 'should handle valid bit 1' },
                { input: 5, expected: 'Parse error: Expected 0 or 1, received: 5', description: 'should handle invalid input' }
            ])('$description', ({ input, expected }) => {
                const result = parseBit(input)
                const folded = foldBit(
                    result,
                    (bit) => `Bit value: ${bit}`,
                    (error) => `Parse error: ${error}`
                )
                expect(folded).toBe(expected)
            })
        })

        describe('createBit', () => {
            test.each(validBits)(
                'should create valid bit: %s',
                (validBit) => {
                    const result = createBit(validBit)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toBe(validBit)
                    }
                }
            )

            it('should delegate validation to parseBit', () => {
                const invalidResult = createBit(2)
                expect(invalidResult.success).toBe(false)
                if (!invalidResult.success) {
                    expect(invalidResult.error).toBe('Expected 0 or 1, received: 2')
                }
            })

            test.each(allTestValues)(
                'should maintain consistency with parseBit for value: %s',
                (value) => {
                    const parseResult = parseBit(value)
                    const createResult = createBit(value)

                    expect(createResult.success).toBe(parseResult.success)
                    if (parseResult.success && createResult.success) {
                        expect(createResult.value).toBe(parseResult.value)
                    }
                    if (!parseResult.success && !createResult.success) {
                        expect(createResult.error).toBe(parseResult.error)
                    }
                }
            )
        })
    })

    describe('Bit-Boolean Conversion', () => {
        test.each([
            { bit: 0 as BIT, boolean: false, description: 'bit 0 to false' },
            { bit: 1 as BIT, boolean: true, description: 'bit 1 to true' }
        ])('bitToBoolean should convert $description', ({ bit, boolean }) => {
            expect(bitToBoolean(bit)).toBe(boolean)
        })

        test.each([
            { boolean: false, bit: 0, description: 'false to bit 0' },
            { boolean: true, bit: 1, description: 'true to bit 1' }
        ])('booleanToBit should convert $description', ({ boolean, bit }) => {
            expect(booleanToBit(boolean)).toBe(bit)
        })

        describe('round-trip conversion consistency', () => {
            test.each(validBits)(
                'should maintain consistency for bit %s in bit->boolean->bit conversion',
                (bit) => {
                    const originalBit = bit as BIT
                    expect(booleanToBit(bitToBoolean(originalBit))).toBe(originalBit)
                }
            )

            test.each([false, true])(
                'should maintain consistency for boolean %s in boolean->bit->boolean conversion',
                (boolean) => {
                    expect(bitToBoolean(booleanToBit(boolean))).toBe(boolean)
                }
            )
        })
    })

    describe('Bit Manipulation Operations', () => {
        test.each([
            { input: 0 as BIT, expected: 1, description: 'should toggle bit 0 to 1' },
            { input: 1 as BIT, expected: 0, description: 'should toggle bit 1 to 0' }
        ])('toggleBit $description', ({ input, expected }) => {
            expect(toggleBit(input)).toBe(expected)
        })

        test.each(validBits)(
            'toggleBit should be its own inverse for bit %s',
            (bit) => {
                const originalBit = bit as BIT
                expect(toggleBit(toggleBit(originalBit))).toBe(originalBit)
            }
        )

        it('setBitOn should always return bit 1', () => {
            expect(setBitOn()).toBe(1)
        })

        it('setBitOff should always return bit 0', () => {
            expect(setBitOff()).toBe(0)
        })

        test.each([
            { input: 0 as BIT, expected: 1, description: 'should invert bit 0 to 1' },
            { input: 1 as BIT, expected: 0, description: 'should invert bit 1 to 0' }
        ])('notBit $description', ({ input, expected }) => {
            expect(notBit(input)).toBe(expected)
        })

        test.each(validBits)(
            'notBit should be consistent with toggleBit for bit %s',
            (bit) => {
                const originalBit = bit as BIT
                expect(notBit(originalBit)).toBe(toggleBit(originalBit))
            }
        )

        test.each(validBits)(
            'notBit should be its own inverse for bit %s',
            (bit) => {
                const originalBit = bit as BIT
                expect(notBit(notBit(originalBit))).toBe(originalBit)
            }
        )
    })

    describe('Bitwise Logic Operations', () => {
        // Truth table test data
        const andTruthTable = [
            { a: 0 as BIT, b: 0 as BIT, expected: 0, operation: '0 & 0 = 0' },
            { a: 0 as BIT, b: 1 as BIT, expected: 0, operation: '0 & 1 = 0' },
            { a: 1 as BIT, b: 0 as BIT, expected: 0, operation: '1 & 0 = 0' },
            { a: 1 as BIT, b: 1 as BIT, expected: 1, operation: '1 & 1 = 1' }
        ] as const

        const orTruthTable = [
            { a: 0 as BIT, b: 0 as BIT, expected: 0, operation: '0 | 0 = 0' },
            { a: 0 as BIT, b: 1 as BIT, expected: 1, operation: '0 | 1 = 1' },
            { a: 1 as BIT, b: 0 as BIT, expected: 1, operation: '1 | 0 = 1' },
            { a: 1 as BIT, b: 1 as BIT, expected: 1, operation: '1 | 1 = 1' }
        ] as const

        const xorTruthTable = [
            { a: 0 as BIT, b: 0 as BIT, expected: 0, operation: '0 ^ 0 = 0' },
            { a: 0 as BIT, b: 1 as BIT, expected: 1, operation: '0 ^ 1 = 1' },
            { a: 1 as BIT, b: 0 as BIT, expected: 1, operation: '1 ^ 0 = 1' },
            { a: 1 as BIT, b: 1 as BIT, expected: 0, operation: '1 ^ 1 = 0' }
        ] as const

        // Commutativity test data
        const commutativeTestCases = [
            { a: 0 as BIT, b: 0 as BIT },
            { a: 0 as BIT, b: 1 as BIT },
            { a: 1 as BIT, b: 0 as BIT },
            { a: 1 as BIT, b: 1 as BIT }
        ] as const

        describe('andBits', () => {
            test.each(andTruthTable)(
                'should implement correct AND truth table: $operation',
                ({ a, b, expected }) => {
                    expect(andBits(a, b)).toBe(expected)
                }
            )

            test.each(commutativeTestCases)(
                'should be commutative: andBits(%s, %s) === andBits(%s, %s)',
                ({ a, b }) => {
                    expect(andBits(a, b)).toBe(andBits(b, a))
                }
            )

            test.each([
                { bit: 0 as BIT, identity: 1 as BIT, expected: 0 as BIT, property: 'x & 1 = x for x=0' },
                { bit: 1 as BIT, identity: 1 as BIT, expected: 1 as BIT, property: 'x & 1 = x for x=1' },
                { bit: 0 as BIT, annihilator: 0 as BIT, expected: 0 as BIT, property: 'x & 0 = 0 for x=0' },
                { bit: 1 as BIT, annihilator: 0 as BIT, expected: 0 as BIT, property: 'x & 0 = 0 for x=1' }
            ])('should have identity and annihilator properties: $property', ({ bit, identity, annihilator, expected }) => {
                if (identity !== undefined) {
                    expect(andBits(bit, identity)).toBe(expected)
                }
                if (annihilator !== undefined) {
                    expect(andBits(bit, annihilator)).toBe(expected)
                }
            })
        })

        describe('orBits', () => {
            test.each(orTruthTable)(
                'should implement correct OR truth table: $operation',
                ({ a, b, expected }) => {
                    expect(orBits(a, b)).toBe(expected)
                }
            )

            test.each(commutativeTestCases)(
                'should be commutative: orBits(%s, %s) === orBits(%s, %s)',
                ({ a, b }) => {
                    expect(orBits(a, b)).toBe(orBits(b, a))
                }
            )

            test.each([
                { bit: 0 as BIT, identity: 0 as BIT, expected: 0 as BIT, property: 'x | 0 = x for x=0' },
                { bit: 1 as BIT, identity: 0 as BIT, expected: 1 as BIT, property: 'x | 0 = x for x=1' },
                { bit: 0 as BIT, annihilator: 1 as BIT, expected: 1 as BIT, property: 'x | 1 = 1 for x=0' },
                { bit: 1 as BIT, annihilator: 1 as BIT, expected: 1 as BIT, property: 'x | 1 = 1 for x=1' }
            ])('should have identity and annihilator properties: $property', ({ bit, identity, annihilator, expected }) => {
                if (identity !== undefined) {
                    expect(orBits(bit, identity)).toBe(expected)
                }
                if (annihilator !== undefined) {
                    expect(orBits(bit, annihilator)).toBe(expected)
                }
            })
        })

        describe('xorBits', () => {
            test.each(xorTruthTable)(
                'should implement correct XOR truth table: $operation',
                ({ a, b, expected }) => {
                    expect(xorBits(a, b)).toBe(expected)
                }
            )

            test.each(commutativeTestCases)(
                'should be commutative: xorBits(%s, %s) === xorBits(%s, %s)',
                ({ a, b }) => {
                    expect(xorBits(a, b)).toBe(xorBits(b, a))
                }
            )

            test.each([
                { bit: 0 as BIT, expected: 0 as BIT, property: 'x ^ 0 = x for x=0' },
                { bit: 1 as BIT, expected: 1 as BIT, property: 'x ^ 0 = x for x=1' }
            ])('should have identity property: $property', ({ bit, expected }) => {
                expect(xorBits(bit, 0 as BIT)).toBe(expected)
            })

            test.each(validBits)(
                'should be self-inverse: %s ^ %s = 0',
                (bit) => {
                    const originalBit = bit as BIT
                    expect(xorBits(originalBit, originalBit)).toBe(0)
                }
            )

            test.each([
                { bit: 0 as BIT, expected: 1, description: 'XOR with 1 toggles bit 0' },
                { bit: 1 as BIT, expected: 0, description: 'XOR with 1 toggles bit 1' }
            ])('should implement toggle behavior: $description', ({ bit, expected }) => {
                expect(xorBits(bit, 1 as BIT)).toBe(toggleBit(bit))
                expect(xorBits(bit, 1 as BIT)).toBe(expected)
            })
        })
    })

    describe('Type Consistency and Integration', () => {
        test.each(allTestValues)(
            'should maintain consistency between type guards and parsers for value: %s',
            (value) => {
                const isBitResult = isBit(value)
                const parseBitResult = parseBit(value)
                const isBitOnResult = isBitOn(value)
                const parseBitOnResult = parseBitOn(value)
                const isBitOffResult = isBitOff(value)
                const parseBitOffResult = parseBitOff(value)

                expect(parseBitResult.success).toBe(isBitResult)
                expect(parseBitOnResult.success).toBe(isBitOnResult)
                expect(parseBitOffResult.success).toBe(isBitOffResult)
            }
        )

        it('should work correctly with utility functions using typed bits', () => {
            const bit0Result = parseBit(0)
            const bit1Result = parseBit(1)

            expect(bit0Result.success).toBe(true)
            expect(bit1Result.success).toBe(true)

            if (bit0Result.success && bit1Result.success) {
                const bit0 = bit0Result.value
                const bit1 = bit1Result.value

                expect(bitToBoolean(bit0)).toBe(false)
                expect(bitToBoolean(bit1)).toBe(true)
                expect(toggleBit(bit0)).toBe(1)
                expect(toggleBit(bit1)).toBe(0)
                expect(andBits(bit0, bit1)).toBe(0)
                expect(orBits(bit0, bit1)).toBe(1)
                expect(xorBits(bit0, bit1)).toBe(1)
                expect(notBit(bit0)).toBe(1)
                expect(notBit(bit1)).toBe(0)
            }
        })
    })

    describe('Edge Cases and Error Handling', () => {
        const specialNumericValues = [NaN, Infinity, -Infinity, Number.MIN_VALUE, Number.MAX_VALUE] as const
        const objectValues: unknown[] = [{}, [], { bit: 0 }, [0], { valueOf: () => 1 }]
        const stringValues = ['0', '1', '2', 'true', 'false', '', ' ', '0.0', '1.0'] as const

        describe('Special numeric values', () => {
            test.each(specialNumericValues)(
                'should handle special numeric value %s gracefully',
                (value) => {
                    expect(isBit(value)).toBe(false)
                    expect(isBitOn(value)).toBe(false)
                    expect(isBitOff(value)).toBe(false)
                    expect(parseBit(value).success).toBe(false)
                    expect(parseBitOn(value).success).toBe(false)
                    expect(parseBitOff(value).success).toBe(false)
                }
            )
        })

        describe('Object and array inputs', () => {
            test.each(objectValues)(
                'should handle object/array input gracefully: %s',
                (value) => {
                    expect(isBit(value)).toBe(false)
                    expect(isBitOn(value)).toBe(false)
                    expect(isBitOff(value)).toBe(false)
                    expect(parseBit(value).success).toBe(false)
                    expect(parseBitOn(value).success).toBe(false)
                    expect(parseBitOff(value).success).toBe(false)
                }
            )
        })

        describe('String representations', () => {
            test.each(stringValues)(
                'should handle string input gracefully: "%s"',
                (value) => {
                    expect(isBit(value)).toBe(false)
                    expect(isBitOn(value)).toBe(false)
                    expect(isBitOff(value)).toBe(false)
                    expect(parseBit(value).success).toBe(false)
                    expect(parseBitOn(value).success).toBe(false)
                    expect(parseBitOff(value).success).toBe(false)
                }
            )
        })
    })
})
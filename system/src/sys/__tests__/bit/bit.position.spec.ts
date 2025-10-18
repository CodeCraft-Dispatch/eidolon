import { describe, it, expect, test } from 'vitest'
import {
    type BitPosition,
    BIT_POSITION_0,
    BIT_POSITION_1,
    BIT_POSITION_2,
    BIT_POSITION_3,
    BIT_POSITION_4,
    BIT_POSITION_5,
    BIT_POSITION_6,
    BIT_POSITION_7,
    MIN_BIT_POSITION,
    MAX_BIT_POSITION,
    isBitPosition,
    isValidBitPosition,
    parseBitPosition,
    parseBitPositionArray,
    createBitPosition,
    foldBitPosition,
    createBitMask,
    getAllBitPositions,
    isValidBitPositionRange,
    getBitPositionsInRange,
    nextBitPosition,
    previousBitPosition,
    compareBitPositions,
    isLeastSignificantBit,
    isMostSignificantBit,
    getBitPositionWeight,
    getBitPositionsFromMask,
    unsafeBitPosition
} from '../../bit/bit.position'

describe('BitPosition Domain', () => {
    describe('Constants and Type Safety', () => {
        it('should have correct bit position constants', () => {
            expect(BIT_POSITION_0).toBe(0)
            expect(BIT_POSITION_1).toBe(1)
            expect(BIT_POSITION_2).toBe(2)
            expect(BIT_POSITION_3).toBe(3)
            expect(BIT_POSITION_4).toBe(4)
            expect(BIT_POSITION_5).toBe(5)
            expect(BIT_POSITION_6).toBe(6)
            expect(BIT_POSITION_7).toBe(7)
        })

        it('should have correct min and max boundaries', () => {
            expect(MIN_BIT_POSITION).toBe(BIT_POSITION_0)
            expect(MAX_BIT_POSITION).toBe(BIT_POSITION_7)
        })
    })

    describe('Type Predicates', () => {
        describe('isBitPosition', () => {
            it('should correctly identify valid bit positions', () => {
                expect(isBitPosition(0)).toBe(true)
                expect(isBitPosition(1)).toBe(true)
                expect(isBitPosition(7)).toBe(true)
            })

            it('should reject invalid bit positions', () => {
                expect(isBitPosition(-1)).toBe(false)
                expect(isBitPosition(8)).toBe(false)
                expect(isBitPosition(1.5)).toBe(false)
                expect(isBitPosition(NaN)).toBe(false)
                expect(isBitPosition('0')).toBe(false)
                expect(isBitPosition(null)).toBe(false)
                expect(isBitPosition(undefined)).toBe(false)
            })
        })

        describe('isValidBitPosition', () => {
            it('should validate numeric bit positions', () => {
                expect(isValidBitPosition(0)).toBe(true)
                expect(isValidBitPosition(7)).toBe(true)
                expect(isValidBitPosition(4)).toBe(true)
            })

            it('should reject invalid numeric values', () => {
                expect(isValidBitPosition(-1)).toBe(false)
                expect(isValidBitPosition(8)).toBe(false)
                expect(isValidBitPosition(1.5)).toBe(false)
                expect(isValidBitPosition(NaN)).toBe(false)
            })
        })
    })

    describe('Parsing and Validation', () => {
        describe('parseBitPosition', () => {
            it('should parse valid bit position values', () => {
                for (let i = 0; i <= 7; i++) {
                    const result = parseBitPosition(i)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toBe(i)
                    }
                }
            })

            it('should handle boundary values correctly', () => {
                const min = parseBitPosition(0)
                const max = parseBitPosition(7)

                expect(min.success).toBe(true)
                expect(max.success).toBe(true)

                if (min.success && max.success) {
                    expect(min.value).toBe(0)
                    expect(max.value).toBe(7)
                }
            })

            it('should reject non-number input', () => {
                const result = parseBitPosition('0')
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('Expected number')
                    expect(result.error).toContain('string')
                }
            })

            it('should reject non-integer numbers', () => {
                const result = parseBitPosition(3.14)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('Expected integer')
                    expect(result.error).toContain('3.14')
                }
            })

            it('should reject values below minimum range', () => {
                const result = parseBitPosition(-1)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('must be >= 0')
                    expect(result.error).toContain('-1')
                }
            })

            it('should reject values above maximum range', () => {
                const result = parseBitPosition(8)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('must be <= 7')
                    expect(result.error).toContain('8')
                }
            })

            it('should provide meaningful error messages for edge cases', () => {
                const nanResult = parseBitPosition(NaN)
                const infinityResult = parseBitPosition(Infinity)

                expect(nanResult.success).toBe(false)
                expect(infinityResult.success).toBe(false)

                if (!nanResult.success) {
                    expect(nanResult.error).toContain('Expected integer')
                }
                if (!infinityResult.success) {
                    expect(infinityResult.error).toContain('Expected integer')
                }
            })
        })

        describe('parseBitPositionArray', () => {
            it('should parse valid bit position arrays', () => {
                const result = parseBitPositionArray([0, 3, 7])
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.value).toEqual([0, 3, 7])
                }
            })

            it('should handle empty arrays', () => {
                const result = parseBitPositionArray([])
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.value).toEqual([])
                }
            })

            it('should reject non-array input', () => {
                const result = parseBitPositionArray('not-an-array' as any)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('Expected array')
                    expect(result.error).toContain('string')
                }
            })

            it('should reject arrays with invalid elements', () => {
                const result = parseBitPositionArray([0, 8, 3])
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('Invalid bit position at index 1')
                    expect(result.error).toContain('must be <= 7')
                }
            })

            it('should identify the correct index for invalid elements', () => {
                const result = parseBitPositionArray([1, 2, -1])
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('at index 2')
                }
            })
        })
    })

    describe('Constructors and Utilities', () => {
        describe('createBitPosition', () => {
            it('should create valid bit positions', () => {
                const result = createBitPosition(5)
                expect(result.success).toBe(true)
                if (result.success) {
                    expect(result.value).toBe(5)
                }
            })

            it('should delegate validation to parseBitPosition', () => {
                const invalidResult = createBitPosition(-1)
                expect(invalidResult.success).toBe(false)
                if (!invalidResult.success) {
                    expect(invalidResult.error).toContain('must be >= 0')
                }
            })
        })

        describe('foldBitPosition', () => {
            test.each([
                {
                    input: 3,
                    expectedResult: 'Success: 3',
                    description: 'should execute success handler for valid results'
                },
                {
                    input: 10,
                    expectedResult: 'Error:',
                    expectedContains: 'must be <= 7',
                    description: 'should execute error handler for invalid results'
                }
            ])('$description', ({ input, expectedResult, expectedContains }) => {
                const result = parseBitPosition(input)
                const folded = foldBitPosition(
                    result,
                    (position) => `Success: ${position}`,
                    (error) => `Error: ${error}`
                )

                if (expectedContains) {
                    expect(folded).toContain(expectedResult)
                    expect(folded).toContain(expectedContains)
                } else {
                    expect(folded).toBe(expectedResult)
                }
            })
        })

        describe('unsafeBitPosition', () => {
            it('should create bit position without validation', () => {
                const position = unsafeBitPosition(5)
                expect(position).toBe(5)
            })

            it('should allow invalid values for performance scenarios', () => {
                // This is unsafe by design - no validation
                const position = unsafeBitPosition(10)
                expect(position).toBe(10)
            })
        })
    })

    describe('Bit Manipulation', () => {
        describe('createBitMask', () => {
            it('should create correct bit masks', () => {
                expect(createBitMask(BIT_POSITION_0)).toBe(0b00000001) // 1 << 0 = 1
                expect(createBitMask(BIT_POSITION_1)).toBe(0b00000010) // 1 << 1 = 2
                expect(createBitMask(BIT_POSITION_2)).toBe(0b00000100) // 1 << 2 = 4
                expect(createBitMask(BIT_POSITION_3)).toBe(0b00001000) // 1 << 3 = 8
                expect(createBitMask(BIT_POSITION_4)).toBe(0b00010000) // 1 << 4 = 16
                expect(createBitMask(BIT_POSITION_5)).toBe(0b00100000) // 1 << 5 = 32
                expect(createBitMask(BIT_POSITION_6)).toBe(0b01000000) // 1 << 6 = 64
                expect(createBitMask(BIT_POSITION_7)).toBe(0b10000000) // 1 << 7 = 128
            })
        })

        describe('getBitPositionsFromMask', () => {
            it('should extract bit positions from bitmask', () => {
                const mask = 0b10100001 // positions 0, 5, 7
                const positions = getBitPositionsFromMask(mask)
                expect(positions).toEqual([BIT_POSITION_0, BIT_POSITION_5, BIT_POSITION_7])
            })

            it('should handle empty mask', () => {
                const positions = getBitPositionsFromMask(0)
                expect(positions).toEqual([])
            })

            it('should handle full mask', () => {
                const mask = 0b11111111 // all bits set
                const positions = getBitPositionsFromMask(mask)
                expect(positions).toEqual([
                    BIT_POSITION_0, BIT_POSITION_1, BIT_POSITION_2, BIT_POSITION_3,
                    BIT_POSITION_4, BIT_POSITION_5, BIT_POSITION_6, BIT_POSITION_7
                ])
            })

            it('should handle single bit masks', () => {
                const positions3 = getBitPositionsFromMask(0b00001000) // only bit 3
                expect(positions3).toEqual([BIT_POSITION_3])
            })
        })
    })

    describe('Collection Operations', () => {
        describe('getAllBitPositions', () => {
            it('should return all bit positions in order', () => {
                const positions = getAllBitPositions()
                expect(positions).toEqual([
                    BIT_POSITION_0, BIT_POSITION_1, BIT_POSITION_2, BIT_POSITION_3,
                    BIT_POSITION_4, BIT_POSITION_5, BIT_POSITION_6, BIT_POSITION_7
                ])
            })

            it('should return exactly 8 positions', () => {
                const positions = getAllBitPositions()
                expect(positions).toHaveLength(8)
            })
        })

        describe('Range Operations', () => {
            describe('isValidBitPositionRange', () => {
                it('should validate correct ranges', () => {
                    expect(isValidBitPositionRange(BIT_POSITION_0, BIT_POSITION_7)).toBe(true)
                    expect(isValidBitPositionRange(BIT_POSITION_2, BIT_POSITION_5)).toBe(true)
                    expect(isValidBitPositionRange(BIT_POSITION_4, BIT_POSITION_4)).toBe(true)
                })

                it('should reject invalid ranges', () => {
                    expect(isValidBitPositionRange(BIT_POSITION_5, BIT_POSITION_2)).toBe(false)
                    expect(isValidBitPositionRange(BIT_POSITION_7, BIT_POSITION_0)).toBe(false)
                })
            })

            describe('getBitPositionsInRange', () => {
                it('should return positions in valid range', () => {
                    const result = getBitPositionsInRange(BIT_POSITION_2, BIT_POSITION_5)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toEqual([
                            BIT_POSITION_2, BIT_POSITION_3, BIT_POSITION_4, BIT_POSITION_5
                        ])
                    }
                })

                it('should handle single position range', () => {
                    const result = getBitPositionsInRange(BIT_POSITION_3, BIT_POSITION_3)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toEqual([BIT_POSITION_3])
                    }
                })

                it('should handle full range', () => {
                    const result = getBitPositionsInRange(BIT_POSITION_0, BIT_POSITION_7)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toEqual(getAllBitPositions())
                    }
                })

                it('should reject invalid ranges', () => {
                    const result = getBitPositionsInRange(BIT_POSITION_5, BIT_POSITION_2)
                    expect(result.success).toBe(false)
                    if (!result.success) {
                        expect(result.error).toContain('Invalid bit position range')
                        expect(result.error).toContain('5-2')
                    }
                })
            })
        })
    })

    describe('Navigation', () => {
        describe('nextBitPosition', () => {
            it('should return next position for valid positions', () => {
                for (let i = 0; i < 7; i++) {
                    const current = i as BitPosition
                    const result = nextBitPosition(current)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toBe(i + 1)
                    }
                }
            })

            it('should fail for maximum position', () => {
                const result = nextBitPosition(BIT_POSITION_7)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('No next position after 7')
                }
            })
        })

        describe('previousBitPosition', () => {
            it('should return previous position for valid positions', () => {
                for (let i = 1; i <= 7; i++) {
                    const current = i as BitPosition
                    const result = previousBitPosition(current)
                    expect(result.success).toBe(true)
                    if (result.success) {
                        expect(result.value).toBe(i - 1)
                    }
                }
            })

            it('should fail for minimum position', () => {
                const result = previousBitPosition(BIT_POSITION_0)
                expect(result.success).toBe(false)
                if (!result.success) {
                    expect(result.error).toContain('No previous position before 0')
                }
            })
        })
    })

    describe('Comparison and Analysis', () => {
        describe('compareBitPositions', () => {
            it('should compare positions correctly', () => {
                expect(compareBitPositions(BIT_POSITION_2, BIT_POSITION_5)).toBe(-1) // less
                expect(compareBitPositions(BIT_POSITION_5, BIT_POSITION_2)).toBe(1)  // greater
                expect(compareBitPositions(BIT_POSITION_3, BIT_POSITION_3)).toBe(0)  // equal
            })

            it('should handle boundary comparisons', () => {
                expect(compareBitPositions(MIN_BIT_POSITION, MAX_BIT_POSITION)).toBe(-1)
                expect(compareBitPositions(MAX_BIT_POSITION, MIN_BIT_POSITION)).toBe(1)
                expect(compareBitPositions(MIN_BIT_POSITION, MIN_BIT_POSITION)).toBe(0)
            })
        })

        describe('Significance Checks', () => {
            describe('isLeastSignificantBit', () => {
                it('should identify LSB correctly', () => {
                    expect(isLeastSignificantBit(BIT_POSITION_0)).toBe(true)
                    expect(isLeastSignificantBit(BIT_POSITION_1)).toBe(false)
                    expect(isLeastSignificantBit(BIT_POSITION_7)).toBe(false)
                })
            })

            describe('isMostSignificantBit', () => {
                it('should identify MSB correctly', () => {
                    expect(isMostSignificantBit(BIT_POSITION_7)).toBe(true)
                    expect(isMostSignificantBit(BIT_POSITION_6)).toBe(false)
                    expect(isMostSignificantBit(BIT_POSITION_0)).toBe(false)
                })
            })
        })

        describe('getBitPositionWeight', () => {
            it('should calculate correct weights', () => {
                expect(getBitPositionWeight(BIT_POSITION_0)).toBe(1)   // 2^0 = 1
                expect(getBitPositionWeight(BIT_POSITION_1)).toBe(2)   // 2^1 = 2
                expect(getBitPositionWeight(BIT_POSITION_2)).toBe(4)   // 2^2 = 4
                expect(getBitPositionWeight(BIT_POSITION_3)).toBe(8)   // 2^3 = 8
                expect(getBitPositionWeight(BIT_POSITION_4)).toBe(16)  // 2^4 = 16
                expect(getBitPositionWeight(BIT_POSITION_5)).toBe(32)  // 2^5 = 32
                expect(getBitPositionWeight(BIT_POSITION_6)).toBe(64)  // 2^6 = 64
                expect(getBitPositionWeight(BIT_POSITION_7)).toBe(128) // 2^7 = 128
            })
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle null and undefined inputs gracefully', () => {
            expect(parseBitPosition(null).success).toBe(false)
            expect(parseBitPosition(undefined).success).toBe(false)
            expect(isBitPosition(null)).toBe(false)
            expect(isBitPosition(undefined)).toBe(false)
        })

        it('should handle special numeric values', () => {
            expect(parseBitPosition(Infinity).success).toBe(false)
            expect(parseBitPosition(-Infinity).success).toBe(false)
            expect(parseBitPosition(NaN).success).toBe(false)
        })

        it('should handle object inputs', () => {
            expect(parseBitPosition({}).success).toBe(false)
            expect(parseBitPosition([]).success).toBe(false)
            expect(isBitPosition({})).toBe(false)
            expect(isBitPosition([])).toBe(false)
        })

        it('should maintain consistency between type guards and parsers', () => {
            const testValues = [-1, 0, 1, 3.14, 7, 8, NaN, '5', null, undefined]

            for (const value of testValues) {
                const parseResult = parseBitPosition(value)
                const typeGuardResult = isBitPosition(value)

                // If parser succeeds, type guard should return true
                // If parser fails, type guard should return false
                expect(parseResult.success).toBe(typeGuardResult)
            }
        })
    })
})
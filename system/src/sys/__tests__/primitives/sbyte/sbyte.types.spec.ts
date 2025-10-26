import { describe, it, expect } from 'vitest';
import type { SBYTE } from '@/sys/primitives/sbyte';
import {
    MIN_SBYTE_VALUE,
    MAX_SBYTE_VALUE,
    SBYTE_MASK,
    SBYTE_BIT_POSITIONS,
    SBYTE_BINARY_PATTERN,
    isSByte
} from '@/sys/primitives/sbyte';

describe('SBYTE Type', () => {
    const minMaxCases = [
        { value: MIN_SBYTE_VALUE, expected: -128 as SBYTE, description: 'Given the SBYTE type, When the minimum value is checked, Then it should be -128' },
        { value: MAX_SBYTE_VALUE, expected: 127 as SBYTE, description: 'Given the SBYTE type, When the maximum value is checked, Then it should be 127' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the SBYTE type, When the mask value is checked, Then it should be 0xFF', () => {
        expect(SBYTE_MASK).toBe(0xFF as SBYTE);
    });

    it('Given the SBYTE type, When the bit positions are checked, Then it should include positions 0 through 7', () => {
        expect(SBYTE_BIT_POSITIONS).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    const binaryPatternCases = [
        { binary: '10101010', matches: true, description: 'Given the SBYTE type, When the binary pattern is checked, Then it should match "10101010"' },
        { binary: '11111111', matches: true, description: 'Given the SBYTE type, When the binary pattern is checked, Then it should match "11111111"' },
        { binary: '', matches: false, description: 'Given the SBYTE type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '101010101', matches: false, description: 'Given the SBYTE type, When the binary pattern is checked, Then it should not match "101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(SBYTE_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validSByteCases = [
        { value: -128, isValid: true, description: 'Given a value of -128, When it is checked against the SBYTE type, Then it should be recognized as a valid SBYTE' },
        { value: 127, isValid: true, description: 'Given a value of 127, When it is checked against the SBYTE type, Then it should be recognized as a valid SBYTE' },
    ];

    validSByteCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isSByte(value)).toBe(isValid);
        });
    });

    const invalidSByteCases = [
        { value: -129, isValid: false, description: 'Given a value of -129, When it is checked against the SBYTE type, Then it should not be recognized as a valid SBYTE' },
        { value: 128, isValid: false, description: 'Given a value of 128, When it is checked against the SBYTE type, Then it should not be recognized as a valid SBYTE' },
        { value: 1000, isValid: false, description: 'Given a value of 1000, When it is checked against the SBYTE type, Then it should not be recognized as a valid SBYTE' },
    ];

    invalidSByteCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isSByte(value)).toBe(isValid);
        });
    });
});
import { describe, it, expect } from 'vitest';
import type { UINT } from '@/sys/primitives/uint';
import {
    MIN_UINT_VALUE,
    MAX_UINT_VALUE,
    UINT_MASK,
    UINT_BIT_POSITIONS,
    UINT_BINARY_PATTERN,
    isUInt
} from '@/sys/primitives/uint';

describe('UINT Type', () => {
    const minMaxCases = [
        { value: MIN_UINT_VALUE, expected: 0 as UINT, description: 'Given the UINT type, When the minimum value is checked, Then it should be 0' },
        { value: MAX_UINT_VALUE, expected: 4294967295 as UINT, description: 'Given the UINT type, When the maximum value is checked, Then it should be 4294967295' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the UINT type, When the mask value is checked, Then it should be 0xFFFFFFFF', () => {
        expect(UINT_MASK).toBe(0xFFFFFFFF as UINT);
    });

    it('Given the UINT type, When the bit positions are checked, Then it should include positions 0 through 31', () => {
        expect(UINT_BIT_POSITIONS).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
        ]);
    });

    const binaryPatternCases = [
        { binary: '10101010101010101010101010101010', matches: true, description: 'Given the UINT type, When the binary pattern is checked, Then it should match "10101010101010101010101010101010"' },
        { binary: '11111111111111111111111111111111', matches: true, description: 'Given the UINT type, When the binary pattern is checked, Then it should match "11111111111111111111111111111111"' },
        { binary: '', matches: false, description: 'Given the UINT type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '101010101010101010101010101010101', matches: false, description: 'Given the UINT type, When the binary pattern is checked, Then it should not match "101010101010101010101010101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(UINT_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validUIntCases = [
        { value: 0, isValid: true, description: 'Given a value of 0, When it is checked against the UINT type, Then it should be recognized as a valid UINT' },
        { value: 4294967295, isValid: true, description: 'Given a value of 4294967295, When it is checked against the UINT type, Then it should be recognized as a valid UINT' },
    ];

    validUIntCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isUInt(value)).toBe(isValid);
        });
    });

    const invalidUIntCases = [
        { value: -1, isValid: false, description: 'Given a value of -1, When it is checked against the UINT type, Then it should not be recognized as a valid UINT' },
        { value: 4294967296, isValid: false, description: 'Given a value of 4294967296, When it is checked against the UINT type, Then it should not be recognized as a valid UINT' },
        { value: 10000000000, isValid: false, description: 'Given a value of 10000000000, When it is checked against the UINT type, Then it should not be recognized as a valid UINT' },
    ];

    invalidUIntCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isUInt(value)).toBe(isValid);
        });
    });
});
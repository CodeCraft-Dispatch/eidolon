import { describe, it, expect } from 'vitest';
import type { LONG } from '@/sys/primitives/long';
import {
    MIN_LONG_VALUE,
    MAX_LONG_VALUE,
    LONG_MASK,
    LONG_BIT_POSITIONS,
    LONG_BINARY_PATTERN,
    isLong
} from '@/sys/primitives/long';

describe('LONG Type', () => {
    const minMaxCases = [
        { value: MIN_LONG_VALUE, expected: -9223372036854775808n as LONG, description: 'Given the LONG type, When the minimum value is checked, Then it should be -9223372036854775808n' },
        { value: MAX_LONG_VALUE, expected: 9223372036854775807n as LONG, description: 'Given the LONG type, When the maximum value is checked, Then it should be 9223372036854775807n' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the LONG type, When the mask value is checked, Then it should be 0xFFFFFFFFFFFFFFFFn', () => {
        expect(LONG_MASK).toBe(0xFFFFFFFFFFFFFFFFn as LONG);
    });

    it('Given the LONG type, When the bit positions are checked, Then it should include positions 0 through 63', () => {
        expect(LONG_BIT_POSITIONS).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63
        ]);
    });

    const binaryPatternCases = [
        { binary: '1010101010101010101010101010101010101010101010101010101010101010', matches: true, description: 'Given the LONG type, When the binary pattern is checked, Then it should match "1010101010101010101010101010101010101010101010101010101010101010"' },
        { binary: '1111111111111111111111111111111111111111111111111111111111111111', matches: true, description: 'Given the LONG type, When the binary pattern is checked, Then it should match "1111111111111111111111111111111111111111111111111111111111111111"' },
        { binary: '', matches: false, description: 'Given the LONG type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '10101010101010101010101010101010101010101010101010101010101010101', matches: false, description: 'Given the LONG type, When the binary pattern is checked, Then it should not match "10101010101010101010101010101010101010101010101010101010101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(LONG_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validLongCases = [
        { value: -9223372036854775808n, isValid: true, description: 'Given a value of -9223372036854775808n, When it is checked against the LONG type, Then it should be recognized as a valid LONG' },
        { value: 9223372036854775807n, isValid: true, description: 'Given a value of 9223372036854775807n, When it is checked against the LONG type, Then it should be recognized as a valid LONG' },
    ];

    validLongCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isLong(value)).toBe(isValid);
        });
    });

    const invalidLongCases = [
        { value: -9223372036854775809n, isValid: false, description: 'Given a value of -9223372036854775809n, When it is checked against the LONG type, Then it should not be recognized as a valid LONG' },
        { value: 9223372036854775808n, isValid: false, description: 'Given a value of 9223372036854775808n, When it is checked against the LONG type, Then it should not be recognized as a valid LONG' },
        { value: 100000000000000000000n, isValid: false, description: 'Given a value of 100000000000000000000n, When it is checked against the LONG type, Then it should not be recognized as a valid LONG' },
    ];

    invalidLongCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isLong(value)).toBe(isValid);
        });
    });
});
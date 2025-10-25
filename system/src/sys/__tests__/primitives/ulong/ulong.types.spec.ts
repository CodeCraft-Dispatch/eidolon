import { describe, it, expect } from 'vitest';
import type { ULONG } from '@/sys/primitives/ulong';
import {
    MIN_ULONG_VALUE,
    MAX_ULONG_VALUE,
    ULONG_MASK,
    ULONG_BIT_POSITIONS,
    ULONG_BINARY_PATTERN,
    isULong
} from '@/sys/primitives/ulong';

describe('ULONG Type', () => {
    const minMaxCases = [
        { value: MIN_ULONG_VALUE, expected: 0n as ULONG, description: 'Given the ULONG type, When the minimum value is checked, Then it should be 0n' },
        { value: MAX_ULONG_VALUE, expected: 18446744073709551615n as ULONG, description: 'Given the ULONG type, When the maximum value is checked, Then it should be 18446744073709551615n' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the ULONG type, When the mask value is checked, Then it should be 0xFFFFFFFFFFFFFFFFn', () => {
        expect(ULONG_MASK).toBe(0xFFFFFFFFFFFFFFFFn as ULONG);
    });

    it('Given the ULONG type, When the bit positions are checked, Then it should include positions 0 through 63', () => {
        expect(ULONG_BIT_POSITIONS).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63
        ]);
    });

    const binaryPatternCases = [
        { binary: '1010101010101010101010101010101010101010101010101010101010101010', matches: true, description: 'Given the ULONG type, When the binary pattern is checked, Then it should match "1010101010101010101010101010101010101010101010101010101010101010"' },
        { binary: '1111111111111111111111111111111111111111111111111111111111111111', matches: true, description: 'Given the ULONG type, When the binary pattern is checked, Then it should match "1111111111111111111111111111111111111111111111111111111111111111"' },
        { binary: '', matches: false, description: 'Given the ULONG type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '10101010101010101010101010101010101010101010101010101010101010101', matches: false, description: 'Given the ULONG type, When the binary pattern is checked, Then it should not match "10101010101010101010101010101010101010101010101010101010101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(ULONG_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validULongCases = [
        { value: 0n, isValid: true, description: 'Given a value of 0n, When it is checked against the ULONG type, Then it should be recognized as a valid ULONG' },
        { value: 18446744073709551615n, isValid: true, description: 'Given a value of 18446744073709551615n, When it is checked against the ULONG type, Then it should be recognized as a valid ULONG' },
    ];

    validULongCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isULong(value)).toBe(isValid);
        });
    });

    const invalidULongCases = [
        { value: -1n, isValid: false, description: 'Given a value of -1n, When it is checked against the ULONG type, Then it should not be recognized as a valid ULONG' },
        { value: 18446744073709551616n, isValid: false, description: 'Given a value of 18446744073709551616n, When it is checked against the ULONG type, Then it should not be recognized as a valid ULONG' },
        { value: 100000000000000000000n, isValid: false, description: 'Given a value of 100000000000000000000n, When it is checked against the ULONG type, Then it should not be recognized as a valid ULONG' },
    ];

    invalidULongCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isULong(value)).toBe(isValid);
        });
    });
});
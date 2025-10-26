import { describe, it, expect } from 'vitest';
import type { USHORT } from '@/sys/primitives/ushort';
import {
    MIN_USHORT_VALUE,
    MAX_USHORT_VALUE,
    USHORT_MASK,
    USHORT_BIT_POSITIONS,
    USHORT_BINARY_PATTERN,
    isUShort
} from '@/sys/primitives/ushort';

describe('USHORT Type', () => {
    const minMaxCases = [
        { value: MIN_USHORT_VALUE, expected: 0 as USHORT, description: 'Given the USHORT type, When the minimum value is checked, Then it should be 0' },
        { value: MAX_USHORT_VALUE, expected: 65535 as USHORT, description: 'Given the USHORT type, When the maximum value is checked, Then it should be 65535' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the USHORT type, When the mask value is checked, Then it should be 0xFFFF', () => {
        expect(USHORT_MASK).toBe(0xFFFF as USHORT);
    });

    it('Given the USHORT type, When the bit positions are checked, Then it should include positions 0 through 15', () => {
        expect(USHORT_BIT_POSITIONS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    const binaryPatternCases = [
        { binary: '1010101010101010', matches: true, description: 'Given the USHORT type, When the binary pattern is checked, Then it should match "1010101010101010"' },
        { binary: '1111111111111111', matches: true, description: 'Given the USHORT type, When the binary pattern is checked, Then it should match "1111111111111111"' },
        { binary: '', matches: false, description: 'Given the USHORT type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '10101010101010101', matches: false, description: 'Given the USHORT type, When the binary pattern is checked, Then it should not match "10101010101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(USHORT_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validUShortCases = [
        { value: 0, isValid: true, description: 'Given a value of 0, When it is checked against the USHORT type, Then it should be recognized as a valid USHORT' },
        { value: 65535, isValid: true, description: 'Given a value of 65535, When it is checked against the USHORT type, Then it should be recognized as a valid USHORT' },
    ];

    validUShortCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isUShort(value)).toBe(isValid);
        });
    });

    const invalidUShortCases = [
        { value: -1, isValid: false, description: 'Given a value of -1, When it is checked against the USHORT type, Then it should not be recognized as a valid USHORT' },
        { value: 65536, isValid: false, description: 'Given a value of 65536, When it is checked against the USHORT type, Then it should not be recognized as a valid USHORT' },
        { value: 100000, isValid: false, description: 'Given a value of 100000, When it is checked against the USHORT type, Then it should not be recognized as a valid USHORT' },
    ];

    invalidUShortCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isUShort(value)).toBe(isValid);
        });
    });
});
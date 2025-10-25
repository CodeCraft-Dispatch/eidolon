import { describe, it, expect } from 'vitest';
import type { INT } from '@/sys/primitives/int';
import {
    MIN_INT_VALUE,
    MAX_INT_VALUE,
    INT_MASK,
    INT_BIT_POSITIONS,
    INT_BINARY_PATTERN,
    isInt
} from '@/sys/primitives/int';

describe('INT Type', () => {
    const minMaxCases = [
        { value: MIN_INT_VALUE, expected: -2147483648 as INT, description: 'Given the INT type, When the minimum value is checked, Then it should be -2147483648' },
        { value: MAX_INT_VALUE, expected: 2147483647 as INT, description: 'Given the INT type, When the maximum value is checked, Then it should be 2147483647' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the INT type, When the mask value is checked, Then it should be 0xFFFFFFFF', () => {
        expect(INT_MASK).toBe(0xFFFFFFFF as INT);
    });

    it('Given the INT type, When the bit positions are checked, Then it should include positions 0 through 31', () => {
        expect(INT_BIT_POSITIONS).toEqual([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
        ]);
    });

    const binaryPatternCases = [
        { binary: '10101010101010101010101010101010', matches: true, description: 'Given the INT type, When the binary pattern is checked, Then it should match "10101010101010101010101010101010"' },
        { binary: '11111111111111111111111111111111', matches: true, description: 'Given the INT type, When the binary pattern is checked, Then it should match "11111111111111111111111111111111"' },
        { binary: '', matches: false, description: 'Given the INT type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '101010101010101010101010101010101', matches: false, description: 'Given the INT type, When the binary pattern is checked, Then it should not match "101010101010101010101010101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(INT_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validIntCases = [
        { value: -2147483648 as number, isValid: true, description: 'Given a value of -2147483648, When it is checked against the INT type, Then it should be recognized as a valid INT' },
        { value: 2147483647 as number, isValid: true, description: 'Given a value of 2147483647, When it is checked against the INT type, Then it should be recognized as a valid INT' },
    ];

    validIntCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isInt(value as number)).toBe(isValid);
        });
    });

    const invalidIntCases = [
        { value: -2147483649, isValid: false, description: 'Given a value of -2147483649, When it is checked against the INT type, Then it should not be recognized as a valid INT' },
        { value: 2147483648, isValid: false, description: 'Given a value of 2147483648, When it is checked against the INT type, Then it should not be recognized as a valid INT' },
        { value: 10000000000, isValid: false, description: 'Given a value of 10000000000, When it is checked against the INT type, Then it should not be recognized as a valid INT' },
    ];

    invalidIntCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isInt(value)).toBe(isValid);
        });
    });
});
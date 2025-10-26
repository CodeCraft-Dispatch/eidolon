import { describe, it, expect } from 'vitest';
import type { SHORT } from '@/sys/primitives/short';
import {
    MIN_SHORT_VALUE,
    MAX_SHORT_VALUE,
    SHORT_MASK,
    SHORT_BIT_POSITIONS,
    SHORT_BINARY_PATTERN,
    isShort
} from '@/sys/primitives/short';

describe('SHORT Type', () => {
    const minMaxCases = [
        { value: MIN_SHORT_VALUE, expected: -32768 as SHORT, description: 'Given the SHORT type, When the minimum value is checked, Then it should be -32768' },
        { value: MAX_SHORT_VALUE, expected: 32767 as SHORT, description: 'Given the SHORT type, When the maximum value is checked, Then it should be 32767' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the SHORT type, When the mask value is checked, Then it should be 0xFFFF', () => {
        expect(SHORT_MASK).toBe(0xFFFF as SHORT);
    });

    it('Given the SHORT type, When the bit positions are checked, Then it should include positions 0 through 15', () => {
        expect(SHORT_BIT_POSITIONS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    const binaryPatternCases = [
        { binary: '1010101010101010', matches: true, description: 'Given the SHORT type, When the binary pattern is checked, Then it should match "1010101010101010"' },
        { binary: '1111111111111111', matches: true, description: 'Given the SHORT type, When the binary pattern is checked, Then it should match "1111111111111111"' },
        { binary: '', matches: false, description: 'Given the SHORT type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '10101010101010101', matches: false, description: 'Given the SHORT type, When the binary pattern is checked, Then it should not match "10101010101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(SHORT_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validShortCases = [
        { value: -32768, isValid: true, description: 'Given a value of -32768, When it is checked against the SHORT type, Then it should be recognized as a valid SHORT' },
        { value: 32767, isValid: true, description: 'Given a value of 32767, When it is checked against the SHORT type, Then it should be recognized as a valid SHORT' },
    ];

    validShortCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isShort(value)).toBe(isValid);
        });
    });

    const invalidShortCases = [
        { value: -32769, isValid: false, description: 'Given a value of -32769, When it is checked against the SHORT type, Then it should not be recognized as a valid SHORT' },
        { value: 32768, isValid: false, description: 'Given a value of 32768, When it is checked against the SHORT type, Then it should not be recognized as a valid SHORT' },
        { value: 100000, isValid: false, description: 'Given a value of 100000, When it is checked against the SHORT type, Then it should not be recognized as a valid SHORT' },
    ];

    invalidShortCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isShort(value)).toBe(isValid);
        });
    });
});
import { describe, it, expect } from 'vitest';
import type { BYTE } from '@/sys/primitives/byte';
import {
    MIN_BYTE_VALUE,
    MAX_BYTE_VALUE,
    BYTE_MASK,
    BYTE_BIT_POSITIONS,
    BYTE_BINARY_PATTERN,
    isByte
} from '@/sys/primitives/byte';

describe('BYTE Type', () => {
    const minMaxCases = [
        { value: MIN_BYTE_VALUE, expected: 0 as BYTE, description: 'Given the BYTE type, When the minimum value is checked, Then it should be 0' },
        { value: MAX_BYTE_VALUE, expected: 255 as BYTE, description: 'Given the BYTE type, When the maximum value is checked, Then it should be 255' },
    ];

    minMaxCases.forEach(({ value, expected, description }) => {
        it(description, () => {
            expect(value).toBe(expected);
        });
    });

    it('Given the BYTE type, When the mask value is checked, Then it should be 0xFF', () => {
        expect(BYTE_MASK).toBe(0xFF as BYTE);
    });

    it('Given the BYTE type, When the bit positions are checked, Then it should include positions 0 through 7', () => {
        expect(BYTE_BIT_POSITIONS).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });

    const binaryPatternCases = [
        { binary: '10101010', matches: true, description: 'Given the BYTE type, When the binary pattern is checked, Then it should match "10101010"' },
        { binary: '11111111', matches: true, description: 'Given the BYTE type, When the binary pattern is checked, Then it should match "11111111"' },
        { binary: '00000000', matches: true, description: 'Given the BYTE type, When the binary pattern is checked, Then it should match "00000000"' },
        { binary: '', matches: false, description: 'Given the BYTE type, When the binary pattern is checked, Then it should not match an empty string' },
        { binary: '101010101', matches: false, description: 'Given the BYTE type, When the binary pattern is checked, Then it should not match "101010101"' },
    ];

    binaryPatternCases.forEach(({ binary, matches, description }) => {
        it(description, () => {
            expect(BYTE_BINARY_PATTERN.test(binary)).toBe(matches);
        });
    });

    const validByteCases = [
        { value: 0, isValid: true, description: 'Given a value of 0, When it is checked against the BYTE type, Then it should be recognized as a valid BYTE' },
        { value: 255, isValid: true, description: 'Given a value of 255, When it is checked against the BYTE type, Then it should be recognized as a valid BYTE' },
    ];

    validByteCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isByte(value)).toBe(isValid);
        });
    });

    const invalidByteCases = [
        { value: -1, isValid: false, description: 'Given a value of -1, When it is checked against the BYTE type, Then it should not be recognized as a valid BYTE' },
        { value: 256, isValid: false, description: 'Given a value of 256, When it is checked against the BYTE type, Then it should not be recognized as a valid BYTE' },
        { value: 1000, isValid: false, description: 'Given a value of 1000, When it is checked against the BYTE type, Then it should not be recognized as a valid BYTE' },
    ];

    invalidByteCases.forEach(({ value, isValid, description }) => {
        it(description, () => {
            expect(isByte(value)).toBe(isValid);
        });
    });
});
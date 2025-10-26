import { describe, it, expect } from 'vitest';
import type { UINT } from '@/sys/primitives/uint';
import {
    uintToNumberValue,
    unsafeUInt,
    parseUInt,
    clampToUInt,
    compareUInts
} from '@/sys/primitives/uint';

describe('UINT Methods', () => {
    describe('uintToNumberValue', () => {
        const cases = [
            { uint: 4294967295 as UINT, expected: 4294967295, description: 'Given a UINT value of 4294967295, When uintToNumberValue is called, Then it should return the number 4294967295' },
            { uint: 0 as UINT, expected: 0, description: 'Given a UINT value of 0, When uintToNumberValue is called, Then it should return the number 0' },
        ];

        cases.forEach(({ uint, expected, description }) => {
            it(description, () => {
                expect(uintToNumberValue(uint)).toBe(expected);
            });
        });
    });

    describe('unsafeUInt', () => {
        const cases = [
            { value: 2147483648, expected: 2147483648 as UINT, description: 'Given a number value of 2147483648, When unsafeUInt is called, Then it should return a UINT value of 2147483648' },
            { value: 5000000000, expected: 705032704 as UINT, description: 'Given a number value of 5000000000, When unsafeUInt is called, Then it should return a UINT value of 705032704' },
            { value: -1, expected: 4294967295 as UINT, description: 'Given a number value of -1, When unsafeUInt is called, Then it should return a UINT value of 4294967295' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeUInt(value)).toBe(expected);
            });
        });
    });

    describe('parseUInt', () => {
        const cases = [
            { value: 3000000000, success: true, expected: 3000000000 as UINT, error: null, description: 'Given a number value of 3000000000, When parseUInt is called, Then it should return a success result with the value 3000000000' },
            { value: -1, success: false, expected: null, error: 'Value must be an unsigned integer in range [0, 4294967295], received: -1', description: 'Given a number value of -1, When parseUInt is called, Then it should return an error result with a meaningful message' },
            { value: 5000000000, success: false, expected: null, error: 'Value must be an unsigned integer in range [0, 4294967295], received: 5000000000', description: 'Given a number value of 5000000000, When parseUInt is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseUInt(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToUInt', () => {
        const cases = [
            { value: 2000000000, expected: 2000000000 as UINT, description: 'Given a number value of 2000000000, When clampToUInt is called, Then it should return a UINT value of 2000000000' },
            { value: -50, expected: 0 as UINT, description: 'Given a number value of -50, When clampToUInt is called, Then it should return a UINT value of 0' },
            { value: 5000000000, expected: 4294967295 as UINT, description: 'Given a number value of 5000000000, When clampToUInt is called, Then it should return a UINT value of 4294967295' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToUInt(value)).toBe(expected);
            });
        });
    });

    describe('compareUInts', () => {
        const cases = [
            { a: 2000000000 as UINT, b: 2000000000 as UINT, expected: 0, description: 'Given two UINT values of 2000000000 and 2000000000, When compareUInts is called, Then it should return 0' },
            { a: 1000000000 as UINT, b: 2000000000 as UINT, expected: -1, description: 'Given two UINT values of 1000000000 and 2000000000, When compareUInts is called, Then it should return -1' },
            { a: 3000000000 as UINT, b: 2000000000 as UINT, expected: 1, description: 'Given two UINT values of 3000000000 and 2000000000, When compareUInts is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareUInts(a, b)).toBe(expected);
            });
        });
    });
});
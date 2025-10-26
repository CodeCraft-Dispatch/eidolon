import { describe, it, expect } from 'vitest';
import type { USHORT } from '@/sys/primitives/ushort';
import {
    ushortToNumberValue,
    unsafeUShort,
    parseUShort,
    clampToUShort,
    compareUShorts
} from '@/sys/primitives/ushort';

describe('USHORT Methods', () => {
    describe('ushortToNumberValue', () => {
        const cases = [
            { ushort: 65535 as USHORT, expected: 65535, description: 'Given a USHORT value of 65535, When ushortToNumberValue is called, Then it should return the number 65535' },
            { ushort: 0 as USHORT, expected: 0, description: 'Given a USHORT value of 0, When ushortToNumberValue is called, Then it should return the number 0' },
        ];

        cases.forEach(({ ushort, expected, description }) => {
            it(description, () => {
                expect(ushortToNumberValue(ushort)).toBe(expected);
            });
        });
    });

    describe('unsafeUShort', () => {
        const cases = [
            { value: 32768, expected: 32768 as USHORT, description: 'Given a number value of 32768, When unsafeUShort is called, Then it should return a USHORT value of 32768' },
            { value: 70000, expected: 4464 as USHORT, description: 'Given a number value of 70000, When unsafeUShort is called, Then it should return a USHORT value of 4464' },
            { value: -1, expected: 65535 as USHORT, description: 'Given a number value of -1, When unsafeUShort is called, Then it should return a USHORT value of 65535' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeUShort(value)).toBe(expected);
            });
        });
    });

    describe('parseUShort', () => {
        const cases = [
            { value: 50000, success: true, expected: 50000 as USHORT, error: null, description: 'Given a number value of 50000, When parseUShort is called, Then it should return a success result with the value 50000' },
            { value: -1, success: false, expected: null, error: 'Value must be an unsigned integer in range [0, 65535], received: -1', description: 'Given a number value of -1, When parseUShort is called, Then it should return an error result with a meaningful message' },
            { value: 70000, success: false, expected: null, error: 'Value must be an unsigned integer in range [0, 65535], received: 70000', description: 'Given a number value of 70000, When parseUShort is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseUShort(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToUShort', () => {
        const cases = [
            { value: 30000, expected: 30000 as USHORT, description: 'Given a number value of 30000, When clampToUShort is called, Then it should return a USHORT value of 30000' },
            { value: -50, expected: 0 as USHORT, description: 'Given a number value of -50, When clampToUShort is called, Then it should return a USHORT value of 0' },
            { value: 70000, expected: 65535 as USHORT, description: 'Given a number value of 70000, When clampToUShort is called, Then it should return a USHORT value of 65535' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToUShort(value)).toBe(expected);
            });
        });
    });

    describe('compareUShorts', () => {
        const cases = [
            { a: 30000 as USHORT, b: 30000 as USHORT, expected: 0, description: 'Given two USHORT values of 30000 and 30000, When compareUShorts is called, Then it should return 0' },
            { a: 20000 as USHORT, b: 30000 as USHORT, expected: -1, description: 'Given two USHORT values of 20000 and 30000, When compareUShorts is called, Then it should return -1' },
            { a: 40000 as USHORT, b: 30000 as USHORT, expected: 1, description: 'Given two USHORT values of 40000 and 30000, When compareUShorts is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareUShorts(a, b)).toBe(expected);
            });
        });
    });
});
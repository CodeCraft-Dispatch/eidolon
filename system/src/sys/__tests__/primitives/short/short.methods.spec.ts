import { describe, it, expect } from 'vitest';
import type { SHORT } from '@/sys/primitives/short';
import {
    shortToNumberValue,
    unsafeShort,
    parseShort,
    clampToShort,
    compareShorts
} from '@/sys/primitives/short';

describe('SHORT Methods', () => {
    describe('shortToNumberValue', () => {
        const cases = [
            { short: 32767 as SHORT, expected: 32767, description: 'Given a SHORT value of 32767, When shortToNumberValue is called, Then it should return the number 32767' },
            { short: -32768 as SHORT, expected: -32768, description: 'Given a SHORT value of -32768, When shortToNumberValue is called, Then it should return the number -32768' },
        ];

        cases.forEach(({ short, expected, description }) => {
            it(description, () => {
                expect(shortToNumberValue(short)).toBe(expected);
            });
        });
    });

    describe('unsafeShort', () => {
        const cases = [
            { value: 12345, expected: 12345 as SHORT, description: 'Given a number value of 12345, When unsafeShort is called, Then it should return a SHORT value of 12345' },
            { value: 40000, expected: -25536 as SHORT, description: 'Given a number value of 40000, When unsafeShort is called, Then it should return a SHORT value of -25536' },
            { value: -40000, expected: 25536 as SHORT, description: 'Given a number value of -40000, When unsafeShort is called, Then it should return a SHORT value of 25536' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeShort(value)).toBe(expected & 0xFFFF);
            });
        });
    });

    describe('parseShort', () => {
        const cases = [
            { value: 12345, success: true, expected: 12345 as SHORT, error: null, description: 'Given a number value of 12345, When parseShort is called, Then it should return a success result with the value 12345' },
            { value: -40000, success: false, expected: null, error: 'Value must be a signed integer in range [-32768, 32767], received: -40000', description: 'Given a number value of -40000, When parseShort is called, Then it should return an error result with a meaningful message' },
            { value: 40000, success: false, expected: null, error: 'Value must be a signed integer in range [-32768, 32767], received: 40000', description: 'Given a number value of 40000, When parseShort is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseShort(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToShort', () => {
        const cases = [
            { value: 10000, expected: 10000 as SHORT, description: 'Given a number value of 10000, When clampToShort is called, Then it should return a SHORT value of 10000' },
            { value: -40000, expected: -32768 as SHORT, description: 'Given a number value of -40000, When clampToShort is called, Then it should return a SHORT value of -32768' },
            { value: 40000, expected: 32767 as SHORT, description: 'Given a number value of 40000, When clampToShort is called, Then it should return a SHORT value of 32767' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToShort(value)).toBe(expected);
            });
        });
    });

    describe('compareShorts', () => {
        const cases = [
            { a: 10000 as SHORT, b: 10000 as SHORT, expected: 0, description: 'Given two SHORT values of 10000 and 10000, When compareShorts is called, Then it should return 0' },
            { a: -20000 as SHORT, b: 10000 as SHORT, expected: -1, description: 'Given two SHORT values of -20000 and 10000, When compareShorts is called, Then it should return -1' },
            { a: 20000 as SHORT, b: -10000 as SHORT, expected: 1, description: 'Given two SHORT values of 20000 and -10000, When compareShorts is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareShorts(a, b)).toBe(expected);
            });
        });
    });
});
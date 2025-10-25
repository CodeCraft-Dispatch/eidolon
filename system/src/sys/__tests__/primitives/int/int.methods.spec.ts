import { describe, it, expect } from 'vitest';
import type { INT } from '@/sys/primitives/int';
import {
    intToNumberValue,
    unsafeInt,
    parseInt,
    clampToInt,
    compareInts
} from '@/sys/primitives/int';

describe('INT Methods', () => {
    describe('intToNumberValue', () => {
        const cases = [
            { int: 2147483647 as INT, expected: 2147483647, description: 'Given an INT value of 2147483647, When intToNumberValue is called, Then it should return the number 2147483647' },
            { int: -2147483648 as INT, expected: -2147483648, description: 'Given an INT value of -2147483648, When intToNumberValue is called, Then it should return the number -2147483648' },
        ];

        cases.forEach(({ int, expected, description }) => {
            it(description, () => {
                expect(intToNumberValue(int)).toBe(expected);
            });
        });
    });

    describe('unsafeInt', () => {
        const cases = [
            { value: 100, expected: 100 as INT, description: 'Given a number value of 100, When unsafeInt is called, Then it should return an INT value of 100' },
            { value: 3000000000, expected: -1294967296 as INT, description: 'Given a number value of 3000000000, When unsafeInt is called, Then it should return an INT value of -1294967296' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeInt(value)).toBe(expected);
            });
        });
    });

    describe('parseInt', () => {
        const cases = [
            { value: 100, success: true, expected: 100 as INT, error: null, description: 'Given a number value of 100, When parseInt is called, Then it should return a success result with the value 100' },
            { value: -3000000000, success: false, expected: null, error: 'Value must be a signed integer in range [-2147483648, 2147483647], received: -3000000000', description: 'Given a number value of -3000000000, When parseInt is called, Then it should return an error result with a meaningful message' },
            { value: 3000000000, success: false, expected: null, error: 'Value must be a signed integer in range [-2147483648, 2147483647], received: 3000000000', description: 'Given a number value of 3000000000, When parseInt is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseInt(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToInt', () => {
        const cases = [
            { value: 100, expected: 100 as INT, description: 'Given a number value of 100, When clampToInt is called, Then it should return an INT value of 100' },
            { value: -3000000000, expected: -2147483648 as INT, description: 'Given a number value of -3000000000, When clampToInt is called, Then it should return an INT value of -2147483648' },
            { value: 3000000000, expected: 2147483647 as INT, description: 'Given a number value of 3000000000, When clampToInt is called, Then it should return an INT value of 2147483647' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToInt(value)).toBe(expected);
            });
        });
    });

    describe('compareInts', () => {
        const cases = [
            { a: 100 as INT, b: 100 as INT, expected: 0, description: 'Given two INT values of 100 and 100, When compareInts is called, Then it should return 0' },
            { a: 50 as INT, b: 100 as INT, expected: -1, description: 'Given two INT values of 50 and 100, When compareInts is called, Then it should return -1' },
            { a: 200 as INT, b: 100 as INT, expected: 1, description: 'Given two INT values of 200 and 100, When compareInts is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareInts(a, b)).toBe(expected);
            });
        });
    });
});
import { describe, it, expect } from 'vitest';
import type { LONG } from '@/sys/primitives/long';
import {
    longToBigIntValue,
    unsafeLong,
    parseLong,
    clampToLong,
    compareLongs
} from '@/sys/primitives/long';

describe('LONG Methods', () => {
    describe('longToBigIntValue', () => {
        const cases = [
            { long: 9223372036854775807n as LONG, expected: 9223372036854775807n, description: 'Given a LONG value of 9223372036854775807n, When longToBigIntValue is called, Then it should return the bigint 9223372036854775807n' },
            { long: -9223372036854775808n as LONG, expected: -9223372036854775808n, description: 'Given a LONG value of -9223372036854775808n, When longToBigIntValue is called, Then it should return the bigint -9223372036854775808n' },
        ];

        cases.forEach(({ long, expected, description }) => {
            it(description, () => {
                expect(longToBigIntValue(long)).toBe(expected);
            });
        });
    });

    describe('unsafeLong', () => {
        const cases = [
            { value: 100n, expected: 100n as LONG, description: 'Given a bigint value of 100n, When unsafeLong is called, Then it should return a LONG value of 100n' },
            { value: 9223372036854775808n, expected: -9223372036854775808n as LONG, description: 'Given a bigint value of 9223372036854775808n, When unsafeLong is called, Then it should return a LONG value of -9223372036854775808n' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeLong(value)).toBe(expected);
            });
        });
    });

    describe('parseLong', () => {
        const cases = [
            { value: 100n, success: true, expected: 100n as LONG, error: null, description: 'Given a bigint value of 100n, When parseLong is called, Then it should return a success result with the value 100n' },
            { value: -9223372036854775809n, success: false, expected: null, error: 'Value must be a bigint in range [-9223372036854775808, 9223372036854775807], received: -9223372036854775809', description: 'Given a bigint value of -9223372036854775809n, When parseLong is called, Then it should return an error result with a meaningful message' },
            { value: 9223372036854775808n, success: false, expected: null, error: 'Value must be a bigint in range [-9223372036854775808, 9223372036854775807], received: 9223372036854775808', description: 'Given a bigint value of 9223372036854775808n, When parseLong is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseLong(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToLong', () => {
        const cases = [
            { value: 100n, expected: 100n as LONG, description: 'Given a bigint value of 100n, When clampToLong is called, Then it should return a LONG value of 100n' },
            { value: -9223372036854775809n, expected: -9223372036854775808n as LONG, description: 'Given a bigint value of -9223372036854775809n, When clampToLong is called, Then it should return a LONG value of -9223372036854775808n' },
            { value: 9223372036854775808n, expected: 9223372036854775807n as LONG, description: 'Given a bigint value of 9223372036854775808n, When clampToLong is called, Then it should return a LONG value of 9223372036854775807n' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToLong(value)).toBe(expected);
            });
        });
    });

    describe('compareLongs', () => {
        const cases = [
            { a: 100n as LONG, b: 100n as LONG, expected: 0n, description: 'Given two LONG values of 100n and 100n, When compareLongs is called, Then it should return 0' },
            { a: 50n as LONG, b: 100n as LONG, expected: -1n, description: 'Given two LONG values of 50n and 100n, When compareLongs is called, Then it should return -1' },
            { a: 200n as LONG, b: 100n as LONG, expected: 1n, description: 'Given two LONG values of 200n and 100n, When compareLongs is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareLongs(a, b)).toBe(expected);
            });
        });
    });
});
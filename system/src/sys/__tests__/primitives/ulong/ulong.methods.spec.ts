import { describe, it, expect } from 'vitest';
import type { ULONG } from '@/sys/primitives/ulong';
import {
    ulongToBigIntValue,
    unsafeULong,
    parseULong,
    clampToULong,
    compareULongs
} from '@/sys/primitives/ulong';

describe('ULONG Methods', () => {
    describe('ulongToBigIntValue', () => {
        const cases = [
            { ulong: 18446744073709551615n as ULONG, expected: 18446744073709551615n, description: 'Given a ULONG value of 18446744073709551615n, When ulongToBigIntValue is called, Then it should return the bigint 18446744073709551615n' },
            { ulong: 0n as ULONG, expected: 0n, description: 'Given a ULONG value of 0n, When ulongToBigIntValue is called, Then it should return the bigint 0n' },
        ];

        cases.forEach(({ ulong, expected, description }) => {
            it(description, () => {
                expect(ulongToBigIntValue(ulong)).toBe(expected);
            });
        });
    });

    describe('unsafeULong', () => {
        const cases = [
            { value: 100n, expected: 100n as ULONG, description: 'Given a bigint value of 100n, When unsafeULong is called, Then it should return a ULONG value of 100n' },
            { value: 18446744073709551616n, expected: 0n as ULONG, description: 'Given a bigint value of 18446744073709551616n, When unsafeULong is called, Then it should return a ULONG value of 0n (wrapped around)' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeULong(value)).toBe(expected);
            });
        });
    });

    describe('parseULong', () => {
        const cases = [
            { value: 100n, success: true, expected: 100n as ULONG, error: null, description: 'Given a bigint value of 100n, When parseULong is called, Then it should return a success result with the value 100n' },
            { value: -1n, success: false, expected: null, error: 'Value must be a bigint in range [0, 18446744073709551615], received: -1', description: 'Given a bigint value of -1n, When parseULong is called, Then it should return an error result with a meaningful message' },
            { value: 18446744073709551616n, success: false, expected: null, error: 'Value must be a bigint in range [0, 18446744073709551615], received: 18446744073709551616', description: 'Given a bigint value of 18446744073709551616n, When parseULong is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseULong(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToULong', () => {
        const cases = [
            { value: 100n, expected: 100n as ULONG, description: 'Given a bigint value of 100n, When clampToULong is called, Then it should return a ULONG value of 100n' },
            { value: -1n, expected: 0n as ULONG, description: 'Given a bigint value of -1n, When clampToULong is called, Then it should return a ULONG value of 0n' },
            { value: 18446744073709551616n, expected: 18446744073709551615n as ULONG, description: 'Given a bigint value of 18446744073709551616n, When clampToULong is called, Then it should return a ULONG value of 18446744073709551615n' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToULong(value)).toBe(expected);
            });
        });
    });

    describe('compareULongs', () => {
        const cases = [
            { a: 100n as ULONG, b: 100n as ULONG, expected: 0n, description: 'Given two ULONG values of 100n and 100n, When compareULongs is called, Then it should return 0' },
            { a: 50n as ULONG, b: 100n as ULONG, expected: -1n, description: 'Given two ULONG values of 50n and 100n, When compareULongs is called, Then it should return -1' },
            { a: 200n as ULONG, b: 100n as ULONG, expected: 1n, description: 'Given two ULONG values of 200n and 100n, When compareULongs is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareULongs(a, b)).toBe(expected);
            });
        });
    });
});
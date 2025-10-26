import { describe, it, expect } from 'vitest';
import type { SBYTE } from '@/sys/primitives/sbyte';
import {
    sbyteToNumberValue,
    unsafeSByte,
    parseSByte,
    clampToSByte,
    compareSBytes
} from '@/sys/primitives/sbyte';

describe('SBYTE Methods', () => {
    describe('sbyteToNumberValue', () => {
        const cases = [
            { sbyte: 127 as SBYTE, expected: 127, description: 'Given an SBYTE value of 127, When sbyteToNumberValue is called, Then it should return the number 127' },
            { sbyte: -128 as SBYTE, expected: -128, description: 'Given an SBYTE value of -128, When sbyteToNumberValue is called, Then it should return the number -128' },
        ];

        cases.forEach(({ sbyte, expected, description }) => {
            it(description, () => {
                expect(sbyteToNumberValue(sbyte)).toBe(expected);
            });
        });
    });

    describe('unsafeSByte', () => {
        const cases = [
            { value: 100, expected: 100 as SBYTE, description: 'Given a number value of 100, When unsafeSByte is called, Then it should return an SBYTE value of 100' },
            { value: 300, expected: 44 as SBYTE, description: 'Given a number value of 300, When unsafeSByte is called, Then it should return an SBYTE value of 44' },
            { value: -200, expected: 56 as SBYTE, description: 'Given a number value of -200, When unsafeSByte is called, Then it should return an SBYTE value of 56' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeSByte(value)).toBe(expected);
            });
        });
    });

    describe('parseSByte', () => {
        const cases = [
            { value: 100, success: true, expected: 100 as SBYTE, error: null, description: 'Given a number value of 100, When parseSByte is called, Then it should return a success result with the value 100' },
            { value: -200, success: false, expected: null, error: 'Value must be a signed integer in range [-128, 127], received: -200', description: 'Given a number value of -200, When parseSByte is called, Then it should return an error result with a meaningful message' },
            { value: 300, success: false, expected: null, error: 'Value must be a signed integer in range [-128, 127], received: 300', description: 'Given a number value of 300, When parseSByte is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseSByte(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToSByte', () => {
        const cases = [
            { value: 100, expected: 100 as SBYTE, description: 'Given a number value of 100, When clampToSByte is called, Then it should return an SBYTE value of 100' },
            { value: -200, expected: -128 as SBYTE, description: 'Given a number value of -200, When clampToSByte is called, Then it should return an SBYTE value of -128' },
            { value: 300, expected: 127 as SBYTE, description: 'Given a number value of 300, When clampToSByte is called, Then it should return an SBYTE value of 127' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToSByte(value)).toBe(expected);
            });
        });
    });

    describe('compareSBytes', () => {
        const cases = [
            { a: 100 as SBYTE, b: 100 as SBYTE, expected: 0, description: 'Given two SBYTE values of 100 and 100, When compareSBytes is called, Then it should return 0' },
            { a: 50 as SBYTE, b: 100 as SBYTE, expected: -1, description: 'Given two SBYTE values of 50 and 100, When compareSBytes is called, Then it should return -1' },
            { a: 127 as SBYTE, b: -128 as SBYTE, expected: 1, description: 'Given two SBYTE values of 127 and -128, When compareSBytes is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareSBytes(a, b)).toBe(expected);
            });
        });
    });
});
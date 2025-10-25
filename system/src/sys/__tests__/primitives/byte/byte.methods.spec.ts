import { describe, it, expect } from 'vitest';
import type { BYTE } from '@/sys/primitives/byte';
import {
    byteToNumberValue,
    unsafeByte,
    parseByte,
    clampToByte,
    compareBytes
} from '@/sys/primitives/byte';

describe('BYTE Methods', () => {
    describe('byteToNumberValue', () => {
        const cases = [
            { byte: 255 as BYTE, expected: 255, description: 'Given a BYTE value of 255, When byteToNumberValue is called, Then it should return the number 255' },
            { byte: 0 as BYTE, expected: 0, description: 'Given a BYTE value of 0, When byteToNumberValue is called, Then it should return the number 0' },
        ];

        cases.forEach(({ byte, expected, description }) => {
            it(description, () => {
                expect(byteToNumberValue(byte)).toBe(expected);
            });
        });
    });

    describe('unsafeByte', () => {
        const cases = [
            { value: 128, expected: 128 as BYTE, description: 'Given a number value of 128, When unsafeByte is called, Then it should return a BYTE value of 128' },
            { value: 300, expected: 44 as BYTE, description: 'Given a number value of 300, When unsafeByte is called, Then it should return a BYTE value of 44' },
            { value: -5, expected: 251 as BYTE, description: 'Given a number value of -5, When unsafeByte is called, Then it should return a BYTE value of 251' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(unsafeByte(value)).toBe(expected);
            });
        });
    });

    describe('parseByte', () => {
        const cases = [
            { value: 200, success: true, expected: 200 as BYTE, error: null, description: 'Given a number value of 200, When parseByte is called, Then it should return a success result with the value 200' },
            { value: -1, success: false, expected: null, error: 'Value must be an unsigned integer in range [0, 255], received: -1', description: 'Given a number value of -1, When parseByte is called, Then it should return an error result with a meaningful message' },
            { value: 300, success: false, expected: null, error: 'Value must be an unsigned integer in range [0, 255], received: 300', description: 'Given a number value of 300, When parseByte is called, Then it should return an error result with a meaningful message' },
        ];

        cases.forEach(({ value, success, expected, error, description }) => {
            it(description, () => {
                const result = parseByte(value);
                expect(result.success).toBe(success);
                if (result.success) {
                    expect(result.value).toBe(expected);
                } else {
                    expect(result.error).toBe(error);
                }
            });
        });
    });

    describe('clampToByte', () => {
        const cases = [
            { value: 100, expected: 100 as BYTE, description: 'Given a number value of 100, When clampToByte is called, Then it should return a BYTE value of 100' },
            { value: -50, expected: 0 as BYTE, description: 'Given a number value of -50, When clampToByte is called, Then it should return a BYTE value of 0' },
            { value: 300, expected: 255 as BYTE, description: 'Given a number value of 300, When clampToByte is called, Then it should return a BYTE value of 255' },
        ];

        cases.forEach(({ value, expected, description }) => {
            it(description, () => {
                expect(clampToByte(value)).toBe(expected);
            });
        });
    });

    describe('compareBytes', () => {
        const cases = [
            { a: 100 as BYTE, b: 100 as BYTE, expected: 0, description: 'Given two BYTE values of 100 and 100, When compareBytes is called, Then it should return 0' },
            { a: 50 as BYTE, b: 100 as BYTE, expected: -1, description: 'Given two BYTE values of 50 and 100, When compareBytes is called, Then it should return -1' },
            { a: 200 as BYTE, b: 100 as BYTE, expected: 1, description: 'Given two BYTE values of 200 and 100, When compareBytes is called, Then it should return 1' },
        ];

        cases.forEach(({ a, b, expected, description }) => {
            it(description, () => {
                expect(compareBytes(a, b)).toBe(expected);
            });
        });
    });
});
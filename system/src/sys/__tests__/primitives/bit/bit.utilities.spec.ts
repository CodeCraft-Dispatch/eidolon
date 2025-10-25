import { describe, it, expect } from 'vitest';
import { bitToBoolean, booleanToBit, toggleBit, andBits, orBits, xorBits, notBit } from '@/sys/primitives/bit';
import type { BIT } from '@/sys/primitives/bit';

describe('Utility Functions for Common Operations', () => {
    describe('bitToBoolean', () => {
        const cases = [
            { input: 1 as BIT, expected: true, description: 'Given a BIT value of 1, When bitToBoolean is called, Then it should return true' },
            { input: 0 as BIT, expected: false, description: 'Given a BIT value of 0, When bitToBoolean is called, Then it should return false' },
        ];

        cases.forEach(({ input, expected, description }) => {
            it(description, () => {
                expect(bitToBoolean(input)).toBe(expected);
            });
        });
    });

    describe('booleanToBit', () => {
        const cases = [
            { input: true, expected: 1 as BIT, description: 'Given a boolean value of true, When booleanToBit is called, Then it should return 1' },
            { input: false, expected: 0 as BIT, description: 'Given a boolean value of false, When booleanToBit is called, Then it should return 0' },
        ];

        cases.forEach(({ input, expected, description }) => {
            it(description, () => {
                expect(booleanToBit(input)).toBe(expected);
            });
        });
    });

    describe('toggleBit', () => {
        const cases = [
            { input: 1 as BIT, expected: 0 as BIT, description: 'Given a BIT value of 1, When toggleBit is called, Then it should return 0' },
            { input: 0 as BIT, expected: 1 as BIT, description: 'Given a BIT value of 0, When toggleBit is called, Then it should return 1' },
        ];

        cases.forEach(({ input, expected, description }) => {
            it(description, () => {
                expect(toggleBit(input)).toBe(expected);
            });
        });
    });

    describe('andBits', () => {
        const cases = [
            { input1: 1 as BIT, input2: 1 as BIT, expected: 1 as BIT, description: 'Given two BIT values of 1 and 1, When andBits is called, Then it should return 1' },
            { input1: 1 as BIT, input2: 0 as BIT, expected: 0 as BIT, description: 'Given two BIT values of 1 and 0, When andBits is called, Then it should return 0' },
            { input1: 0 as BIT, input2: 0 as BIT, expected: 0 as BIT, description: 'Given two BIT values of 0 and 0, When andBits is called, Then it should return 0' },
        ];

        cases.forEach(({ input1, input2, expected, description }) => {
            it(description, () => {
                expect(andBits(input1, input2)).toBe(expected);
            });
        });
    });

    describe('orBits', () => {
        const cases = [
            { input1: 1 as BIT, input2: 1 as BIT, expected: 1 as BIT, description: 'Given two BIT values of 1 and 1, When orBits is called, Then it should return 1' },
            { input1: 1 as BIT, input2: 0 as BIT, expected: 1 as BIT, description: 'Given two BIT values of 1 and 0, When orBits is called, Then it should return 1' },
            { input1: 0 as BIT, input2: 0 as BIT, expected: 0 as BIT, description: 'Given two BIT values of 0 and 0, When orBits is called, Then it should return 0' },
        ];

        cases.forEach(({ input1, input2, expected, description }) => {
            it(description, () => {
                expect(orBits(input1, input2)).toBe(expected);
            });
        });
    });

    describe('xorBits', () => {
        const cases = [
            { input1: 1 as BIT, input2: 1 as BIT, expected: 0 as BIT, description: 'Given two BIT values of 1 and 1, When xorBits is called, Then it should return 0' },
            { input1: 1 as BIT, input2: 0 as BIT, expected: 1 as BIT, description: 'Given two BIT values of 1 and 0, When xorBits is called, Then it should return 1' },
            { input1: 0 as BIT, input2: 0 as BIT, expected: 0 as BIT, description: 'Given two BIT values of 0 and 0, When xorBits is called, Then it should return 0' },
        ];

        cases.forEach(({ input1, input2, expected, description }) => {
            it(description, () => {
                expect(xorBits(input1, input2)).toBe(expected);
            });
        });
    });

    describe('notBit', () => {
        const cases = [
            { input: 1 as BIT, expected: 0 as BIT, description: 'Given a BIT value of 1, When notBit is called, Then it should return 0' },
            { input: 0 as BIT, expected: 1 as BIT, description: 'Given a BIT value of 0, When notBit is called, Then it should return 1' },
        ];

        cases.forEach(({ input, expected, description }) => {
            it(description, () => {
                expect(notBit(input)).toBe(expected);
            });
        });
    });
});
import { describe, it, expect } from 'vitest';
import type { INT, IntBitPosition } from '@/sys/primitives/int';
import {
    getBitFromIntAt,
    setBitInIntAt,
    setBitOnInIntAt,
    setBitOffInIntAt,
    toggleBitInIntAt,
    isBitSetInIntAt
} from '@/sys/primitives/int';
import type { BIT } from '@/sys/primitives/bit';

describe('INT Bit Manipulation Methods', () => {
    describe('getBitFromIntAt', () => {
        const cases = [
            { value: 0b10101010101010101010101010101010 as INT, position: 1 as IntBitPosition, expected: 1, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 1, When getBitFromIntAt is called, Then it should return 1' },
            { value: 0b10101010101010101010101010101010 as INT, position: 2 as IntBitPosition, expected: 0, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 2, When getBitFromIntAt is called, Then it should return 0' },
            { value: 0 as INT, position: 0 as IntBitPosition, expected: 0, description: 'Given an INT value of 0 and a position of 0, When getBitFromIntAt is called, Then it should return 0' },
            { value: -1 as INT, position: 31 as IntBitPosition, expected: 1, description: 'Given an INT value of -1 and a position of 31, When getBitFromIntAt is called, Then it should return 1' },
            { value: 0b10101010101010101010101010101010 as INT, position: 32 as IntBitPosition, expected: 0, description: 'Given an INT value of 0b10101010101010101010101010101010 and an invalid position of 32, When getBitFromIntAt is called, Then it should return 0' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInIntAt', () => {
        const cases = [
            { value: 0b10101010101010101010101010101010 as INT, position: 2 as IntBitPosition, bit: 1 as BIT, expected: 0b10101010101010101010101010101110 as INT, description: 'Given an INT value of 0b10101010101010101010101010101010, a position of 2, and a bit value of 1, When setBitInIntAt is called, Then it should return 0b10101010101010101010101010101110' },
            { value: 0b10101010101010101010101010101010 as INT, position: 1 as IntBitPosition, bit: 0 as BIT, expected: 0b10101010101010101010101010101000 as INT, description: 'Given an INT value of 0b10101010101010101010101010101010, a position of 1, and a bit value of 0, When setBitInIntAt is called, Then it should return 0b10101010101010101010101010101000' },
            { value: 0 as INT, position: 0 as IntBitPosition, bit: 1 as BIT, expected: 1 as INT, description: 'Given an INT value of 0, a position of 0, and a bit value of 1, When setBitInIntAt is called, Then it should return 1' },
            { value: -1 as INT, position: 31 as IntBitPosition, bit: 0 as BIT, expected: 0x7FFFFFFF as INT, description: 'Given an INT value of -1, a position of 31, and a bit value of 0, When setBitInIntAt is called, Then it should return 0x7FFFFFFF' },
            { value: 0 as INT, position: -1 as IntBitPosition, bit: 1 as BIT, expected: 2147483648 as INT, description: 'Given an INT value of 0, an invalid position of -1, and a bit value of 1, When setBitInIntAt is called, Then it should return 2147483648' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInIntAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInIntAt', () => {
        const cases = [
            { value: 0b10101010101010101010101010101010 as INT, position: 2 as IntBitPosition, expected: 0b10101010101010101010101010101110 as INT, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 2, When setBitOnInIntAt is called, Then it should return 0b10101010101010101010101010101110' },
            { value: 0 as INT, position: 0 as IntBitPosition, expected: 1 as INT, description: 'Given an INT value of 0 and a position of 0, When setBitOnInIntAt is called, Then it should return 1' },
            { value: -1 as INT, position: 31 as IntBitPosition, expected: 4294967295 as INT, description: 'Given an INT value of -1 and a position of 31, When setBitOnInIntAt is called, Then it should return 4294967295' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInIntAt', () => {
        const cases = [
            { value: 0b10101010101010101010101010101010 as INT, position: 1 as IntBitPosition, expected: 0b10101010101010101010101010101000 as INT, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 1, When setBitOffInIntAt is called, Then it should return 0b10101010101010101010101010101000' },
            { value: -1 as INT, position: 31 as IntBitPosition, expected: 0x7FFFFFFF as INT, description: 'Given an INT value of -1 and a position of 31, When setBitOffInIntAt is called, Then it should return 0x7FFFFFFF' },
            { value: 0 as INT, position: 0 as IntBitPosition, expected: 0 as INT, description: 'Given an INT value of 0 and a position of 0, When setBitOffInIntAt is called, Then it should return 0' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInIntAt', () => {
        const cases = [
            { value: 0b10101010101010101010101010101010 as INT, position: 1 as IntBitPosition, expected: 0b10101010101010101010101010101000 as INT, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 1, When toggleBitInIntAt is called, Then it should return 0b10101010101010101010101010101000' },
            { value: 0b10101010101010101010101010101010 as INT, position: 2 as IntBitPosition, expected: 0b10101010101010101010101010101110 as INT, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 2, When toggleBitInIntAt is called, Then it should return 0b10101010101010101010101010101110' },
            { value: 0 as INT, position: 0 as IntBitPosition, expected: 1 as INT, description: 'Given an INT value of 0 and a position of 0, When toggleBitInIntAt is called, Then it should return 1' },
            { value: -1 as INT, position: 31 as IntBitPosition, expected: 0x7FFFFFFF as INT, description: 'Given an INT value of -1 and a position of 31, When toggleBitInIntAt is called, Then it should return 0x7FFFFFFF' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInIntAt', () => {
        const cases = [
            { value: 0b10101010101010101010101010101010 as INT, position: 1 as IntBitPosition, expected: true, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 1, When isBitSetInIntAt is called, Then it should return true' },
            { value: 0b10101010101010101010101010101010 as INT, position: 2 as IntBitPosition, expected: false, description: 'Given an INT value of 0b10101010101010101010101010101010 and a position of 2, When isBitSetInIntAt is called, Then it should return false' },
            { value: 0 as INT, position: 0 as IntBitPosition, expected: false, description: 'Given an INT value of 0 and a position of 0, When isBitSetInIntAt is called, Then it should return false' },
            { value: -1 as INT, position: 31 as IntBitPosition, expected: true, description: 'Given an INT value of -1 and a position of 31, When isBitSetInIntAt is called, Then it should return true' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInIntAt(value, position)).toBe(expected);
            });
        });
    });
});
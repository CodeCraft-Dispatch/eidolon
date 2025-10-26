import { describe, it, expect } from 'vitest';
import {
    getBitFromUShortAt,
    setBitInUShortAt,
    setBitOnInUShortAt,
    setBitOffInUShortAt,
    toggleBitInUShortAt,
    isBitSetInUShortAt
} from '@/sys/primitives/ushort';
import type { USHORT, UShortBitPosition } from '@/sys/primitives/ushort';
import type { BIT } from '@/sys/primitives/bit';

describe('USHORT Bit Manipulation Methods', () => {
    describe('getBitFromUShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as USHORT, position: 1 as UShortBitPosition, expected: 1, description: 'Given a USHORT value of 0b0000000000000010 and a position of 1, When getBitFromUShortAt is called, Then it should return 1' },
            { value: 0b1111111111111011 as USHORT, position: 2 as UShortBitPosition, expected: 0, description: 'Given a USHORT value of 0b1111111111111011 and a position of 2, When getBitFromUShortAt is called, Then it should return 0' },
            { value: 0b1111111111111110 as USHORT, position: 0 as UShortBitPosition, expected: 0, description: 'Given a USHORT value of 0b1111111111111110 and a position of 0, When getBitFromUShortAt is called, Then it should return 0' },
            { value: 0b1000000000000000 as USHORT, position: 15 as UShortBitPosition, expected: 1, description: 'Given a USHORT value of 0b1000000000000000 and a position of 15, When getBitFromUShortAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromUShortAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInUShortAt', () => {
        const cases = [
            { value: 0b1111111111111011 as USHORT, position: 2 as UShortBitPosition, bit: 1 as BIT, expected: 0b1111111111111111 as USHORT, description: 'Given a USHORT value of 0b1111111111111011, a position of 2, and a bit value of 1, When setBitInUShortAt is called, Then it should return 0b1111111111111111' },
            { value: 0b0000000000000010 as USHORT, position: 1 as UShortBitPosition, bit: 0 as BIT, expected: 0b0000000000000000 as USHORT, description: 'Given a USHORT value of 0b0000000000000010, a position of 1, and a bit value of 0, When setBitInUShortAt is called, Then it should return 0b0000000000000000' },
            { value: 0b0000000000000000 as USHORT, position: 0 as UShortBitPosition, bit: 1 as BIT, expected: 0b0000000000000001 as USHORT, description: 'Given a USHORT value of 0b0000000000000000, a position of 0, and a bit value of 1, When setBitInUShortAt is called, Then it should return 0b0000000000000001' },
            { value: 0b1111111111111111 as USHORT, position: 15 as UShortBitPosition, bit: 0 as BIT, expected: 0b0111111111111111 as USHORT, description: 'Given a USHORT value of 0b1111111111111111, a position of 15, and a bit value of 0, When setBitInUShortAt is called, Then it should return 0b0111111111111111' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInUShortAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInUShortAt', () => {
        const cases = [
            { value: 0b1111111111111011 as USHORT, position: 2 as UShortBitPosition, expected: 0b1111111111111111 as USHORT, description: 'Given a USHORT value of 0b1111111111111011 and a position of 2, When setBitOnInUShortAt is called, Then it should return 0b1111111111111111' },
            { value: 0b0000000000000000 as USHORT, position: 0 as UShortBitPosition, expected: 0b0000000000000001 as USHORT, description: 'Given a USHORT value of 0b0000000000000000 and a position of 0, When setBitOnInUShortAt is called, Then it should return 0b0000000000000001' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInUShortAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInUShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as USHORT, position: 1 as UShortBitPosition, expected: 0b0000000000000000 as USHORT, description: 'Given a USHORT value of 0b0000000000000010 and a position of 1, When setBitOffInUShortAt is called, Then it should return 0b0000000000000000' },
            { value: 0b1111111111111111 as USHORT, position: 15 as UShortBitPosition, expected: 0b0111111111111111 as USHORT, description: 'Given a USHORT value of 0b1111111111111111 and a position of 15, When setBitOffInUShortAt is called, Then it should return 0b0111111111111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInUShortAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInUShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as USHORT, position: 1 as UShortBitPosition, expected: 0b0000000000000000 as USHORT, description: 'Given a USHORT value of 0b0000000000000010 and a position of 1, When toggleBitInUShortAt is called, Then it should return 0b0000000000000000' },
            { value: 0b1111111111111011 as USHORT, position: 2 as UShortBitPosition, expected: 0b1111111111111111 as USHORT, description: 'Given a USHORT value of 0b1111111111111011 and a position of 2, When toggleBitInUShortAt is called, Then it should return 0b1111111111111111' },
            { value: 0b0000000000000000 as USHORT, position: 0 as UShortBitPosition, expected: 0b0000000000000001 as USHORT, description: 'Given a USHORT value of 0b0000000000000000 and a position of 0, When toggleBitInUShortAt is called, Then it should return 0b0000000000000001' },
            { value: 0b1111111111111111 as USHORT, position: 15 as UShortBitPosition, expected: 0b0111111111111111 as USHORT, description: 'Given a USHORT value of 0b1111111111111111 and a position of 15, When toggleBitInUShortAt is called, Then it should return 0b0111111111111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInUShortAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInUShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as USHORT, position: 1 as UShortBitPosition, expected: true, description: 'Given a USHORT value of 0b0000000000000010 and a position of 1, When isBitSetInUShortAt is called, Then it should return true' },
            { value: 0b1111111111111011 as USHORT, position: 2 as UShortBitPosition, expected: false, description: 'Given a USHORT value of 0b1111111111111011 and a position of 2, When isBitSetInUShortAt is called, Then it should return false' },
            { value: 0b1111111111111110 as USHORT, position: 0 as UShortBitPosition, expected: false, description: 'Given a USHORT value of 0b1111111111111110 and a position of 0, When isBitSetInUShortAt is called, Then it should return false' },
            { value: 0b1000000000000000 as USHORT, position: 15 as UShortBitPosition, expected: true, description: 'Given a USHORT value of 0b1000000000000000 and a position of 15, When isBitSetInUShortAt is called, Then it should return true' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInUShortAt(value, position)).toBe(expected);
            });
        });
    });
});
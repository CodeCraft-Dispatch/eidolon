import { describe, it, expect } from 'vitest';
import {
    getBitFromUIntAt,
    setBitInUIntAt,
    setBitOnInUIntAt,
    setBitOffInUIntAt,
    toggleBitInUIntAt,
    isBitSetInUIntAt
} from '@/sys/primitives/uint';
import type { UINT, UIntBitPosition } from '@/sys/primitives/uint';
import type { BIT } from '@/sys/primitives/bit';

describe('UINT Bit Manipulation Methods', () => {
    describe('getBitFromUIntAt', () => {
        const cases = [
            { value: 0b00000000000000000000000000000010 as UINT, position: 1 as UIntBitPosition, expected: 1, description: 'Given a UINT value of 0b00000000000000000000000000000010 and a position of 1, When getBitFromUIntAt is called, Then it should return 1' },
            { value: 0b11111111111111111111111111111011 as UINT, position: 2 as UIntBitPosition, expected: 0, description: 'Given a UINT value of 0b11111111111111111111111111111011 and a position of 2, When getBitFromUIntAt is called, Then it should return 0' },
            { value: 0b11111111111111111111111111111110 as UINT, position: 0 as UIntBitPosition, expected: 0, description: 'Given a UINT value of 0b11111111111111111111111111111110 and a position of 0, When getBitFromUIntAt is called, Then it should return 0' },
            { value: 0b10000000000000000000000000000000 as UINT, position: 31 as UIntBitPosition, expected: 1, description: 'Given a UINT value of 0b10000000000000000000000000000000 and a position of 31, When getBitFromUIntAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromUIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInUIntAt', () => {
        const cases = [
            { value: 0b11111111111111111111111111111011 as UINT, position: 2 as UIntBitPosition, bit: 1 as BIT, expected: 0b11111111111111111111111111111111 as UINT, description: 'Given a UINT value of 0b11111111111111111111111111111011, a position of 2, and a bit value of 1, When setBitInUIntAt is called, Then it should return 0b11111111111111111111111111111111' },
            { value: 0b00000000000000000000000000000010 as UINT, position: 1 as UIntBitPosition, bit: 0 as BIT, expected: 0b00000000000000000000000000000000 as UINT, description: 'Given a UINT value of 0b00000000000000000000000000000010, a position of 1, and a bit value of 0, When setBitInUIntAt is called, Then it should return 0b00000000000000000000000000000000' },
            { value: 0b00000000000000000000000000000000 as UINT, position: 0 as UIntBitPosition, bit: 1 as BIT, expected: 0b00000000000000000000000000000001 as UINT, description: 'Given a UINT value of 0b00000000000000000000000000000000, a position of 0, and a bit value of 1, When setBitInUIntAt is called, Then it should return 0b00000000000000000000000000000001' },
            { value: 0b11111111111111111111111111111111 as UINT, position: 31 as UIntBitPosition, bit: 0 as BIT, expected: 0b01111111111111111111111111111111 as UINT, description: 'Given a UINT value of 0b11111111111111111111111111111111, a position of 31, and a bit value of 0, When setBitInUIntAt is called, Then it should return 0b01111111111111111111111111111111' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInUIntAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInUIntAt', () => {
        const cases = [
            { value: 0b11111111111111111111111111111011 as UINT, position: 2 as UIntBitPosition, expected: 0b11111111111111111111111111111111 as UINT, description: 'Given a UINT value of 0b11111111111111111111111111111011 and a position of 2, When setBitOnInUIntAt is called, Then it should return 0b11111111111111111111111111111111' },
            { value: 0b00000000000000000000000000000000 as UINT, position: 0 as UIntBitPosition, expected: 0b00000000000000000000000000000001 as UINT, description: 'Given a UINT value of 0b00000000000000000000000000000000 and a position of 0, When setBitOnInUIntAt is called, Then it should return 0b00000000000000000000000000000001' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInUIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInUIntAt', () => {
        const cases = [
            { value: 0b00000000000000000000000000000010 as UINT, position: 1 as UIntBitPosition, expected: 0b00000000000000000000000000000000 as UINT, description: 'Given a UINT value of 0b00000000000000000000000000000010 and a position of 1, When setBitOffInUIntAt is called, Then it should return 0b00000000000000000000000000000000' },
            { value: 0b11111111111111111111111111111111 as UINT, position: 31 as UIntBitPosition, expected: 0b01111111111111111111111111111111 as UINT, description: 'Given a UINT value of 0b11111111111111111111111111111111 and a position of 31, When setBitOffInUIntAt is called, Then it should return 0b01111111111111111111111111111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInUIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInUIntAt', () => {
        const cases = [
            { value: 0b00000000000000000000000000000010 as UINT, position: 1 as UIntBitPosition, expected: 0b00000000000000000000000000000000 as UINT, description: 'Given a UINT value of 0b00000000000000000000000000000010 and a position of 1, When toggleBitInUIntAt is called, Then it should return 0b00000000000000000000000000000000' },
            { value: 0b11111111111111111111111111111011 as UINT, position: 2 as UIntBitPosition, expected: 0b11111111111111111111111111111111 as UINT, description: 'Given a UINT value of 0b11111111111111111111111111111011 and a position of 2, When toggleBitInUIntAt is called, Then it should return 0b11111111111111111111111111111111' },
            { value: 0b00000000000000000000000000000000 as UINT, position: 0 as UIntBitPosition, expected: 0b00000000000000000000000000000001 as UINT, description: 'Given a UINT value of 0b00000000000000000000000000000000 and a position of 0, When toggleBitInUIntAt is called, Then it should return 0b00000000000000000000000000000001' },
            { value: 0b11111111111111111111111111111111 as UINT, position: 31 as UIntBitPosition, expected: 0b01111111111111111111111111111111 as UINT, description: 'Given a UINT value of 0b11111111111111111111111111111111 and a position of 31, When toggleBitInUIntAt is called, Then it should return 0b01111111111111111111111111111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInUIntAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInUIntAt', () => {
        const cases = [
            { value: 0b00000000000000000000000000000010 as UINT, position: 1 as UIntBitPosition, expected: true, description: 'Given a UINT value of 0b00000000000000000000000000000010 and a position of 1, When isBitSetInUIntAt is called, Then it should return true' },
            { value: 0b11111111111111111111111111111011 as UINT, position: 2 as UIntBitPosition, expected: false, description: 'Given a UINT value of 0b11111111111111111111111111111011 and a position of 2, When isBitSetInUIntAt is called, Then it should return false' },
            { value: 0b11111111111111111111111111111110 as UINT, position: 0 as UIntBitPosition, expected: false, description: 'Given a UINT value of 0b11111111111111111111111111111110 and a position of 0, When isBitSetInUIntAt is called, Then it should return false' },
            { value: 0b10000000000000000000000000000000 as UINT, position: 31 as UIntBitPosition, expected: true, description: 'Given a UINT value of 0b10000000000000000000000000000000 and a position of 31, When isBitSetInUIntAt is called, Then it should return true' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInUIntAt(value, position)).toBe(expected);
            });
        });
    });
});
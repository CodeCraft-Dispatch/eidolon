import { describe, it, expect } from 'vitest';
import type { ULONG, ULongBitPosition } from '@/sys/primitives/ulong';
import {
    getBitFromULongAt,
    setBitInULongAt,
    setBitOnInULongAt,
    setBitOffInULongAt,
    toggleBitInULongAt,
    isBitSetInULongAt
} from '@/sys/primitives/ulong';
import type { BIT } from '@/sys/primitives/bit';

describe('ULONG Operations', () => {
    describe('getBitFromULongAt', () => {
        const cases = [
            { value: 0b1010n as ULONG, position: 1 as ULongBitPosition, expected: 1, description: 'Given a ULONG value of 0b1010n, When getting bit at position 1, Then it should return 1' },
            { value: 0b1010n as ULONG, position: 2 as ULongBitPosition, expected: 0, description: 'Given a ULONG value of 0b1010n, When getting bit at position 2, Then it should return 0' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromULongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInULongAt', () => {
        const cases = [
            { value: 0b1010n as ULONG, position: 0 as ULongBitPosition, bit: 1 as BIT, expected: 0b1011n as ULONG, description: 'Given a ULONG value of 0b1010n, When setting bit at position 0 to 1, Then it should return 0b1011n' },
            { value: 0b1010n as ULONG, position: 1 as ULongBitPosition, bit: 0 as BIT, expected: 0b1000n as ULONG, description: 'Given a ULONG value of 0b1010n, When setting bit at position 1 to 0, Then it should return 0b1000n' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInULongAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInULongAt', () => {
        const cases = [
            { value: 0b1010n as ULONG, position: 0 as ULongBitPosition, expected: 0b1011n as ULONG, description: 'Given a ULONG value of 0b1010n, When setting bit on at position 0, Then it should return 0b1011n' },
            { value: 0b1010n as ULONG, position: 2 as ULongBitPosition, expected: 0b1110n as ULONG, description: 'Given a ULONG value of 0b1010n, When setting bit on at position 3, Then it should return 0b1110n' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInULongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInULongAt', () => {
        const cases = [
            { value: 0b1010n as ULONG, position: 1 as ULongBitPosition, expected: 0b1000n as ULONG, description: 'Given a ULONG value of 0b1010n, When setting bit off at position 1, Then it should return 0b1000n' },
            { value: 0b1010n as ULONG, position: 3 as ULongBitPosition, expected: 0b0010n as ULONG, description: 'Given a ULONG value of 0b1010n, When setting bit off at position 3, Then it should return 0b0010n' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInULongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInULongAt', () => {
        const cases = [
            { value: 0b1010n as ULONG, position: 0 as ULongBitPosition, expected: 0b1011n as ULONG, description: 'Given a ULONG value of 0b1010n, When toggling bit at position 0, Then it should return 0b1011n' },
            { value: 0b1010n as ULONG, position: 1 as ULongBitPosition, expected: 0b1000n as ULONG, description: 'Given a ULONG value of 0b1010n, When toggling bit at position 1, Then it should return 0b1000n' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInULongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInULongAt', () => {
        const cases = [
            { value: 0b1010n as ULONG, position: 1 as ULongBitPosition, expected: true, description: 'Given a ULONG value of 0b1010n, When checking if bit at position 1 is set, Then it should return true' },
            { value: 0b1010n as ULONG, position: 2 as ULongBitPosition, expected: false, description: 'Given a ULONG value of 0b1010n, When checking if bit at position 2 is set, Then it should return false' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInULongAt(value, position)).toBe(expected);
            });
        });
    });
});
import { describe, it, expect } from 'vitest';
import type { LONG, LongBitPosition } from '@/sys/primitives/long';
import {
    getBitFromLongAt,
    setBitInLongAt,
    setBitOnInLongAt,
    setBitOffInLongAt,
    toggleBitInLongAt,
    isBitSetInLongAt
} from '@/sys/primitives/long';
import type { BIT } from '@/sys/primitives/bit';

describe('LONG Bit Manipulation Methods', () => {
    describe('getBitFromLongAt', () => {
        const cases = [
            { value: 0b1010101010101010101010101010101010101010101010101010101010101010n as LONG, position: 1 as LongBitPosition, expected: 1, description: 'Given a LONG value of 0b...1010 and a position of 1, When getBitFromLongAt is called, Then it should return 1' },
            { value: 0b1010101010101010101010101010101010101010101010101010101010101010n as LONG, position: 2 as LongBitPosition, expected: 0, description: 'Given a LONG value of 0b...1010 and a position of 2, When getBitFromLongAt is called, Then it should return 0' },
            { value: 0n as LONG, position: 0 as LongBitPosition, expected: 0, description: 'Given a LONG value of 0 and a position of 0, When getBitFromLongAt is called, Then it should return 0' },
            { value: -1n as LONG, position: 63 as LongBitPosition, expected: 1, description: 'Given a LONG value of -1 and a position of 63, When getBitFromLongAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromLongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInLongAt', () => {
        const cases = [
            { value: 0b1010n as LONG, position: 2 as LongBitPosition, bit: 1 as BIT, expected: 0b1110n as LONG, description: 'Given a LONG value of 0b1010, a position of 2, and a bit value of 1, When setBitInLongAt is called, Then it should return 0b1110' },
            { value: 0b1010n as LONG, position: 1 as LongBitPosition, bit: 0 as BIT, expected: 0b1000n as LONG, description: 'Given a LONG value of 0b1010, a position of 1, and a bit value of 0, When setBitInLongAt is called, Then it should return 0b1000' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInLongAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInLongAt', () => {
        const cases = [
            { value: 0b1010n as LONG, position: 2 as LongBitPosition, expected: 0b1110n as LONG, description: 'Given a LONG value of 0b1010 and a position of 2, When setBitOnInLongAt is called, Then it should return 0b1110' },
            { value: 0n as LONG, position: 0 as LongBitPosition, expected: 1n as LONG, description: 'Given a LONG value of 0 and a position of 0, When setBitOnInLongAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInLongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInLongAt', () => {
        const cases = [
            { value: 0b1010n as LONG, position: 1 as LongBitPosition, expected: 0b1000n as LONG, description: 'Given a LONG value of 0b1010 and a position of 1, When setBitOffInLongAt is called, Then it should return 0b1000' },
            { value: -1n as LONG, position: 63 as LongBitPosition, expected: 0x7FFFFFFFFFFFFFFFn as LONG, description: 'Given a LONG value of -1 and a position of 63, When setBitOffInLongAt is called, Then it should return 0x7FFFFFFFFFFFFFFF' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInLongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInLongAt', () => {
        const cases = [
            { value: 0b1010n as LONG, position: 1 as LongBitPosition, expected: 0b1000n as LONG, description: 'Given a LONG value of 0b1010 and a position of 1, When toggleBitInLongAt is called, Then it should return 0b1000' },
            { value: 0b1010n as LONG, position: 2 as LongBitPosition, expected: 0b1110n as LONG, description: 'Given a LONG value of 0b1010 and a position of 2, When toggleBitInLongAt is called, Then it should return 0b1110' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInLongAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInLongAt', () => {
        const cases = [
            { value: 0b1010n as LONG, position: 1 as LongBitPosition, expected: true, description: 'Given a LONG value of 0b1010 and a position of 1, When isBitSetInLongAt is called, Then it should return true' },
            { value: 0b1010n as LONG, position: 2 as LongBitPosition, expected: false, description: 'Given a LONG value of 0b1010 and a position of 2, When isBitSetInLongAt is called, Then it should return false' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInLongAt(value, position)).toBe(expected);
            });
        });
    });
});
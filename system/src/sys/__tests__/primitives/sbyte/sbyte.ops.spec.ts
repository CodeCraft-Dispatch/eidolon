import { describe, it, expect } from 'vitest';
import type { SBYTE, SByteBitPosition } from '@/sys/primitives/sbyte';
import {
    getBitFromSByteAt,
    setBitInSByteAt,
    setBitOnInSByteAt,
    setBitOffInSByteAt,
    toggleBitInSByteAt,
    isBitSetInSByteAt
} from '@/sys/primitives/sbyte';
import type { BIT } from '@/sys/primitives/bit';

describe('SBYTE Bit Manipulation Methods', () => {
    describe('getBitFromSByteAt', () => {
        const cases = [
            { value: 0b01101010 as SBYTE, position: 1 as SByteBitPosition, expected: 1, description: 'Given an SBYTE value of 0b01101010 and a position of 1, When getBitFromSByteAt is called, Then it should return 1' },
            { value: 0b01101010 as SBYTE, position: 2 as SByteBitPosition, expected: 0, description: 'Given an SBYTE value of 0b01101010 and a position of 2, When getBitFromSByteAt is called, Then it should return 0' },
            { value: 0 as SBYTE, position: 0 as SByteBitPosition, expected: 0, description: 'Given an SBYTE value of 0 and a position of 0, When getBitFromSByteAt is called, Then it should return 0' },
            { value: -1 as SBYTE, position: 7 as SByteBitPosition, expected: 1, description: 'Given an SBYTE value of -1 and a position of 7, When getBitFromSByteAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromSByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInSByteAt', () => {
        const cases = [
            { value: 0b01101010 as SBYTE, position: 2 as SByteBitPosition, bit: 1 as BIT, expected: 0b01101110 as SBYTE, description: 'Given an SBYTE value of 0b01101010, a position of 2, and a bit value of 1, When setBitInSByteAt is called, Then it should return 0b01101110' },
            { value: 0b01101010 as SBYTE, position: 1 as SByteBitPosition, bit: 0 as BIT, expected: 0b01101000 as SBYTE, description: 'Given an SBYTE value of 0b01101010, a position of 1, and a bit value of 0, When setBitInSByteAt is called, Then it should return 0b01101000' },
            { value: 0 as SBYTE, position: 0 as SByteBitPosition, bit: 1 as BIT, expected: 0b00000001 as SBYTE, description: 'Given an SBYTE value of 0, a position of 0, and a bit value of 1, When setBitInSByteAt is called, Then it should return 0b00000001' },
            { value: -1 as SBYTE, position: 7 as SByteBitPosition, bit: 0 as BIT, expected: 0b01111111 as SBYTE, description: 'Given an SBYTE value of -1, a position of 7, and a bit value of 0, When setBitInSByteAt is called, Then it should return 0b01111111' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInSByteAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInSByteAt', () => {
        const cases = [
            { value: 0b01101010 as SBYTE, position: 2 as SByteBitPosition, expected: 0b01101110 as SBYTE, description: 'Given an SBYTE value of 0b01101010 and a position of 2, When setBitOnInSByteAt is called, Then it should return 0b01101110' },
            { value: 0 as SBYTE, position: 0 as SByteBitPosition, expected: 0b00000001 as SBYTE, description: 'Given an SBYTE value of 0 and a position of 0, When setBitOnInSByteAt is called, Then it should return 0b00000001' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInSByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInSByteAt', () => {
        const cases = [
            { value: 0b01101010 as SBYTE, position: 1 as SByteBitPosition, expected: 0b01101000 as SBYTE, description: 'Given an SBYTE value of 0b01101010 and a position of 1, When setBitOffInSByteAt is called, Then it should return 0b01101000' },
            { value: -1 as SBYTE, position: 7 as SByteBitPosition, expected: 0b01111111 as SBYTE, description: 'Given an SBYTE value of -1 and a position of 7, When setBitOffInSByteAt is called, Then it should return 0b01111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInSByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInSByteAt', () => {
        const cases = [
            { value: 0b01101010 as SBYTE, position: 1 as SByteBitPosition, expected: 0b01101000 as SBYTE, description: 'Given an SBYTE value of 0b01101010 and a position of 1, When toggleBitInSByteAt is called, Then it should return 0b01101000' },
            { value: 0b01101010 as SBYTE, position: 2 as SByteBitPosition, expected: 0b01101110 as SBYTE, description: 'Given an SBYTE value of 0b01101010 and a position of 2, When toggleBitInSByteAt is called, Then it should return 0b01101110' },
            { value: 0 as SBYTE, position: 0 as SByteBitPosition, expected: 0b00000001 as SBYTE, description: 'Given an SBYTE value of 0 and a position of 0, When toggleBitInSByteAt is called, Then it should return 0b00000001' },
            { value: -1 as SBYTE, position: 7 as SByteBitPosition, expected: 0b01111111 as SBYTE, description: 'Given an SBYTE value of -1 and a position of 7, When toggleBitInSByteAt is called, Then it should return 0b01111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInSByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInSByteAt', () => {
        const cases = [
            { value: 0b01101010 as SBYTE, position: 1 as SByteBitPosition, expected: true, description: 'Given an SBYTE value of 0b01101010 and a position of 1, When isBitSetInSByteAt is called, Then it should return true' },
            { value: 0b01101010 as SBYTE, position: 2 as SByteBitPosition, expected: false, description: 'Given an SBYTE value of 0b01101010 and a position of 2, When isBitSetInSByteAt is called, Then it should return false' },
            { value: 0 as SBYTE, position: 0 as SByteBitPosition, expected: false, description: 'Given an SBYTE value of 0 and a position of 0, When isBitSetInSByteAt is called, Then it should return false' },
            { value: -1 as SBYTE, position: 7 as SByteBitPosition, expected: true, description: 'Given an SBYTE value of -1 and a position of 7, When isBitSetInSByteAt is called, Then it should return true' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInSByteAt(value, position)).toBe(expected);
            });
        });
    });
});
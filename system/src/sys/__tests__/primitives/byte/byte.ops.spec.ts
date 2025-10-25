import { describe, it, expect } from 'vitest';
import {
    getBitFromByteAt,
    setBitInByteAt,
    setBitOnInByteAt,
    setBitOffInByteAt,
    toggleBitInByteAt,
    isBitSetInByteAt
} from '@/sys/primitives/byte';
import type { BYTE, ByteBitPosition } from '@/sys/primitives/byte';
import type { BIT } from '@/sys/primitives/bit';

describe('BYTE Bit Manipulation Methods', () => {
    describe('getBitFromByteAt', () => {
        const cases = [
            { value: 0b00000010 as BYTE, position: 1 as ByteBitPosition, expected: 1, description: 'Given a BYTE value of 0b00000010 and a position of 1, When getBitFromByteAt is called, Then it should return 1' },
            { value: 0b11111011 as BYTE, position: 2 as ByteBitPosition, expected: 0, description: 'Given a BYTE value of 0b11111011 and a position of 2, When getBitFromByteAt is called, Then it should return 0' },
            { value: 0b11111110 as BYTE, position: 0 as ByteBitPosition, expected: 0, description: 'Given a BYTE value of 0b11111110 and a position of 0, When getBitFromByteAt is called, Then it should return 0' },
            { value: 0b10000000 as BYTE, position: 7 as ByteBitPosition, expected: 1, description: 'Given a BYTE value of 0b10000000 and a position of 7, When getBitFromByteAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInByteAt', () => {
        const cases = [
            { value: 0b11111011 as BYTE, position: 2 as ByteBitPosition, bit: 1 as BIT, expected: 0b11111111 as BYTE, description: 'Given a BYTE value of 0b11111011, a position of 2, and a bit value of 1, When setBitInByteAt is called, Then it should return 0b11111111' },
            { value: 0b00000010 as BYTE, position: 1 as ByteBitPosition, bit: 0 as BIT, expected: 0b00000000 as BYTE, description: 'Given a BYTE value of 0b00000010, a position of 1, and a bit value of 0, When setBitInByteAt is called, Then it should return 0b00000000' },
            { value: 0b00000000 as BYTE, position: 0 as ByteBitPosition, bit: 1 as BIT, expected: 0b00000001 as BYTE, description: 'Given a BYTE value of 0b00000000, a position of 0, and a bit value of 1, When setBitInByteAt is called, Then it should return 0b00000001' },
            { value: 0b11111111 as BYTE, position: 7 as ByteBitPosition, bit: 0 as BIT, expected: 0b01111111 as BYTE, description: 'Given a BYTE value of 0b11111111, a position of 7, and a bit value of 0, When setBitInByteAt is called, Then it should return 0b01111111' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInByteAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInByteAt', () => {
        const cases = [
            { value: 0b11111011 as BYTE, position: 2 as ByteBitPosition, expected: 0b11111111 as BYTE, description: 'Given a BYTE value of 0b11111011 and a position of 2, When setBitOnInByteAt is called, Then it should return 0b11111111' },
            { value: 0b00000000 as BYTE, position: 0 as ByteBitPosition, expected: 0b00000001 as BYTE, description: 'Given a BYTE value of 0b00000000 and a position of 0, When setBitOnInByteAt is called, Then it should return 0b00000001' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitOffInByteAt', () => {
        const cases = [
            { value: 0b00000010 as BYTE, position: 1 as ByteBitPosition, expected: 0b00000000 as BYTE, description: 'Given a BYTE value of 0b00000010 and a position of 1, When setBitOffInByteAt is called, Then it should return 0b00000000' },
            { value: 0b11111111 as BYTE, position: 7 as ByteBitPosition, expected: 0b01111111 as BYTE, description: 'Given a BYTE value of 0b11111111 and a position of 7, When setBitOffInByteAt is called, Then it should return 0b01111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInByteAt', () => {
        const cases = [
            { value: 0b00000010 as BYTE, position: 1 as ByteBitPosition, expected: 0b00000000 as BYTE, description: 'Given a BYTE value of 0b00000010 and a position of 1, When toggleBitInByteAt is called, Then it should return 0b00000000' },
            { value: 0b11111011 as BYTE, position: 2 as ByteBitPosition, expected: 0b11111111 as BYTE, description: 'Given a BYTE value of 0b11111011 and a position of 2, When toggleBitInByteAt is called, Then it should return 0b11111111' },
            { value: 0b00000000 as BYTE, position: 0 as ByteBitPosition, expected: 0b00000001 as BYTE, description: 'Given a BYTE value of 0b00000000 and a position of 0, When toggleBitInByteAt is called, Then it should return 0b00000001' },
            { value: 0b11111111 as BYTE, position: 7 as ByteBitPosition, expected: 0b01111111 as BYTE, description: 'Given a BYTE value of 0b11111111 and a position of 7, When toggleBitInByteAt is called, Then it should return 0b01111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInByteAt(value, position)).toBe(expected);
            });
        });
    });

    describe('isBitSetInByteAt', () => {
        const cases = [
            { value: 0b00000010 as BYTE, position: 1 as ByteBitPosition, expected: true, description: 'Given a BYTE value of 0b00000010 and a position of 1, When isBitSetInByteAt is called, Then it should return true' },
            { value: 0b11111011 as BYTE, position: 2 as ByteBitPosition, expected: false, description: 'Given a BYTE value of 0b11111011 and a position of 2, When isBitSetInByteAt is called, Then it should return false' },
            { value: 0b11111110 as BYTE, position: 0 as ByteBitPosition, expected: false, description: 'Given a BYTE value of 0b11111110 and a position of 0, When isBitSetInByteAt is called, Then it should return false' },
            { value: 0b10000000 as BYTE, position: 7 as ByteBitPosition, expected: true, description: 'Given a BYTE value of 0b10000000 and a position of 7, When isBitSetInByteAt is called, Then it should return true' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInByteAt(value, position)).toBe(expected);
            });
        });
    });
});
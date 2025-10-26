import { describe, it, expect } from 'vitest';
import {
    getBitFromShortAt,
    setBitInShortAt,
    setBitOnInShortAt,
    setBitOffInShortAt,
    toggleBitInShortAt,
    isBitSetInShortAt
} from '@/sys/primitives/short';
import type { SHORT, ShortBitPosition } from '@/sys/primitives/short';
import type { BIT } from '@/sys/primitives/bit';

describe('SHORT Bit Manipulation Methods', () => {
    describe('getBitFromShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as SHORT, position: 1 as ShortBitPosition, expected: 1, description: 'Given a SHORT value of 0b0000000000000010 and a position of 1, When getBitFromShortAt is called, Then it should return 1' },
            { value: 0b1111111111111011 as SHORT, position: 2 as ShortBitPosition, expected: 0, description: 'Given a SHORT value of 0b1111111111111011 and a position of 2, When getBitFromShortAt is called, Then it should return 0' },
            { value: 0b1111111111111110 as SHORT, position: 0 as ShortBitPosition, expected: 0, description: 'Given a SHORT value of 0b1111111111111110 and a position of 0, When getBitFromShortAt is called, Then it should return 0' },
            { value: 0b1000000000000000 as SHORT, position: 15 as ShortBitPosition, expected: 1, description: 'Given a SHORT value of 0b1000000000000000 and a position of 15, When getBitFromShortAt is called, Then it should return 1' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(getBitFromShortAt(value, position)).toBe(expected);
            });
        });
    });

    describe('setBitInShortAt', () => {
        const cases = [
            { value: 0b1111111111111011 as SHORT, position: 2 as ShortBitPosition, bit: 1 as BIT, expected: -1 as SHORT, description: 'Given a SHORT value of 0b1111111111111011, a position of 2, and a bit value of 1, When setBitInShortAt is called, Then it should return 0b1111111111111111' },
            { value: 0b0000000000000010 as SHORT, position: 1 as ShortBitPosition, bit: 0 as BIT, expected: 0b0000000000000000 as SHORT, description: 'Given a SHORT value of 0b0000000000000010, a position of 1, and a bit value of 0, When setBitInShortAt is called, Then it should return 0b0000000000000000' },
            { value: 0b0000000000000000 as SHORT, position: 0 as ShortBitPosition, bit: 1 as BIT, expected: 0b0000000000000001 as SHORT, description: 'Given a SHORT value of 0b0000000000000000, a position of 0, and a bit value of 1, When setBitInShortAt is called, Then it should return 0b0000000000000001' },
            { value: 0b1111111111111111 as SHORT, position: 15 as ShortBitPosition, bit: 0 as BIT, expected: 0b0111111111111111 as SHORT, description: 'Given a SHORT value of 0b1111111111111111, a position of 15, and a bit value of 0, When setBitInShortAt is called, Then it should return 0b0111111111111111' },
        ];

        cases.forEach(({ value, position, bit, expected, description }) => {
            it(description, () => {
                expect(setBitInShortAt(value, position, bit)).toBe(expected);
            });
        });
    });

    describe('setBitOnInShortAt', () => {
        const cases = [
            { value: 0b1111111111111011 as SHORT, position: 2 as ShortBitPosition, expected: -1 as SHORT, description: 'Given a SHORT value of 0b1111111111111011 and a position of 2, When setBitOnInShortAt is called, Then it should return 0b1111111111111111' },
            { value: 0b0000000000000000 as SHORT, position: 0 as ShortBitPosition, expected: 0b0000000000000001 as SHORT, description: 'Given a SHORT value of 0b0000000000000000 and a position of 0, When setBitOnInShortAt is called, Then it should return 0b0000000000000001' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOnInShortAt(value, position)).toBe(expected | 0);
            });
        });
    });

    describe('setBitOffInShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as SHORT, position: 1 as ShortBitPosition, expected: 0b0000000000000000 as SHORT, description: 'Given a SHORT value of 0b0000000000000010 and a position of 1, When setBitOffInShortAt is called, Then it should return 0b0000000000000000' },
            { value: 0b1111111111111111 as SHORT, position: 15 as ShortBitPosition, expected: 0b0111111111111111 as SHORT, description: 'Given a SHORT value of 0b1111111111111111 and a position of 15, When setBitOffInShortAt is called, Then it should return 0b0111111111111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(setBitOffInShortAt(value, position)).toBe(expected);
            });
        });
    });

    describe('toggleBitInShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as SHORT, position: 1 as ShortBitPosition, expected: 0b0000000000000000 as SHORT, description: 'Given a SHORT value of 0b0000000000000010 and a position of 1, When toggleBitInShortAt is called, Then it should return 0b0000000000000000' },
            { value: 0b1111111111111011 as SHORT, position: 2 as ShortBitPosition, expected: -1 as SHORT, description: 'Given a SHORT value of 0b1111111111111011 and a position of 2, When toggleBitInShortAt is called, Then it should return 0b1111111111111111' },
            { value: 0b0000000000000000 as SHORT, position: 0 as ShortBitPosition, expected: 0b0000000000000001 as SHORT, description: 'Given a SHORT value of 0b0000000000000000 and a position of 0, When toggleBitInShortAt is called, Then it should return 0b0000000000000001' },
            { value: 0b1111111111111111 as SHORT, position: 15 as ShortBitPosition, expected: 0b0111111111111111 as SHORT, description: 'Given a SHORT value of 0b1111111111111111 and a position of 15, When toggleBitInShortAt is called, Then it should return 0b0111111111111111' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(toggleBitInShortAt(value, position)).toBe(expected | 0);
            });
        });
    });

    describe('isBitSetInShortAt', () => {
        const cases = [
            { value: 0b0000000000000010 as SHORT, position: 1 as ShortBitPosition, expected: true, description: 'Given a SHORT value of 0b0000000000000010 and a position of 1, When isBitSetInShortAt is called, Then it should return true' },
            { value: 0b1111111111111011 as SHORT, position: 2 as ShortBitPosition, expected: false, description: 'Given a SHORT value of 0b1111111111111011 and a position of 2, When isBitSetInShortAt is called, Then it should return false' },
            { value: 0b1111111111111110 as SHORT, position: 0 as ShortBitPosition, expected: false, description: 'Given a SHORT value of 0b1111111111111110 and a position of 0, When isBitSetInShortAt is called, Then it should return false' },
            { value: 0b1000000000000000 as SHORT, position: 15 as ShortBitPosition, expected: true, description: 'Given a SHORT value of 0b1000000000000000 and a position of 15, When isBitSetInShortAt is called, Then it should return true' },
        ];

        cases.forEach(({ value, position, expected, description }) => {
            it(description, () => {
                expect(isBitSetInShortAt(value, position)).toBe(expected);
            });
        });
    });
});
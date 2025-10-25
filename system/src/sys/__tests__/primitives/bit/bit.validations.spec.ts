import { describe, it, expect } from 'vitest';
import { isBitOn, isBitOff, isBit } from '@/sys/primitives/bit';

describe('BIT Validations', () => {
    describe('isBitOn', () => {
        it.each([
            [1, true],
            [0, false],
            [null, false],
            [undefined, false],
            ['1', false],
            [2, false],
            [-1, false]
        ])('Given a value of %s, When isBitOn is called, Then it should return %s', (value, expected) => {
            expect(isBitOn(value)).toBe(expected);
        });
    });

    describe('isBitOff', () => {
        it.each([
            [0, true],
            [1, false],
            [null, false],
            [undefined, false],
            ['0', false],
            [2, false],
            [-1, false]
        ])('Given a value of %s, When isBitOff is called, Then it should return %s', (value, expected) => {
            expect(isBitOff(value)).toBe(expected);
        });
    });

    describe('isBit', () => {
        it.each([
            [0, true],
            [1, true],
            [2, false],
            [null, false],
            [undefined, false],
            ['1', false],
            ['0', false],
            [-1, false]
        ])('Given a value of %s, When isBit is called, Then it should return %s', (value, expected) => {
            expect(isBit(value)).toBe(expected);
        });
    });
});
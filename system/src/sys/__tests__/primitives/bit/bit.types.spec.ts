import { describe, expect, it } from 'vitest';
import {
    type BIT,
    type BIT_ON,
    type BIT_OFF
} from '@/sys/primitives/bit';
import {
    OFF,
    ON
} from '@/sys/primitives/bit';

describe('BIT Types', () => {
    describe('BIT_ON type', () => {
        it('Given a value of 1, When it is checked as BIT_ON, Then it should be valid', () => {
            const value: BIT_ON = 1;
            expect(value).toBe(1);
        });

        it('Given a value of 0, When it is checked as BIT_ON, Then it should be invalid', () => {
            // @ts-expect-error - This should fail TypeScript type checking
            const value: BIT_ON = 0;
            expect(value).toBe(0);
        });
    });

    describe('BIT_OFF type', () => {
        it('Given a value of 0, When it is checked as BIT_OFF, Then it should be valid', () => {
            const value: BIT_OFF = 0;
            expect(value).toBe(0);
        });

        it('Given a value of 1, When it is checked as BIT_OFF, Then it should be invalid', () => {
            // @ts-expect-error - This should fail TypeScript type checking
            const value: BIT_OFF = 1;
        });
    });

    describe('BIT type', () => {
        it('Given a value of 0, When it is checked as BIT, Then it should be valid', () => {
            const value: BIT = OFF;
            expect(value).toBe(0);
        });

        it('Given a value of 1, When it is checked as BIT, Then it should be valid', () => {
            const value: BIT = ON;
            expect(value).toBe(1);
        });

        it('Given a value of 2, When it is checked as BIT, Then it should be invalid', () => {
            // @ts-expect-error - This should fail TypeScript type checking
            const value: BIT = 2;
            expect(value).toBe(2);
        });
    });
});
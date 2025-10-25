import { describe, it, expect } from 'vitest';
import type { Result } from '../../../result/core';
import { parseBitOn, parseBitOff, parseBit, OFF, ON } from '../../../primitives/bit';

describe('Parsing Functions', () => {
    const assertResult = <T>(
        result: Result<T>,
        expectedSuccess: boolean,
        expectedValue?: T,
        expectedFailure: string | null = null
    ) => {
        expect(result.success).toBe(expectedSuccess);
        if (result.success) {
            expect(result.value).toBe(expectedValue);
        } else {
            expect(result.error).toBe(expectedFailure);
        }
    };

    describe('parseBitOn', () => {
        it.each([
            [1, true, 1, null],
            [0, false, undefined, 'Expected 1, received: 0'],
            [2, false, undefined, 'Expected 1, received: 2'],
            [-1, false, undefined, 'Expected 1, received: -1']
        ])('Given a value of %i, When parseBitOn is called, Then it should return %s result', (input, expectedSuccess, expectedValue, expectedError) => {
            const result = parseBitOn(input);
            assertResult(result, expectedSuccess, expectedValue, expectedError);
        });
    });

    describe('parseBitOff', () => {
        it.each([
            [0, true, 0, null],
            [1, false, undefined, 'Expected 0, received: 1'],
            [2, false, undefined, 'Expected 0, received: 2'],
            [-1, false, undefined, 'Expected 0, received: -1']
        ])('Given a value of %i, When parseBitOff is called, Then it should return %s result', (input, expectedSuccess, expectedValue, expectedError) => {
            const result = parseBitOff(input);
            assertResult(result, expectedSuccess, expectedValue, expectedError);
        });
    });

    describe('parseBit', () => {
        it.each([
            [0, true, OFF, null],
            [1, true, ON, null],
            [2, false, undefined, 'Expected 0 or 1, received: 2'],
            [-1, false, undefined, 'Expected 0 or 1, received: -1']
        ])('Given a value of %i, When parseBit is called, Then it should return %s result', (input, expectedSuccess, expectedValue, expectedError) => {
            const result = parseBit(input);
            assertResult(result, expectedSuccess, expectedValue, expectedError);
        });
    });
});
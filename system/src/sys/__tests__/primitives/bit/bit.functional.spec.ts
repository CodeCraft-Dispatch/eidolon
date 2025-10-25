import { describe, it, expect } from 'vitest';
import { foldBit, createBit } from '../../../primitives/bit';
import { success, failure } from '../../../result/core';

describe('Functional Composition Helpers', () => {
    describe('foldBit', () => {
        it('Given a Result object with success: true, When foldBit is called, Then it should invoke the success handler with the value', () => {
            const result = success(1);
            const successHandler = (value: number) => `Success: ${value}`;
            const errorHandler = (error: string) => `Error: ${error}`;
            const output = foldBit(result, successHandler, errorHandler);
            expect(output).toBe('Success: 1');
        });

        it('Given a Result object with success: false, When foldBit is called, Then it should invoke the error handler with the error message', () => {
            const result = failure('Invalid input');
            const successHandler = (value: number) => `Success: ${value}`;
            const errorHandler = (error: string) => `Error: ${error}`;
            const output = foldBit(result, successHandler, errorHandler);
            expect(output).toBe('Error: Invalid input');
        });
    });

    describe('createBit', () => {
        it.each([
            { value: 0, expected: 0 },
            { value: 1, expected: 1 }
        ])('Given a value of $value, When createBit is called, Then it should return a success result with the value $expected', ({ value, expected }) => {
            const result = createBit(value);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toBe(expected);
            } else {
                expect.fail('Expected success result');
            }
        });

        it('Given a value of 2, When createBit is called, Then it should return an error result with the message "Expected 0 or 1, received: 2"', () => {
            const result = createBit(2);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe('Expected 0 or 1, received: 2');
            } else {
                expect.fail('Expected error result');
            }
        });
    });
});
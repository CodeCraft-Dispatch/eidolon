import { describe, it, expect } from 'vitest';
import type {
    Result,
    ResultSuccess,
    ResultError,
    AnyResult,
    ValidationResult,
    ParseResult
} from '../../result/core';
import {
    success,
    failure,
    isSuccess,
    isFailure,
    map,
    chain,
    apply
} from '../../result/core';

describe('Result Core Types', () => {
    describe('Smart Constructors', () => {
        it('should create successful results with success()', () => {
            const result = success(42);

            expect(result.success).toBe(true);
            expect((result as ResultSuccess<number>).value).toBe(42);
        });

        it('should create failed results with failure()', () => {
            const result = failure('Something went wrong');

            expect(result.success).toBe(false);
            expect((result as ResultError).error).toBe('Something went wrong');
        });

        it('should maintain type safety with branded types', () => {
            const result1 = success(42);
            const result2 = success('hello');

            // These should be different types even though both are Results
            expect(typeof result1).toBe('object');
            expect(typeof result2).toBe('object');
        });
    });

    describe('Type Guards', () => {
        it('should correctly identify successful results', () => {
            const successResult = success(42);
            const failureResult = failure('error');

            expect(isSuccess(successResult)).toBe(true);
            expect(isSuccess(failureResult)).toBe(false);
        });

        it('should correctly identify failed results', () => {
            const successResult = success(42);
            const failureResult = failure('error');

            expect(isFailure(successResult)).toBe(false);
            expect(isFailure(failureResult)).toBe(true);
        });

        it('should provide proper type narrowing', () => {
            const result: Result<number> = success(42);

            if (isSuccess(result)) {
                // TypeScript should know result.value is safe to access
                expect(result.value).toBe(42);
                expect(result.success).toBe(true);
            }

            // The isFailure branch is unreachable here since we know result is success
            // TypeScript correctly identifies this as never type
        });
    });

    describe('Convenience Types', () => {
        it('should work with AnyResult', () => {
            const result: AnyResult<string> = success('test');
            expect(isSuccess(result)).toBe(true);
        });

        it('should work with ValidationResult', () => {
            const result: ValidationResult<number> = failure('validation failed');
            expect(isFailure(result)).toBe(true);
        });

        it('should work with ParseResult', () => {
            const result: ParseResult<object> = success({ parsed: true });
            expect(isSuccess(result)).toBe(true);
        });
    });
});

describe('Core Monadic Operations', () => {
    describe('map', () => {
        it('should transform successful values', () => {
            const double = map((x: number) => x * 2);
            const result = double(success(5));

            expect(isSuccess(result)).toBe(true);
            expect((result as ResultSuccess<number>).value).toBe(10);
        });

        it('should pass through failures unchanged', () => {
            const double = map((x: number) => x * 2);
            const result = double(failure('error'));

            expect(isFailure(result)).toBe(true);
            expect((result as ResultError).error).toBe('error');
        });

        it('should maintain type safety in transformations', () => {
            const toString = map((x: number) => x.toString());
            const result = toString(success(42));

            expect(isSuccess(result)).toBe(true);
            expect((result as ResultSuccess<string>).value).toBe('42');
        });

        it('should compose multiple transformations', () => {
            const double = map((x: number) => x * 2);
            const toString = map((x: number) => x.toString());

            const result = toString(double(success(5)));

            expect(isSuccess(result)).toBe(true);
            expect((result as ResultSuccess<string>).value).toBe('10');
        });
    });

    describe('chain', () => {
        const parseNumber = (s: string): Result<number> => {
            const num = Number(s);
            return isNaN(num) ? failure('Not a number') : success(num);
        };

        it('should chain successful operations', () => {
            const result = chain(parseNumber)(success('42'));

            expect(isSuccess(result)).toBe(true);
            expect((result as ResultSuccess<number>).value).toBe(42);
        });

        it('should short-circuit on initial failure', () => {
            const result = chain(parseNumber)(failure('initial error'));

            expect(isFailure(result)).toBe(true);
            expect((result as ResultError).error).toBe('initial error');
        });

        it('should propagate operation failure', () => {
            const result = chain(parseNumber)(success('not-a-number'));

            expect(isFailure(result)).toBe(true);
            expect((result as ResultError).error).toBe('Not a number');
        });

        it('should compose multiple chain operations', () => {
            const parsePositive = (n: number): Result<number> =>
                n > 0 ? success(n) : failure('Must be positive');

            const result = chain(parsePositive)(chain(parseNumber)(success('42')));

            expect(isSuccess(result)).toBe(true);
            expect((result as ResultSuccess<number>).value).toBe(42);
        });
    });

    describe('apply', () => {
        it('should apply successful function to successful value', () => {
            const add = (x: number) => (y: number) => x + y;
            const wrappedAdd = success(add);
            const partialResult = apply(wrappedAdd)(success(5));

            expect(isSuccess(partialResult)).toBe(true);
        });

        it('should fail if function is failure', () => {
            const failedFunction: Result<(x: number) => number> = failure('no function');
            const result = apply(failedFunction)(success(5));

            expect(isFailure(result)).toBe(true);
            expect((result as ResultError).error).toBe('no function');
        });

        it('should fail if value is failure', () => {
            const add = (x: number) => x + 1;
            const wrappedAdd = success(add);
            const result = apply(wrappedAdd)(failure('no value'));

            expect(isFailure(result)).toBe(true);
            expect((result as ResultError).error).toBe('no value');
        });

        it('should enable applicative validation patterns', () => {
            const curry2 = <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B) => fn(a, b);
            const add = curry2((x: number, y: number) => x + y);

            const result = apply(apply(success(add))(success(5)))(success(3));

            expect(isSuccess(result)).toBe(true);
            expect((result as ResultSuccess<number>).value).toBe(8);
        });
    });

    describe('Monadic Laws', () => {
        const f = (x: number) => success(x * 2);
        const g = (x: number) => success(x + 1);

        it('should satisfy left identity law', () => {
            // chain(f)(success(a)) === f(a)
            const a = 5;
            const left = chain(f)(success(a));
            const right = f(a);

            expect(left).toEqual(right);
        });

        it('should satisfy right identity law', () => {
            // chain(success)(m) === m
            const m = success(42);
            const left = chain(success)(m);
            const right = m;

            expect(left).toEqual(right);
        });

        it('should satisfy associativity law', () => {
            // chain(g)(chain(f)(m)) === chain(x => chain(g)(f(x)))(m)
            const m = success(5);
            const left = chain(g)(chain(f)(m));
            const right = chain((x: number) => chain(g)(f(x)))(m);

            expect(left).toEqual(right);
        });
    });
});

describe('Error Handling', () => {
    it('should preserve error messages through transformations', () => {
        const originalError = 'original error';
        const result = failure(originalError);

        const transformed = map((x: number) => x * 2)(result);

        expect(isFailure(transformed)).toBe(true);
        expect((transformed as ResultError).error).toBe(originalError);
    });

    it('should short-circuit complex operations on failure', () => {
        const parseNumber = (s: string): Result<number> =>
            isNaN(Number(s)) ? failure('Not a number') : success(Number(s));

        const double = map((x: number) => x * 2);
        const addOne = chain((x: number) => success(x + 1));

        const result = addOne(double(chain(parseNumber)(failure('initial error'))));

        expect(isFailure(result)).toBe(true);
        expect((result as ResultError).error).toBe('initial error');
    });
});
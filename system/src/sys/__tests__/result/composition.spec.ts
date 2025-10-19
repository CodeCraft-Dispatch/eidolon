import { describe, it, expect } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure, isSuccess, isFailure } from '../../result/core';
import {
    compose,
    pipe,
    lift,
    combineWith,
    combineWith3
} from '../../result/composition';

describe('Function Composition', () => {
    describe('compose', () => {
        const parseNumber = (s: string): Result<number> => {
            const num = Number(s);
            return isNaN(num) ? failure('Not a number') : success(num);
        };

        const double = (n: number): Result<number> => success(n * 2);

        const validatePositive = (n: number): Result<number> =>
            n > 0 ? success(n) : failure('Must be positive');

        it('should compose two successful operations', () => {
            const parseAndDouble = compose(parseNumber, double);
            const result = parseAndDouble('5');

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(10);
            }
        });

        it('should short-circuit on first operation failure', () => {
            const parseAndDouble = compose(parseNumber, double);
            const result = parseAndDouble('not-a-number');

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('Not a number');
            }
        });

        it('should propagate second operation failure', () => {
            const parseAndValidate = compose(parseNumber, validatePositive);
            const result = parseAndValidate('-5');

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('Must be positive');
            }
        });

        it('should compose multiple operations', () => {
            const parseDoubleAndValidate = compose(
                compose(parseNumber, double),
                validatePositive
            );
            const result = parseDoubleAndValidate('5');

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(10);
            }
        });

        it('should maintain type safety through composition', () => {
            const toString = (n: number): Result<string> => success(n.toString());
            const parseAndStringify = compose(parseNumber, toString);
            const result = parseAndStringify('42');

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('42');
                expect(typeof result.value).toBe('string');
            }
        });
    });
});

describe('Pipeline Operations', () => {
    describe('pipe', () => {
        const parseNumber = (s: string): Result<number> => {
            const num = Number(s);
            return isNaN(num) ? failure('Not a number') : success(num);
        };

        const validateRange = (n: number): Result<number> =>
            n >= 0 && n <= 100 ? success(n) : failure('Must be between 0 and 100');

        const double = (n: number): Result<number> => success(n * 2);

        const toString = (n: number): Result<string> => success(n.toString());

        it('should handle single operation', () => {
            const result = pipe('42', parseNumber);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(42);
            }
        });

        it('should handle multiple operations successfully', () => {
            const result = pipe(
                '25',
                parseNumber,
                validateRange,
                double
            );

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(50);
            }
        });

        it('should short-circuit on first failure', () => {
            const result = pipe(
                'not-a-number',
                parseNumber,
                validateRange,
                double
            );

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('Not a number');
            }
        });

        it('should short-circuit on middle failure', () => {
            const result = pipe(
                '150',  // Too large
                parseNumber,
                validateRange,
                double
            );

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('Must be between 0 and 100');
            }
        });

        it('should handle maximum overload count (4 operations)', () => {
            const result = pipe(
                '25',
                parseNumber,
                validateRange,
                double,
                toString
            );

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('50');
                expect(typeof result.value).toBe('string');
            }
        });

        it('should handle empty pipe (identity)', () => {
            const result = pipe(42);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(42);
            }
        });

        it('should maintain type safety through pipeline', () => {
            const result = pipe('10', parseNumber, toString);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(typeof result.value).toBe('string');
                expect(result.value).toBe('10');
            }
        });
    });
});

describe('Function Lifting', () => {
    describe('lift', () => {
        it('should lift nullary functions', () => {
            const getCurrentTime = () => Date.now();
            const liftedGetTime = lift(getCurrentTime);
            const result = liftedGetTime();

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(typeof result.value).toBe('number');
                expect(result.value).toBeGreaterThan(0);
            }
        });

        it('should lift unary functions', () => {
            const double = (x: number) => x * 2;
            const liftedDouble = lift(double);
            const result = liftedDouble(5);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(10);
            }
        });

        it('should lift binary functions', () => {
            const add = (a: number, b: number) => a + b;
            const liftedAdd = lift(add);
            const result = liftedAdd(5, 3);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(8);
            }
        });

        it('should lift ternary functions', () => {
            const sum3 = (a: number, b: number, c: number) => a + b + c;
            const liftedSum3 = lift(sum3);
            const result = liftedSum3(1, 2, 3);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(6);
            }
        });

        it('should lift functions with complex return types', () => {
            const createUser = (name: string, age: number) => ({ name, age, id: Math.random() });
            const liftedCreateUser = lift(createUser);
            const result = liftedCreateUser('Alice', 30);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value.name).toBe('Alice');
                expect(result.value.age).toBe(30);
                expect(typeof result.value.id).toBe('number');
            }
        });

        it('should maintain type safety', () => {
            const toLowerCase = (s: string) => s.toLowerCase();
            const liftedToLowerCase = lift(toLowerCase);
            const result = liftedToLowerCase('HELLO');

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('hello');
                expect(typeof result.value).toBe('string');
            }
        });

        it('should work with functions that may throw (conceptually)', () => {
            const divide = (a: number, b: number) => a / b;
            const liftedDivide = lift(divide);
            const result = liftedDivide(10, 2);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(5);
            }
        });
    });
});

describe('Result Combination', () => {
    describe('combineWith', () => {
        const add = (a: number, b: number) => a + b;
        const concat = (a: string, b: string) => `${a} ${b}`;

        it('should combine two successful Results', () => {
            const addResults = combineWith(add);
            const result = addResults(success(5))(success(3));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(8);
            }
        });

        it('should fail if first Result is failure', () => {
            const addResults = combineWith(add);
            const result = addResults(failure('first error'))(success(3));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('first error');
            }
        });

        it('should fail if second Result is failure', () => {
            const addResults = combineWith(add);
            const result = addResults(success(5))(failure('second error'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('second error');
            }
        });

        it('should fail if both Results are failures (first error wins)', () => {
            const addResults = combineWith(add);
            const result = addResults(failure('first error'))(failure('second error'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('first error');
            }
        });

        it('should work with different types', () => {
            const concatResults = combineWith(concat);
            const result = concatResults(success('Hello'))(success('World'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('Hello World');
            }
        });

        it('should maintain type safety', () => {
            const multiply = (a: number, b: number) => a * b;
            const multiplyResults = combineWith(multiply);
            const result = multiplyResults(success(4))(success(6));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(24);
                expect(typeof result.value).toBe('number');
            }
        });
    });

    describe('combineWith3', () => {
        const sum3 = (a: number, b: number, c: number) => a + b + c;
        const createPoint = (x: number, y: number, z: number) => ({ x, y, z });

        it('should combine three successful Results', () => {
            const sum3Results = combineWith3(sum3);
            const result = sum3Results(success(1))(success(2))(success(3));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(6);
            }
        });

        it('should fail if first Result is failure', () => {
            const sum3Results = combineWith3(sum3);
            const result = sum3Results(failure('first error'))(success(2))(success(3));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('first error');
            }
        });

        it('should fail if second Result is failure', () => {
            const sum3Results = combineWith3(sum3);
            const result = sum3Results(success(1))(failure('second error'))(success(3));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('second error');
            }
        });

        it('should fail if third Result is failure', () => {
            const sum3Results = combineWith3(sum3);
            const result = sum3Results(success(1))(success(2))(failure('third error'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('third error');
            }
        });

        it('should work with complex return types', () => {
            const createPointResults = combineWith3(createPoint);
            const result = createPointResults(success(1))(success(2))(success(3));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toEqual({ x: 1, y: 2, z: 3 });
            }
        });

        it('should maintain type safety', () => {
            const concat3 = (a: string, b: string, c: string) => `${a}-${b}-${c}`;
            const concat3Results = combineWith3(concat3);
            const result = concat3Results(success('A'))(success('B'))(success('C'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('A-B-C');
                expect(typeof result.value).toBe('string');
            }
        });
    });
});

describe('Integration and Performance', () => {
    it('should handle complex composition scenarios', () => {
        const parseNumber = (s: string): Result<number> => {
            const num = Number(s);
            return isNaN(num) ? failure('Not a number') : success(num);
        };

        const validatePositive = (n: number): Result<number> =>
            n > 0 ? success(n) : failure('Must be positive');

        const square = (n: number) => n * n;
        const liftedSquare = lift(square);

        // Complex pipeline with lifting and composition
        const result = pipe(
            '5',
            parseNumber,
            validatePositive,
            (n) => liftedSquare(n)
        );

        expect(isSuccess(result)).toBe(true);
        if (isSuccess(result)) {
            expect(result.value).toBe(25);
        }
    });

    it('should handle nested combinations', () => {
        const add = (a: number, b: number) => a + b;
        const multiply = (a: number, b: number) => a * b;

        const addResults = combineWith(add);
        const multiplyResults = combineWith(multiply);

        // (5 + 3) * (4 + 2) = 8 * 6 = 48
        const result = multiplyResults(
            addResults(success(5))(success(3))
        )(
            addResults(success(4))(success(2))
        );

        expect(isSuccess(result)).toBe(true);
        if (isSuccess(result)) {
            expect(result.value).toBe(48);
        }
    });

    it('should maintain performance with deep compositions', () => {
        const increment = (n: number): Result<number> => success(n + 1);

        let composed = increment;
        // Compose 100 increment operations
        for (let i = 0; i < 99; i++) {
            composed = compose(composed, increment);
        }

        const startTime = performance.now();
        const result = composed(0);
        const endTime = performance.now();

        expect(isSuccess(result)).toBe(true);
        if (isSuccess(result)) {
            expect(result.value).toBe(100);
        }

        // Should complete reasonably quickly (under 100ms)
        expect(endTime - startTime).toBeLessThan(100);
    });
});
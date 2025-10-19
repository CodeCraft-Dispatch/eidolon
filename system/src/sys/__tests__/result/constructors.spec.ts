import { describe, expect, it } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure } from '../../result/core';
import { fromNullable, fromPredicate, tryCatch } from '../../result/constructors';

describe('Constructors Domain', () => {
    describe('fromNullable', () => {
        it('should convert non-null values to success', () => {
            const result = fromNullable("hello", "Value is missing");

            expect(result).toEqual(success("hello"));
        });

        it('should convert null to failure', () => {
            const result = fromNullable(null, "Value is missing");

            expect(result).toEqual(failure("Value is missing"));
        });

        it('should convert undefined to failure', () => {
            const result = fromNullable(undefined, "Value is missing");

            expect(result).toEqual(failure("Value is missing"));
        });

        it('should treat falsy non-null values as success', () => {
            // Test various falsy values that are not null/undefined
            expect(fromNullable(0, "Missing")).toEqual(success(0));
            expect(fromNullable("", "Missing")).toEqual(success(""));
            expect(fromNullable(false, "Missing")).toEqual(success(false));
            expect(fromNullable([], "Missing")).toEqual(success([]));
            expect(fromNullable({}, "Missing")).toEqual(success({}));
        });

        it('should preserve type information', () => {
            const stringResult = fromNullable("test", "No string");
            const numberResult = fromNullable(42, "No number");
            const objectResult = fromNullable({ id: 1 }, "No object");

            // Type verification through usage
            if (stringResult.success) {
                const _: string = stringResult.value;
            }
            if (numberResult.success) {
                const _: number = numberResult.value;
            }
            if (objectResult.success) {
                const _: { id: number } = objectResult.value;
            }

            expect(stringResult).toEqual(success("test"));
            expect(numberResult).toEqual(success(42));
            expect(objectResult).toEqual(success({ id: 1 }));
        });

        it('should use custom error messages', () => {
            const customError = "Custom error message";
            const result = fromNullable(null, customError);

            expect(result).toEqual(failure(customError));
        });

        it('should handle complex objects', () => {
            interface User {
                name: string;
                age: number;
            }

            const user: User | null = { name: "Alice", age: 30 };
            const noUser: User | null = null;

            expect(fromNullable(user, "No user")).toEqual(success({ name: "Alice", age: 30 }));
            expect(fromNullable(noUser, "No user")).toEqual(failure("No user"));
        });
    });

    describe('fromPredicate', () => {
        it('should create validator with static error message', () => {
            const validatePositive = fromPredicate(
                (n: number) => n > 0,
                "Number must be positive"
            );

            expect(validatePositive(5)).toEqual(success(5));
            expect(validatePositive(-1)).toEqual(failure("Number must be positive"));
            expect(validatePositive(0)).toEqual(failure("Number must be positive"));
        });

        it('should create validator with dynamic error message', () => {
            const validateLength = fromPredicate(
                (s: string) => s.length >= 3,
                (s: string) => `String "${s}" is too short (min 3 chars)`
            );

            expect(validateLength("hello")).toEqual(success("hello"));
            expect(validateLength("hi")).toEqual(failure('String "hi" is too short (min 3 chars)'));
            expect(validateLength("")).toEqual(failure('String "" is too short (min 3 chars)'));
        });

        it('should be curried for reusability', () => {
            const validateEmail = fromPredicate(
                (email: string) => email.includes("@"),
                "Invalid email format"
            );

            // Reuse the same validator
            expect(validateEmail("user@example.com")).toEqual(success("user@example.com"));
            expect(validateEmail("invalid-email")).toEqual(failure("Invalid email format"));
            expect(validateEmail("another@domain.org")).toEqual(success("another@domain.org"));
        });

        it('should work with complex predicates', () => {
            interface Person {
                name: string;
                age: number;
            }

            const validateAdult = fromPredicate(
                (person: Person) => person.age >= 18,
                (person: Person) => `${person.name} is ${person.age} years old (must be 18+)`
            );

            const adult = { name: "Alice", age: 25 };
            const minor = { name: "Bob", age: 16 };

            expect(validateAdult(adult)).toEqual(success(adult));
            expect(validateAdult(minor)).toEqual(failure("Bob is 16 years old (must be 18+)"));
        });

        it('should preserve type information through validation', () => {
            const validateRange = fromPredicate(
                (n: number) => n >= 1 && n <= 10,
                "Number must be between 1 and 10"
            );

            const result = validateRange(5);

            // Type verification
            if (result.success) {
                const _: number = result.value;
            }

            expect(result).toEqual(success(5));
        });

        it('should handle edge cases in predicates', () => {
            const validateNonEmpty = fromPredicate(
                (arr: any[]) => arr.length > 0,
                "Array cannot be empty"
            );

            expect(validateNonEmpty([1, 2, 3])).toEqual(success([1, 2, 3]));
            expect(validateNonEmpty([])).toEqual(failure("Array cannot be empty"));
        });

        it('should allow composition with other validators', () => {
            const validatePositive = fromPredicate(
                (n: number) => n > 0,
                "Must be positive"
            );
            const validateEven = fromPredicate(
                (n: number) => n % 2 === 0,
                "Must be even"
            );

            // Can be composed in sequence
            const number = 4;
            const positiveResult = validatePositive(number);
            const evenResult = positiveResult.success ? validateEven(positiveResult.value) : positiveResult;

            expect(evenResult).toEqual(success(4));

            // Test failure case
            const negativeNumber = -2;
            const negativeResult = validatePositive(negativeNumber);
            expect(negativeResult).toEqual(failure("Must be positive"));
        });
    });

    describe('tryCatch', () => {
        it('should convert successful operations to success Results', () => {
            const result = tryCatch(() => 42);

            expect(result).toEqual(success(42));
        });

        it('should convert thrown exceptions to failure Results', () => {
            const result = tryCatch(() => {
                throw new Error("Something went wrong");
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Something went wrong");
            }
        });

        it('should use custom error handler', () => {
            const result = tryCatch(
                () => { throw new Error("Original error"); },
                (error) => `Custom handler: ${error}`
            );

            expect(result).toEqual(failure("Custom handler: Error: Original error"));
        });

        it('should handle JSON parsing safely', () => {
            const validJson = tryCatch(() => JSON.parse('{"valid": true}'));
            const invalidJson = tryCatch(() => JSON.parse('invalid json'));

            expect(validJson).toEqual(success({ valid: true }));
            expect(invalidJson.success).toBe(false);
        });

        it('should handle division by zero and other math errors', () => {
            const safeDivision = (a: number, b: number) => tryCatch(() => {
                if (b === 0) throw new Error("Division by zero");
                return a / b;
            });

            expect(safeDivision(10, 2)).toEqual(success(5));
            expect(safeDivision(10, 0)).toEqual(failure("Error: Division by zero"));
        });

        it('should preserve return types', () => {
            const stringResult = tryCatch(() => "hello");
            const numberResult = tryCatch(() => 42);
            const objectResult = tryCatch(() => ({ id: 1 }));

            // Type verification
            if (stringResult.success) {
                const _: string = stringResult.value;
            }
            if (numberResult.success) {
                const _: number = numberResult.value;
            }
            if (objectResult.success) {
                const _: { id: number } = objectResult.value;
            }

            expect(stringResult).toEqual(success("hello"));
            expect(numberResult).toEqual(success(42));
            expect(objectResult).toEqual(success({ id: 1 }));
        });

        it('should handle async operations when wrapped', () => {
            // Note: tryCatch itself is synchronous, but can be used with Promise results
            const syncPromiseResult = tryCatch(() => Promise.resolve(42));

            expect(syncPromiseResult.success).toBe(true);
            if (syncPromiseResult.success) {
                expect(syncPromiseResult.value).toBeInstanceOf(Promise);
            }
        });

        it('should handle different error types', () => {
            const stringError = tryCatch(() => { throw "String error"; });
            const numberError = tryCatch(() => { throw 404; });
            const objectError = tryCatch(() => { throw { code: "ERR001" }; });

            expect(stringError.success).toBe(false);
            expect(numberError.success).toBe(false);
            expect(objectError.success).toBe(false);
        });

        it('should use default error handler when none provided', () => {
            const result = tryCatch(() => { throw new Error("Test error"); });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Error: Test error");
            }
        });

        it('should handle complex operations safely', () => {
            interface Config {
                apiUrl: string;
                timeout: number;
            }

            const parseConfig = (jsonString: string): Result<Config> => tryCatch(
                () => {
                    const parsed = JSON.parse(jsonString);
                    if (typeof parsed.apiUrl !== 'string') {
                        throw new Error("apiUrl must be a string");
                    }
                    if (typeof parsed.timeout !== 'number') {
                        throw new Error("timeout must be a number");
                    }
                    return parsed as Config;
                },
                (error) => `Configuration parsing failed: ${error}`
            );

            const validConfig = '{"apiUrl": "https://api.example.com", "timeout": 5000}';
            const invalidConfig = '{"apiUrl": 123, "timeout": "invalid"}';

            expect(parseConfig(validConfig)).toEqual(success({
                apiUrl: "https://api.example.com",
                timeout: 5000
            }));

            const invalidResult = parseConfig(invalidConfig);
            expect(invalidResult.success).toBe(false);
            if (!invalidResult.success) {
                expect(invalidResult.error).toContain("Configuration parsing failed");
            }
        });
    });

    describe('Constructors Integration', () => {
        it('should compose different constructors effectively', () => {
            // Combine fromNullable with fromPredicate
            const validatePositiveNumber = (value: number | null) => {
                const nullableResult = fromNullable(value, "Number is required");
                if (!nullableResult.success) return nullableResult;

                return fromPredicate(
                    (n: number) => n > 0,
                    "Number must be positive"
                )(nullableResult.value);
            };

            expect(validatePositiveNumber(5)).toEqual(success(5));
            expect(validatePositiveNumber(null)).toEqual(failure("Number is required"));
            expect(validatePositiveNumber(-1)).toEqual(failure("Number must be positive"));
        });

        it('should integrate with tryCatch for robust parsing', () => {
            const safeParseNumber = (input: string | null): Result<number> => {
                const nullableResult = fromNullable(input, "Input is required");
                if (!nullableResult.success) return nullableResult;

                return tryCatch(
                    () => {
                        const parsed = Number(nullableResult.value);
                        if (isNaN(parsed)) throw new Error("Invalid number format");
                        return parsed;
                    },
                    (error) => `Parsing failed: ${error}`
                );
            };

            expect(safeParseNumber("42")).toEqual(success(42));
            expect(safeParseNumber(null)).toEqual(failure("Input is required"));
            expect(safeParseNumber("abc")).toEqual(failure("Parsing failed: Error: Invalid number format"));
        });

        it('should create reusable constructor pipelines', () => {
            // Factory for creating validated constructors
            const createValidatedConstructor = <T>(
                validator: (value: T) => boolean,
                errorMessage: string
            ) => (value: T | null | undefined): Result<T> => {
                const nullableResult = fromNullable(value, `${errorMessage} (value is required)`);
                if (!nullableResult.success) return nullableResult;

                return fromPredicate(validator, errorMessage)(nullableResult.value);
            };

            const createValidEmail = createValidatedConstructor(
                (email: string) => email.includes("@") && email.length > 0,
                "Invalid email format"
            );

            expect(createValidEmail("user@example.com")).toEqual(success("user@example.com"));
            expect(createValidEmail(null)).toEqual(failure("Invalid email format (value is required)"));
            expect(createValidEmail("invalid")).toEqual(failure("Invalid email format"));
        });
    });
});
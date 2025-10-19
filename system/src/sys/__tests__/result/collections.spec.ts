import { describe, expect, it } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure } from '../../result/core';
import { sequence, unsafeSequence, sequenceRecord, traverse, partition } from '../../result/collections';

describe('Collections Domain', () => {
    describe('sequence', () => {
        it('should convert array of successes to success of array', () => {
            const results = [success(1), success(2), success(3)];
            const result = sequence(results);

            expect(result).toEqual(success([1, 2, 3]));
        });

        it('should return first failure for mixed results', () => {
            const results = [success(1), failure("error1"), success(3), failure("error2")];
            const result = sequence(results);

            expect(result).toEqual(failure("error1"));
        });

        it('should handle empty array', () => {
            const result = sequence([]);

            expect(result).toEqual(success([]));
        });

        it('should handle single success', () => {
            const result = sequence([success(42)]);

            expect(result).toEqual(success([42]));
        });

        it('should handle single failure', () => {
            const result = sequence([failure("error")]);

            expect(result).toEqual(failure("error"));
        });

        it('should preserve type information', () => {
            const stringResults = [success("a"), success("b")];
            const numberResults = [success(1), success(2)];

            const stringSequence = sequence(stringResults);
            const numberSequence = sequence(numberResults);

            // Type-level verification
            if (stringSequence.success) {
                const _: string[] = stringSequence.value;
            }
            if (numberSequence.success) {
                const _: number[] = numberSequence.value;
            }

            expect(stringSequence).toEqual(success(["a", "b"]));
            expect(numberSequence).toEqual(success([1, 2]));
        });

        it('should handle large arrays efficiently', () => {
            const largeArray = Array.from({ length: 1000 }, (_, i) => success(i));
            const result = sequence(largeArray);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toHaveLength(1000);
                expect(result.value[0]).toBe(0);
                expect(result.value[999]).toBe(999);
            }
        });
    });

    describe('unsafeSequence', () => {
        it('should sequence success results without error checking', () => {
            const results = [success(1), success(2), success(3)];
            const result = unsafeSequence(results);

            expect(result).toEqual(success([1, 2, 3]));
            expect(result.success).toBe(true);
        });

        it('should handle empty array', () => {
            const result = unsafeSequence([]);

            expect(result).toEqual(success([]));
        });

        it('should preserve value types', () => {
            const stringResults = [success("hello"), success("world")];
            const result = unsafeSequence(stringResults);

            expect(result).toEqual(success(["hello", "world"]));
        });

        it('should be highly performant for known successful results', () => {
            const largeArray = Array.from({ length: 10000 }, (_, i) => success(i));
            const start = performance.now();
            const result = unsafeSequence(largeArray);
            const end = performance.now();

            expect(result.success).toBe(true);
            expect(end - start).toBeLessThan(50); // Should be very fast
        });
    });

    describe('sequenceRecord', () => {
        it('should convert record of successes to success of record', () => {
            const resultRecord = {
                name: success("Alice"),
                age: success(30),
                active: success(true)
            };
            const result = sequenceRecord(resultRecord);

            expect(result).toEqual(success({
                name: "Alice",
                age: 30,
                active: true
            }));
        });

        it('should return failure for record with any failure', () => {
            const resultRecord = {
                name: success("Alice"),
                age: failure("Invalid age"),
                active: success(true)
            };
            const result = sequenceRecord(resultRecord);

            expect(result.success).toBe(false);
        });

        it('should handle empty record', () => {
            const result = sequenceRecord({});

            expect(result).toEqual(success({}));
        });

        it('should preserve key-value structure', () => {
            const resultRecord = {
                id: success(123),
                name: success("Test")
            };
            const result = sequenceRecord(resultRecord);

            expect(result).toEqual(success({ id: 123, name: "Test" }));
        });

        it('should handle records with various value types', () => {
            const resultRecord = {
                string: success("text"),
                number: success(42),
                boolean: success(false),
                array: success([1, 2, 3])
            };
            const result = sequenceRecord(resultRecord);

            expect(result).toEqual(success({
                string: "text",
                number: 42,
                boolean: false,
                array: [1, 2, 3]
            }));
        });
    });

    describe('traverse', () => {
        it('should map and sequence in one operation', () => {
            const parseNumber = (s: string) =>
                isNaN(Number(s)) ? failure("Not a number") : success(Number(s));
            
            const traverseParseNumbers = traverse(parseNumber);
            const result = traverseParseNumbers(["1", "2", "3"]);

            expect(result).toEqual(success([1, 2, 3]));
        });

        it('should fail fast on first invalid element', () => {
            const parseNumber = (s: string) =>
                isNaN(Number(s)) ? failure(`Not a number: ${s}`) : success(Number(s));
            
            const traverseParseNumbers = traverse(parseNumber);
            const result = traverseParseNumbers(["1", "abc", "3"]);

            expect(result).toEqual(failure("Not a number: abc"));
        });

        it('should handle empty arrays', () => {
            const parseNumber = (s: string) => success(Number(s));
            const traverseParseNumbers = traverse(parseNumber);
            const result = traverseParseNumbers([]);

            expect(result).toEqual(success([]));
        });

        it('should be curried for reusability', () => {
            const validatePositive = (n: number) =>
                n > 0 ? success(n) : failure("Must be positive");
            
            const traverseValidatePositive = traverse(validatePositive);
            
            expect(traverseValidatePositive([1, 2, 3])).toEqual(success([1, 2, 3]));
            expect(traverseValidatePositive([1, -2, 3])).toEqual(failure("Must be positive"));
        });

        it('should work with complex transformations', () => {
            interface User {
                name: string;
                age: number;
            }

            const createUser = (data: [string, number]): Result<User> => {
                const [name, age] = data;
                if (name.length === 0) return failure("Name cannot be empty");
                if (age < 0) return failure("Age cannot be negative");
                return success({ name, age });
            };

            const traverseCreateUsers = traverse(createUser);
            const result = traverseCreateUsers([["Alice", 30], ["Bob", 25]]);

            expect(result).toEqual(success([
                { name: "Alice", age: 30 },
                { name: "Bob", age: 25 }
            ]));
        });

        it('should maintain proper type inference', () => {
            const doubleIfEven = (n: number) =>
                n % 2 === 0 ? success(n * 2) : failure("Not even");
            
            const traverseDoubleEvens = traverse(doubleIfEven);
            const result = traverseDoubleEvens([2, 4, 6]);

            // Type verification
            if (result.success) {
                const _: number[] = result.value;
            }

            expect(result).toEqual(success([4, 8, 12]));
        });
    });

    describe('partition', () => {
        it('should separate successes and failures', () => {
            const results = [
                success(1),
                failure("error1"),
                success(2),
                failure("error2"),
                success(3)
            ];
            const partitioned = partition(results);

            expect(partitioned).toEqual({
                successes: [1, 2, 3],
                failures: ["error1", "error2"]
            });
        });

        it('should handle all successes', () => {
            const results = [success(1), success(2), success(3)];
            const partitioned = partition(results);

            expect(partitioned).toEqual({
                successes: [1, 2, 3],
                failures: []
            });
        });

        it('should handle all failures', () => {
            const results = [failure("error1"), failure("error2"), failure("error3")];
            const partitioned = partition(results);

            expect(partitioned).toEqual({
                successes: [],
                failures: ["error1", "error2", "error3"]
            });
        });

        it('should handle empty array', () => {
            const partitioned = partition([]);

            expect(partitioned).toEqual({
                successes: [],
                failures: []
            });
        });

        it('should preserve value types in successes', () => {
            const results = [
                success("hello"),
                failure("error"),
                success("world")
            ];
            const partitioned = partition(results);

            expect(partitioned.successes).toEqual(["hello", "world"]);
            expect(partitioned.failures).toEqual(["error"]);
        });

        it('should handle complex objects', () => {
            interface Person {
                name: string;
                age: number;
            }

            const results = [
                success({ name: "Alice", age: 30 }),
                failure("Invalid person"),
                success({ name: "Bob", age: 25 })
            ];
            const partitioned = partition(results);

            expect(partitioned.successes).toEqual([
                { name: "Alice", age: 30 },
                { name: "Bob", age: 25 }
            ]);
            expect(partitioned.failures).toEqual(["Invalid person"]);
        });

        it('should process large arrays efficiently', () => {
            const largeResults = Array.from({ length: 1000 }, (_, i) =>
                i % 2 === 0 ? success(i) : failure(`error${i}`)
            );
            
            const start = performance.now();
            const partitioned = partition(largeResults);
            const end = performance.now();

            expect(partitioned.successes).toHaveLength(500);
            expect(partitioned.failures).toHaveLength(500);
            expect(end - start).toBeLessThan(100); // Should be reasonably fast
        });
    });

    describe('Collections Integration', () => {
        it('should compose multiple collection operations', () => {
            const data = ["1", "2", "3", "invalid", "5"];
            
            const parseNumber = (s: string) =>
                isNaN(Number(s)) ? failure(`Invalid: ${s}`) : success(Number(s));
            
            // Use traverse to attempt parsing all numbers
            const parseResults = traverse(parseNumber)(data);
            
            // Since one will fail, let's partition instead
            const individualResults = data.map(parseNumber);
            const partitioned = partition(individualResults);

            expect(partitioned.successes).toEqual([1, 2, 3, 5]);
            expect(partitioned.failures).toEqual(["Invalid: invalid"]);
            expect(parseResults.success).toBe(false);
        });

        it('should work with nested operations', () => {
            const records = [
                { name: success("Alice"), age: success(30) },
                { name: success("Bob"), age: failure("Invalid age") },
                { name: success("Charlie"), age: success(25) }
            ];

            const processedRecords = records.map(sequenceRecord);
            const partitioned = partition(processedRecords);

            expect(partitioned.successes).toEqual([
                { name: "Alice", age: 30 },
                { name: "Charlie", age: 25 }
            ]);
            expect(partitioned.failures).toHaveLength(1);
        });
    });
});
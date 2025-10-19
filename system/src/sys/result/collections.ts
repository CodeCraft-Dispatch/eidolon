import type { Result, ResultSuccess } from './core';
import { success, map } from './core';

// ============================================================================
// COLLECTION OPERATIONS
// ============================================================================

/**
 * Converts an array of Results into a Result containing an array.
 * Implements fail-fast behavior - returns the first error encountered.
 * This is a fundamental operation in functional programming for handling multiple computations.
 * 
 * @param results - Array of Results to sequence
 * @returns Result containing array of all success values, or first failure
 * 
 * @example
 * ```typescript
 * sequence([success(1), success(2), success(3)]) // Result<number[]> containing [1, 2, 3]
 * sequence([success(1), failure("error"), success(3)]) // Result with error "error"
 * ```
 */
export const sequence = <ElementType>(
    results: Result<ElementType>[]
): Result<ElementType[]> => {
    const accumulated: ElementType[] = [];

    for (const result of results) {
        if (!result.success) {
            return result; // Early exit on first failure
        }
        accumulated.push(result.value);
    }

    return success(accumulated);
};

/**
 * High-performance version of sequence for arrays known to contain only successful Results.
 * Bypasses error checking for maximum performance in hot paths.
 * 
 * @param results - Array of ResultSuccess instances
 * @returns ResultSuccess containing array of all values
 * 
 * @example
 * ```typescript
 * const successResults = [success(1), success(2), success(3)];
 * unsafeSequence(successResults) // ResultSuccess<number[]> containing [1, 2, 3]
 * ```
 * 
 * @internal
 */
export const unsafeSequence = <ElementType>(
    results: ResultSuccess<ElementType>[]
): ResultSuccess<ElementType[]> =>
    success(results.map(r => r.value));

/**
 * Converts a record (object) of Results into a Result containing a record.
 * All Results in the record must be successful for the operation to succeed.
 * 
 * @param resultRecord - Record where values are Results
 * @returns Result containing record of all success values, or first failure
 * 
 * @example
 * ```typescript
 * sequenceRecord({
 *     name: success("Alice"),
 *     age: success(30)
 * }) // Result<{name: string, age: number}> containing {name: "Alice", age: 30}
 * 
 * sequenceRecord({
 *     name: success("Alice"),
 *     age: failure("Invalid age")
 * }) // Result with error "Invalid age"
 * ```
 */
export const sequenceRecord = <InputRecord extends Record<string, Result<any>>>(
    resultRecord: InputRecord
): Result<{ [KeyName in keyof InputRecord]: InputRecord[KeyName] extends Result<infer SuccessValue> ? SuccessValue : never }> => {
    const entries = Object.entries(resultRecord);
    const results: Result<[string, any]>[] = entries.map(([key, result]) =>
        map<any, [string, any]>(value => [key, value])(result)
    );

    return map<[string, any][], { [KeyName in keyof InputRecord]: InputRecord[KeyName] extends Result<infer SuccessValue> ? SuccessValue : never }>(
        pairs => Object.fromEntries(pairs) as { [KeyName in keyof InputRecord]: InputRecord[KeyName] extends Result<infer SuccessValue> ? SuccessValue : never }
    )(sequence(results));
};

/**
 * Maps a function over an array and sequences the results.
 * Equivalent to elements.map(operation) followed by sequence().
 * This is a fundamental traversal operation in functional programming.
 * 
 * @param operation - Function that transforms elements into Results
 * @returns A curried function that takes an array and returns a Result of array
 * 
 * @example
 * ```typescript
 * const parseNumbers = traverse((s: string) => 
 *     isNaN(Number(s)) ? failure("Not a number") : success(Number(s))
 * );
 * parseNumbers(["1", "2", "3"]) // Result<number[]> containing [1, 2, 3]
 * parseNumbers(["1", "abc", "3"]) // Result with error "Not a number"
 * ```
 */
export const traverse = <InputElement, OutputElement>(
    operation: (element: InputElement) => Result<OutputElement>
) => (elements: InputElement[]): Result<OutputElement[]> =>
        sequence(elements.map(operation));

/**
 * Separates an array of Results into successful values and error messages.
 * Unlike sequence, this processes all Results and doesn't fail fast.
 * Useful for collecting all errors and successes separately.
 * 
 * @param results - Array of Results to partition
 * @returns Object with separate arrays for successes and failures
 * 
 * @example
 * ```typescript
 * const results = [success(1), failure("error1"), success(3), failure("error2")];
 * partition(results)
 * // { successes: [1, 3], failures: ["error1", "error2"] }
 * ```
 */
export const partition = <SuccessValue>(
    results: Result<SuccessValue>[]
): { successes: SuccessValue[]; failures: string[] } => {
    const successes: SuccessValue[] = [];
    const failures: string[] = [];

    for (const result of results) {
        if (result.success) {
            successes.push(result.value);
        } else {
            failures.push(result.error);
        }
    }

    return { successes, failures };
};
import type { Result } from './core';
import { success, chain, map } from './core';
import { pipe, pipeResult } from './pipe';
export { pipe, pipeResult };

// ============================================================================
// FUNCTION COMPOSITION
// ============================================================================

/**
 * Composes two Result-returning functions left-to-right.
 * Equivalent to: input => chain(secondOperation)(firstOperation(input))
 * 
 * @param firstOperation - First function to apply to the input
 * @param secondOperation - Second function to apply to the result of the first
 * @returns A composed function that applies both operations in sequence
 * 
 * @example
 * ```typescript
 * const parseNumber = (s: string) => 
 *     isNaN(Number(s)) ? failure("Not a number") : success(Number(s));
 * const double = (n: number) => success(n * 2);
 * 
 * const parseAndDouble = compose(parseNumber, double);
 * parseAndDouble("5") // Result<number> containing 10
 * ```
 */
export const compose = <InputValue, IntermediateValue, OutputValue>(
    firstOperation: (input: InputValue) => Result<IntermediateValue>,
    secondOperation: (intermediate: IntermediateValue) => Result<OutputValue>
) => (input: InputValue): Result<OutputValue> =>
        chain(secondOperation)(firstOperation(input));



// ============================================================================
// FUNCTION LIFTING
// ============================================================================

/**
 * Lifts a regular function to work in the Result context.
 * All arguments become regular values, result is wrapped in Result.
 * 
 * @param fn - Regular function to lift into Result context
 * @returns A function that takes regular arguments and returns Result
 * 
 * @example
 * ```typescript
 * const add = (a: number, b: number) => a + b;
 * const safeAdd = lift(add);
 * safeAdd(5, 3) // Result<number> containing 8
 * ```
 */
export function lift<ReturnValue>(
    fn: () => ReturnValue
): () => Result<ReturnValue>;

export function lift<ArgumentValue, ReturnValue>(
    fn: (arg: ArgumentValue) => ReturnValue
): (arg: ArgumentValue) => Result<ReturnValue>;

export function lift<FirstArg, SecondArg, ReturnValue>(
    fn: (first: FirstArg, second: SecondArg) => ReturnValue
): (first: FirstArg, second: SecondArg) => Result<ReturnValue>;

export function lift<ArgumentList extends readonly unknown[], ReturnValue>(
    fn: (...args: ArgumentList) => ReturnValue
): (...args: ArgumentList) => Result<ReturnValue>;

export function lift<ArgumentList extends readonly unknown[], ReturnValue>(
    fn: (...args: ArgumentList) => ReturnValue
): (...args: ArgumentList) => Result<ReturnValue> {
    return (...args: ArgumentList): Result<ReturnValue> =>
        success(fn(...args));
}

// ============================================================================
// RESULT COMBINATION
// ============================================================================

/**
 * Combines two Results using a binary function.
 * Both Results must be successful for the operation to succeed.
 * 
 * @param binaryFunction - Function to combine two success values
 * @returns A curried function that combines two Results
 * 
 * @example
 * ```typescript
 * const add = (a: number, b: number) => a + b;
 * const addResults = combineWith(add);
 * addResults(success(5))(success(3)) // Result<number> containing 8
 * addResults(success(5))(failure("error")) // Result<number> with error
 * ```
 */
export const combineWith = <FirstArg, SecondArg, ReturnValue>(
    binaryFunction: (first: FirstArg, second: SecondArg) => ReturnValue
) => (firstResult: Result<FirstArg>) =>
        (secondResult: Result<SecondArg>): Result<ReturnValue> =>
            chain<FirstArg, ReturnValue>(first =>
                map<SecondArg, ReturnValue>(second => binaryFunction(first, second))(secondResult)
            )(firstResult);

/**
 * Combines three Results using a ternary function.
 * All three Results must be successful for the operation to succeed.
 * 
 * @param ternaryFunction - Function to combine three success values
 * @returns A curried function that combines three Results
 * 
 * @example
 * ```typescript
 * const sum3 = (a: number, b: number, c: number) => a + b + c;
 * const sum3Results = combineWith3(sum3);
 * sum3Results(success(1))(success(2))(success(3)) // Result<number> containing 6
 * ```
 */
export const combineWith3 = <FirstArg, SecondArg, ThirdArg, ReturnValue>(
    ternaryFunction: (first: FirstArg, second: SecondArg, third: ThirdArg) => ReturnValue
) => (firstResult: Result<FirstArg>) =>
        (secondResult: Result<SecondArg>) =>
            (thirdResult: Result<ThirdArg>): Result<ReturnValue> =>
                chain<FirstArg, ReturnValue>(first =>
                    chain<SecondArg, ReturnValue>(second =>
                        map<ThirdArg, ReturnValue>(third =>
                            ternaryFunction(first, second, third)
                        )(thirdResult)
                    )(secondResult)
                )(firstResult);
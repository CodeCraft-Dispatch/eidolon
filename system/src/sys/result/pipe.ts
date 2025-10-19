// ============================================================================
// PIPELINE OPERATIONS
// ============================================================================
import type { Result } from "./core"
import { success } from "./core";

// Helper type for pipe operations
type PipeOperation<In, Out> = (input: In) => Result<Out>;

/**
 * Pipes a value through a series of Result-returning operations.
 * Type-safe for up to 4 operations with full type inference.
 * 
 * @param value - Initial value to pipe through operations
 * @param operations - Sequence of Result-returning functions to apply
 * @returns Final Result after all operations
 * 
 * @example
 * ```typescript
 * const result = pipe(
 *     "42",
 *     parseNumber,
 *     validatePositive,
 *     double,
 *     toString
 * ); // Result<string>
 * ```
 */
export function pipe<InitialValue>(
    value: InitialValue
): Result<InitialValue>;

export function pipe<InitialValue, A>(
    value: InitialValue,
    op1: PipeOperation<InitialValue, A>
): Result<A>;

export function pipe<InitialValue, A, B>(
    value: InitialValue,
    op1: PipeOperation<InitialValue, A>,
    op2: PipeOperation<A, B>
): Result<B>;

export function pipe<InitialValue, A, B, C>(
    value: InitialValue,
    op1: PipeOperation<InitialValue, A>,
    op2: PipeOperation<A, B>,
    op3: PipeOperation<B, C>
): Result<C>;

export function pipe<InitialValue, A, B, C, D>(
    value: InitialValue,
    op1: PipeOperation<InitialValue, A>,
    op2: PipeOperation<A, B>,
    op3: PipeOperation<B, C>,
    op4: PipeOperation<C, D>
): Result<D>;

export function pipe<T>(
    value: T,
    ...operations: Array<PipeOperation<any, any>>
): Result<any>;

export function pipe<T>(
    value: T,
    ...operations: Array<PipeOperation<any, any>>
): Result<any> {
    return operations.reduce(
        (accumulator: Result<any>, operation) =>
            accumulator.success ? operation(accumulator.value) : accumulator,
        success(value)
    );
}

/**
 * Pipes a Result through a series of Result-to-Result operations.
 * Each operation receives a Result and returns a new Result, enabling
 * clean composition of Result-based transformations.
 * 
 * @param initial - Initial Result to pipe through operations
 * @param operations - Sequence of functions that transform Results
 * @returns Final Result after all operations
 * 
 * @example
 * ```typescript
 * const initial = fromNullable(userData, "No data");
 * const result = pipeResult(
 *     initial,
 *     tap(user => console.log(user)),
 *     chain(validateUser),
 *     map(transformUser),
 *     mapError(error => `Failed: ${error}`)
 * ); // Result<TransformedUser>
 * ```
 * 
 * @example
 * ```typescript
 * // Compare with regular pipe (starts with plain value):
 * const withPipe = pipe(
 *     userData,                    // Plain value
 *     data => validateData(data),  // Returns Result
 *     result => transformResult(result) // Takes Result, returns Result
 * );
 * 
 * // vs pipeResult (starts with Result):
 * const withPipeResult = pipeResult(
 *     validateData(userData),      // Already a Result
 *     transformResult,             // Takes Result, returns Result
 *     anotherTransform            // Takes Result, returns Result
 * );
 * ```
 */
export function pipeResult<T>(
    initial: Result<T>
): Result<T>;

export function pipeResult<T, A>(
    initial: Result<T>,
    op1: (result: Result<T>) => Result<A>
): Result<A>;

export function pipeResult<T, A, B>(
    initial: Result<T>,
    op1: (result: Result<T>) => Result<A>,
    op2: (result: Result<A>) => Result<B>
): Result<B>;

export function pipeResult<T, A, B, C>(
    initial: Result<T>,
    op1: (result: Result<T>) => Result<A>,
    op2: (result: Result<A>) => Result<B>,
    op3: (result: Result<B>) => Result<C>
): Result<C>;

export function pipeResult<T>(
    initial: Result<T>,
    ...operations: Array<(result: Result<any>) => Result<any>>
): Result<any>;

export function pipeResult<T>(
    initial: Result<T>,
    ...operations: Array<(result: Result<any>) => Result<any>>
): Result<any> {
    return operations.reduce(
        (accumulator: Result<T>, operation) => operation(accumulator),
        initial
    );
}
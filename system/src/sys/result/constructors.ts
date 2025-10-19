import type { Result } from './core';
import { success, failure } from './core';

// ============================================================================
// CONSTRUCTOR OPERATIONS
// ============================================================================

/**
 * Converts a nullable value to a Result.
 * Treats null and undefined as failures, all other values as successes.
 * This is essential for safely handling values that might be null/undefined.
 * 
 * @param value - The potentially null or undefined value
 * @param errorMessage - Error message to use if value is null/undefined
 * @returns Result containing the value, or failure with error message
 * 
 * @example
 * ```typescript
 * fromNullable("hello", "Value is missing") // success("hello")
 * fromNullable(null, "Value is missing") // failure("Value is missing")
 * fromNullable(undefined, "Value is missing") // failure("Value is missing")
 * fromNullable(0, "Value is missing") // success(0) - falsy but not null
 * ```
 */
export const fromNullable = <SuccessValue>(
    value: SuccessValue | null | undefined,
    errorMessage: string
): Result<SuccessValue> =>
    value != null ? success(value) : failure(errorMessage);

/**
 * Creates a Result based on predicate validation.
 * Returns a curried function that validates values against the predicate.
 * This enables reusable validation logic with custom error messages.
 * 
 * @param predicate - Function that returns true for valid values
 * @param errorMessage - Static string or function that generates error message
 * @returns Curried function that validates values and returns Results
 * 
 * @example
 * ```typescript
 * const validatePositive = fromPredicate(
 *     (n: number) => n > 0,
 *     "Number must be positive"
 * );
 * validatePositive(5) // success(5)
 * validatePositive(-1) // failure("Number must be positive")
 * 
 * const validateLength = fromPredicate(
 *     (s: string) => s.length >= 3,
 *     (s: string) => `String "${s}" is too short (min 3 chars)`
 * );
 * validateLength("hi") // failure('String "hi" is too short (min 3 chars)')
 * ```
 */
export const fromPredicate = <SuccessValue>(
    predicate: (value: SuccessValue) => boolean,
    errorMessage: string | ((value: SuccessValue) => string)
) => (value: SuccessValue): Result<SuccessValue> =>
        predicate(value)
            ? success(value)
            : failure(typeof errorMessage === 'string' ? errorMessage : errorMessage(value));

/**
 * Safely wraps exception-throwing operations in a Result.
 * Catches any thrown exceptions and converts them to failure Results.
 * Essential for integrating with legacy code that uses exceptions.
 * 
 * @param operation - Function that might throw exceptions
 * @param handleError - Function to convert exceptions to error messages
 * @returns Result containing the operation result or error message
 * 
 * @example
 * ```typescript
 * tryCatch(() => JSON.parse('{"valid": "json"}')) 
 * // success({valid: "json"})
 * 
 * tryCatch(() => JSON.parse('invalid json'))
 * // failure("Unexpected token i in JSON at position 0")
 * 
 * tryCatch(
 *     () => { throw new Error("Custom error"); },
 *     (error) => `Operation failed: ${error}`
 * ) // failure("Operation failed: Error: Custom error")
 * ```
 */
export const tryCatch = <SuccessValue>(
    operation: () => SuccessValue,
    handleError: (error: unknown) => string = (err) => String(err)
): Result<SuccessValue> => {
    try {
        return success(operation());
    } catch (error) {
        return failure(handleError(error));
    }
};
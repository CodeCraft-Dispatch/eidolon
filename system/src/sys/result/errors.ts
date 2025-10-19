import type { Result } from './core';
import { failure } from './core';

// ============================================================================
// ERROR TRANSFORMATION
// ============================================================================

/**
 * Transforms the error message of a failed Result while leaving successful Results unchanged.
 * This is the error-equivalent of the map function.
 * 
 * @param transformer - Function to transform the error message
 * @returns A curried function that transforms error messages in Results
 * 
 * @example
 * ```typescript
 * const addContext = mapError(err => `Validation failed: ${err}`);
 * addContext(failure("Required field missing"))
 * // Result with error: "Validation failed: Required field missing"
 * ```
 */
export const mapError = <SuccessValue>(
    transformer: (error: string) => string
) => (result: Result<SuccessValue>): Result<SuccessValue> =>
        result.success ? result : failure(transformer(result.error));

/**
 * Chains error recovery operations together.
 * If the Result is successful, it passes through unchanged.
 * If the Result is a failure, applies the recovery function to the error.
 * 
 * @param recovery - Function that takes an error and returns a Result (for recovery)
 * @returns A curried function that enables error recovery
 * 
 * @example
 * ```typescript
 * const withFallback = chainError(err => 
 *     err.includes("network") ? success("offline mode") : failure(err)
 * );
 * withFallback(failure("network timeout")) // Result<string> containing "offline mode"
 * ```
 */
export const chainError = <SuccessValue>(
    recovery: (error: string) => Result<SuccessValue>
) => (result: Result<SuccessValue>): Result<SuccessValue> =>
        result.success ? result : recovery(result.error);

// ============================================================================
// RESULT ELIMINATION
// ============================================================================

/**
 * Eliminates the Result structure by providing handlers for both success and failure cases.
 * This is a catamorphism that extracts values from the Result context.
 * 
 * @param onSuccess - Function to handle successful values
 * @param onError - Function to handle error messages
 * @returns A curried function that eliminates the Result structure
 * 
 * @example
 * ```typescript
 * const handleResult = fold(
 *     value => `Success: ${value}`,
 *     error => `Error: ${error}`
 * );
 * handleResult(success(42)) // "Success: 42"
 * handleResult(failure("oops")) // "Error: oops"
 * ```
 */
export const fold = <SuccessValue, SuccessResult, ErrorResult>(
    onSuccess: (value: SuccessValue) => SuccessResult,
    onError: (error: string) => ErrorResult
) => (result: Result<SuccessValue>): SuccessResult | ErrorResult =>
        result.success ? onSuccess(result.value) : onError(result.error);

/**
 * Extracts the success value or returns a default value if the Result is a failure.
 * 
 * @param defaultValue - Value to return if the Result is a failure
 * @returns A curried function that extracts values with a default fallback
 * 
 * @example
 * ```typescript
 * const getValueOrZero = getOrElse(0);
 * getValueOrZero(success(42)) // 42
 * getValueOrZero(failure("error")) // 0
 * ```
 */
export const getOrElse = <SuccessValue>(
    defaultValue: SuccessValue
) => (result: Result<SuccessValue>): SuccessValue =>
        result.success ? result.value : defaultValue;

/**
 * Extracts the success value or computes a default value lazily from the error.
 * Useful when the default value is expensive to compute or depends on the error.
 * 
 * @param getDefaultValue - Function that computes a default value from the error
 * @returns A curried function that extracts values with lazy default computation
 * 
 * @example
 * ```typescript
 * const getValueOrLength = getOrElseLazy(error => error.length);
 * getValueOrLength(success(42)) // 42
 * getValueOrLength(failure("error")) // 5 (length of "error")
 * ```
 */
export const getOrElseLazy = <SuccessValue>(
    getDefaultValue: (error: string) => SuccessValue
) => (result: Result<SuccessValue>): SuccessValue =>
        result.success ? result.value : getDefaultValue(result.error);

// ============================================================================
// ALTERNATIVE RESULTS
// ============================================================================

/**
 * Returns the first Result if successful, otherwise returns the alternative Result.
 * This enables fallback behavior with alternative Results.
 * 
 * @param alternative - Alternative Result to use if the first fails
 * @returns A curried function that provides alternative Results
 * 
 * @example
 * ```typescript
 * const withBackup = orElse(success("backup value"));
 * withBackup(success("primary")) // Result containing "primary"
 * withBackup(failure("error")) // Result containing "backup value"
 * ```
 */
export const orElse = <SuccessValue>(
    alternative: Result<SuccessValue>
) => (result: Result<SuccessValue>): Result<SuccessValue> =>
        result.success ? result : alternative;

/**
 * Returns the first Result if successful, otherwise computes an alternative Result lazily.
 * Useful when the alternative is expensive to compute or depends on the error.
 * 
 * @param getAlternative - Function that computes an alternative Result from the error
 * @returns A curried function that provides lazy alternative Results
 * 
 * @example
 * ```typescript
 * const withContextualFallback = orElseLazy(error => 
 *     error.includes("network") ? success("cached data") : failure("permanent error")
 * );
 * withContextualFallback(failure("network timeout")) // Result containing "cached data"
 * ```
 */
export const orElseLazy = <SuccessValue>(
    getAlternative: (error: string) => Result<SuccessValue>
) => (result: Result<SuccessValue>): Result<SuccessValue> =>
        result.success ? result : getAlternative(result.error);
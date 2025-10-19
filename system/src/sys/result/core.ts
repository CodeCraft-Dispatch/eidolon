// ============================================================================
// CORE RESULT TYPE
// ============================================================================

/**
 * Brand symbol to prevent accidental mixing of Result types with other objects.
 * This ensures type safety at compile time.
 */
declare const __resultBrand: unique symbol;

/**
 * Base type for all Result variants, providing the brand for type safety.
 */
export type ResultBase = {} & { readonly [__resultBrand]: true };

/**
 * Represents a successful computation result containing a value.
 * 
 * @template SuccessValue - The type of the success value
 */
export type ResultSuccess<SuccessValue> = {
    readonly success: true;
    readonly value: SuccessValue
} & ResultBase;

/**
 * Represents a failed computation result containing an error message.
 */
export type ResultError = {
    readonly success: false;
    readonly error: string
} & ResultBase;

/**
 * Represents the result of a computation that may succeed or fail.
 * This type enables railway-oriented programming for error handling.
 * 
 * @template SuccessValue - The type of the success value
 */
export type Result<SuccessValue> = ResultSuccess<SuccessValue> | ResultError;

// ============================================================================
// CONVENIENCE TYPES
// ============================================================================

/**
 * A Result that can succeed with any value or fail with a string error.
 * Useful for generic contexts where the success type is not yet determined.
 */
export type AnyResult<T = unknown> = Result<T>;

/**
 * A Result that represents a validation outcome.
 * Semantically indicates this Result comes from validation logic.
 */
export type ValidationResult<T> = Result<T>;

/**
 * A Result that represents a parsing outcome.
 * Semantically indicates this Result comes from parsing operations.
 */
export type ParseResult<T> = Result<T>;

// ============================================================================
// SMART CONSTRUCTORS
// ============================================================================

/**
 * Creates a successful Result containing the provided value.
 * 
 * @param value - The success value to wrap
 * @returns A ResultSuccess containing the value
 * 
 * @example
 * ```typescript
 * const result = success(42); // Result<number> containing 42
 * ```
 */
export const success = <SuccessValue>(value: SuccessValue): ResultSuccess<SuccessValue> => ({
    success: true,
    value
} as ResultSuccess<SuccessValue>);

/**
 * Creates a failed Result containing the provided error message.
 * 
 * @param errorMessage - The error message describing the failure
 * @returns A ResultError containing the error message
 * 
 * @example
 * ```typescript
 * const result = failure("Something went wrong"); // Result<never> with error
 * ```
 */
export const failure = (errorMessage: string): ResultError => ({
    success: false,
    error: errorMessage
} as ResultError);

// ============================================================================
// TYPE GUARDS & INTROSPECTION
// ============================================================================

/**
 * Type guard to check if a Result is successful.
 * Narrows the type to ResultSuccess for safe value access.
 * 
 * @param result - The Result to check
 * @returns True if the Result is successful, false otherwise
 * 
 * @example
 * ```typescript
 * if (isSuccess(result)) {
 *     console.log(result.value); // TypeScript knows this is safe
 * }
 * ```
 */
export const isSuccess = <SuccessValue>(result: Result<SuccessValue>): result is ResultSuccess<SuccessValue> =>
    result.success;

/**
 * Type guard to check if a Result is a failure.
 * Narrows the type to ResultError for safe error access.
 * 
 * @param result - The Result to check
 * @returns True if the Result is a failure, false otherwise
 * 
 * @example
 * ```typescript
 * if (isFailure(result)) {
 *     console.log(result.error); // TypeScript knows this is safe
 * }
 * ```
 */
export const isFailure = <SuccessValue>(result: Result<SuccessValue>): result is ResultError =>
    !result.success;

// ============================================================================
// CORE MONADIC OPERATIONS
// ============================================================================

/**
 * Transforms a successful Result value using the provided function.
 * If the Result is a failure, it passes through unchanged.
 * 
 * This is the fundamental functor operation for Result types.
 * 
 * @param transformer - Pure function to transform the success value
 * @returns A curried function that takes a Result and returns a transformed Result
 * 
 * @example
 * ```typescript
 * const double = map((x: number) => x * 2);
 * double(success(5))        // Result<number> containing 10
 * double(failure("error"))  // Result<number> with same error
 * ```
 */
export const map = <SourceValue, TargetValue>(
    transformer: (value: SourceValue) => TargetValue
) => (result: Result<SourceValue>): Result<TargetValue> =>
        result.success ? success(transformer(result.value)) : result;

/**
 * Chains Result-returning operations together.
 * If the input Result is successful, applies the operation to its value.
 * If the input Result is a failure, passes it through unchanged.
 * 
 * This is the fundamental monadic bind operation for Result types.
 * 
 * @param operation - Function that takes a success value and returns a Result
 * @returns A curried function that chains the operation
 * 
 * @example
 * ```typescript
 * const parseNumber = (s: string) => 
 *     isNaN(Number(s)) ? failure("Not a number") : success(Number(s));
 * 
 * const result = chain(parseNumber)(success("42")); // Result<number> containing 42
 * const failed = chain(parseNumber)(success("abc")); // Result<number> with error
 * ```
 */
export const chain = <InputValue, OutputValue>(
    operation: (value: InputValue) => Result<OutputValue>
) => (result: Result<InputValue>): Result<OutputValue> =>
        result.success ? operation(result.value) : result;

/**
 * Applies a Result-wrapped function to a Result-wrapped value.
 * Both the function and value must be successful for the operation to succeed.
 * 
 * This enables applicative functor patterns for parallel validation.
 * 
 * @param resultFunction - A Result containing a function
 * @returns A curried function that applies the wrapped function to a wrapped value
 * 
 * @example
 * ```typescript
 * const add = (x: number) => (y: number) => x + y;
 * const wrappedAdd = success(add);
 * const result = apply(wrappedAdd)(success(5)); // Result<(y: number) => number>
 * ```
 */
export const apply = <ArgumentValue, ReturnValue>(
    resultFunction: Result<(arg: ArgumentValue) => ReturnValue>
) => (resultValue: Result<ArgumentValue>): Result<ReturnValue> =>
        chain<(arg: ArgumentValue) => ReturnValue, ReturnValue>(
            fn => map<ArgumentValue, ReturnValue>(fn)(resultValue)
        )(resultFunction);
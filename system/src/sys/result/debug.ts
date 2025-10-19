import type { Result } from './core';

// ============================================================================
// DEBUG OPERATIONS
// ============================================================================

/**
 * Executes a side effect on successful Results without modifying the Result.
 * Essential for logging, metrics collection, and debugging in functional pipelines.
 * The side effect only runs for successful Results, making it safe for logging values.
 * 
 * @param sideEffect - Function to execute with the success value
 * @returns Curried function that takes a Result and returns it unchanged
 * 
 * @example
 * ```typescript
 * const logSuccess = tap((value: number) => console.log(`Processing: ${value}`));
 * 
 * pipe(
 *     success(42),
 *     logSuccess,              // Logs: "Processing: 42"
 *     map(x => x * 2)         // Result still flows through unchanged
 * ) // success(84)
 * 
 * pipe(
 *     failure("error"),
 *     logSuccess,              // No logging - side effect skipped
 *     map(x => x * 2)         // Still failure("error")
 * )
 * ```
 */
export const tap = <SuccessValue>(
    sideEffect: (value: SuccessValue) => void
) => (result: Result<SuccessValue>): Result<SuccessValue> => {
    if (result.success) {
        sideEffect(result.value);
    }
    return result;
};

/**
 * Executes a side effect on failed Results without modifying the Result.
 * Essential for error tracking, alerting, and debugging failure scenarios.
 * The side effect only runs for failed Results, enabling error-specific logging.
 * 
 * @param sideEffect - Function to execute with the error message
 * @returns Curried function that takes a Result and returns it unchanged
 * 
 * @example
 * ```typescript
 * const logError = tapError((error: string) => console.error(`Failed: ${error}`));
 * 
 * pipe(
 *     failure("validation failed"),
 *     logError,               // Logs: "Failed: validation failed"
 *     orElse(() => success(0)) // Recovery logic still works
 * ) // success(0)
 * 
 * pipe(
 *     success(42),
 *     logError,               // No logging - side effect skipped
 *     map(x => x * 2)        // Still success(84)
 * )
 * ```
 */
export const tapError = <SuccessValue>(
    sideEffect: (error: string) => void
) => (result: Result<SuccessValue>): Result<SuccessValue> => {
    if (!result.success) {
        sideEffect(result.error);
    }
    return result;
};

/**
 * Logs both successful and failed Results with formatted messages.
 * Provides comprehensive debugging visibility into Result flow through pipelines.
 * Uses JSON serialization for success values and direct error message display.
 * 
 * @param logger - Logging function (defaults to console.log)
 * @returns Curried function that traces Results and returns them unchanged
 * 
 * @example
 * ```typescript
 * const traceResults = trace(); // Uses console.log
 * const customTrace = trace((msg) => debug.log(`[TRACE] ${msg}`));
 * 
 * pipe(
 *     success({ id: 1, name: "Alice" }),
 *     traceResults,           // Logs: 'Success: {"id":1,"name":"Alice"}'
 *     map(user => user.name)
 * ) // success("Alice")
 * 
 * pipe(
 *     failure("user not found"),
 *     traceResults,           // Logs: "Error: user not found"
 *     orElse(() => success("Guest"))
 * ) // success("Guest")
 * ```
 */
export const trace = <SuccessValue>(
    logger: (message: string) => void = console.log
) => (result: Result<SuccessValue>): Result<SuccessValue> => {
    if (result.success) {
        logger(`Success: ${JSON.stringify(result.value)}`);
    } else {
        logger(`Error: ${result.error}`);
    }
    return result;
};

/**
 * Executes different side effects based on Result success/failure state.
 * Provides comprehensive debugging with separate handlers for each case.
 * Useful for metrics collection where you need different handling per state.
 * 
 * @param onSuccess - Side effect to execute for successful Results
 * @param onError - Side effect to execute for failed Results
 * @returns Curried function that executes appropriate side effect
 * 
 * @example
 * ```typescript
 * const debugBoth = tapBoth(
 *     (value: User) => metrics.increment('user.loaded', { userId: value.id }),
 *     (error: string) => metrics.increment('user.error', { error })
 * );
 * 
 * pipe(
 *     loadUser(123),
 *     debugBoth,              // Executes appropriate metric
 *     map(user => user.profile)
 * )
 * ```
 */
export const tapBoth = <SuccessValue>(
    onSuccess: (value: SuccessValue) => void,
    onError: (error: string) => void
) => (result: Result<SuccessValue>): Result<SuccessValue> => {
    if (result.success) {
        onSuccess(result.value);
    } else {
        onError(result.error);
    }
    return result;
};

/**
 * Conditionally executes a side effect based on a predicate.
 * Enables selective debugging based on runtime conditions or value properties.
 * Only executes the side effect if both Result is successful and predicate passes.
 * 
 * @param predicate - Function that determines whether to execute side effect
 * @param sideEffect - Side effect to execute if predicate passes
 * @returns Curried function that conditionally executes side effect
 * 
 * @example
 * ```typescript
 * const logLargeNumbers = tapIf(
 *     (n: number) => n > 1000,
 *     (n: number) => console.log(`Large number detected: ${n}`)
 * );
 * 
 * pipe(
 *     success(1500),
 *     logLargeNumbers,        // Logs: "Large number detected: 1500"
 *     map(x => x / 2)
 * ) // success(750)
 * 
 * pipe(
 *     success(50),
 *     logLargeNumbers,        // No logging - predicate fails
 *     map(x => x / 2)
 * ) // success(25)
 * ```
 */
export const tapIf = <SuccessValue>(
    predicate: (value: SuccessValue) => boolean,
    sideEffect: (value: SuccessValue) => void
) => (result: Result<SuccessValue>): Result<SuccessValue> => {
    if (result.success && predicate(result.value)) {
        sideEffect(result.value);
    }
    return result;
};

/**
 * Creates a tagged tracer that prefixes all log messages with a label.
 * Useful for distinguishing trace output from different parts of the application.
 * Enables easier debugging in complex systems with multiple Result pipelines.
 * 
 * @param tag - Label to prefix all log messages
 * @param logger - Logging function (defaults to console.log)
 * @returns Tracer function with tagged output
 * 
 * @example
 * ```typescript
 * const userTrace = createTaggedTrace('USER-SERVICE');
 * const paymentTrace = createTaggedTrace('PAYMENT-SERVICE', customLogger);
 * 
 * pipe(
 *     loadUser(123),
 *     userTrace,              // Logs: "[USER-SERVICE] Success: {...}"
 *     map(user => user.email)
 * )
 * 
 * pipe(
 *     processPayment(amount),
 *     paymentTrace,           // Logs: "[PAYMENT-SERVICE] Success: {...}"
 *     chain(validatePayment)
 * )
 * ```
 */
export const createTaggedTrace = <SuccessValue>(
    tag: string,
    logger: (message: string) => void = console.log
) => (result: Result<SuccessValue>): Result<SuccessValue> => {
    const taggedLogger = (message: string) => logger(`[${tag}] ${message}`);
    return trace<SuccessValue>(taggedLogger)(result);
};

/**
 * Creates a performance timer that measures execution time between two points.
 * Useful for profiling Result pipeline performance and identifying bottlenecks.
 * Returns a function that stops the timer and logs the elapsed time.
 * 
 * @param label - Label for the performance measurement
 * @param logger - Logging function (defaults to console.log)
 * @returns Function that stops the timer and logs elapsed time
 * 
 * @example
 * ```typescript
 * const stopTimer = startTimer('User Processing');
 * 
 * const result = pipe(
 *     loadUser(123),
 *     map(enrichUserData),
 *     chain(validateUser),
 *     tap(stopTimer)          // Logs: "User Processing: 45.2ms"
 * );
 * ```
 */
export const startTimer = (
    label: string,
    logger: (message: string) => void = console.log
): ((value: any) => void) => {
    const startTime = performance.now();

    return () => {
        const elapsed = performance.now() - startTime;
        logger(`${label}: ${elapsed.toFixed(1)}ms`);
    };
};
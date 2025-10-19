import { describe, expect, it, vi } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure } from '../../result/core';
import {
    tap,
    tapError,
    trace,
    tapBoth,
    tapIf,
    createTaggedTrace,
    startTimer
} from '../../result/debug';

describe('Debug Domain', () => {
    describe('tap', () => {
        it('should execute side effect on successful Results', () => {
            const sideEffect = vi.fn();
            const tapSideEffect = tap(sideEffect);

            const result = tapSideEffect(success(42));

            expect(sideEffect).toHaveBeenCalledWith(42);
            expect(result).toEqual(success(42));
        });

        it('should not execute side effect on failed Results', () => {
            const sideEffect = vi.fn();
            const tapSideEffect = tap(sideEffect);

            const result = tapSideEffect(failure("error"));

            expect(sideEffect).not.toHaveBeenCalled();
            expect(result).toEqual(failure("error"));
        });

        it('should preserve Result value unchanged', () => {
            const sideEffect = vi.fn();
            const tapSideEffect = tap(sideEffect);

            const originalResult = success("hello");
            const result = tapSideEffect(originalResult);

            expect(result).toBe(originalResult); // Same reference
            expect(result).toEqual(success("hello"));
        });

        it('should work with complex objects', () => {
            const sideEffect = vi.fn();
            const tapSideEffect = tap(sideEffect);

            const user = { id: 1, name: "Alice" };
            const result = tapSideEffect(success(user));

            expect(sideEffect).toHaveBeenCalledWith(user);
            expect(result).toEqual(success(user));
        });

        it('should be curried for pipeline usage', () => {
            const logs: number[] = [];
            const logValue = tap((n: number) => logs.push(n));

            const result = logValue(success(123));

            expect(logs).toEqual([123]);
            expect(result).toEqual(success(123));
        });
    });

    describe('tapError', () => {
        it('should execute side effect on failed Results', () => {
            const sideEffect = vi.fn();
            const tapErrorSideEffect = tapError(sideEffect);

            const result = tapErrorSideEffect(failure("test error"));

            expect(sideEffect).toHaveBeenCalledWith("test error");
            expect(result).toEqual(failure("test error"));
        });

        it('should not execute side effect on successful Results', () => {
            const sideEffect = vi.fn();
            const tapErrorSideEffect = tapError(sideEffect);

            const result = tapErrorSideEffect(success(42));

            expect(sideEffect).not.toHaveBeenCalled();
            expect(result).toEqual(success(42));
        });

        it('should preserve Result error unchanged', () => {
            const sideEffect = vi.fn();
            const tapErrorSideEffect = tapError(sideEffect);

            const originalResult = failure("original error");
            const result = tapErrorSideEffect(originalResult);

            expect(result).toBe(originalResult); // Same reference
            expect(result).toEqual(failure("original error"));
        });

        it('should be curried for error tracking', () => {
            const errors: string[] = [];
            const trackError = tapError((error: string) => errors.push(error));

            const result = trackError(failure("network timeout"));

            expect(errors).toEqual(["network timeout"]);
            expect(result).toEqual(failure("network timeout"));
        });
    });

    describe('trace', () => {
        it('should log successful Results with JSON formatting', () => {
            const logger = vi.fn();
            const traceResult = trace(logger);

            const result = traceResult(success({ id: 1, name: "test" }));

            expect(logger).toHaveBeenCalledWith('Success: {"id":1,"name":"test"}');
            expect(result).toEqual(success({ id: 1, name: "test" }));
        });

        it('should log failed Results with error message', () => {
            const logger = vi.fn();
            const traceResult = trace(logger);

            const result = traceResult(failure("validation failed"));

            expect(logger).toHaveBeenCalledWith("Error: validation failed");
            expect(result).toEqual(failure("validation failed"));
        });

        it('should use console.log by default', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const traceResult = trace();

            traceResult(success("test"));

            expect(consoleSpy).toHaveBeenCalledWith('Success: "test"');

            consoleSpy.mockRestore();
        });

        it('should handle primitive values correctly', () => {
            const logger = vi.fn();
            const traceResult = trace(logger);

            traceResult(success(42));
            traceResult(success("hello"));
            traceResult(success(true));

            expect(logger).toHaveBeenCalledWith("Success: 42");
            expect(logger).toHaveBeenCalledWith('Success: "hello"');
            expect(logger).toHaveBeenCalledWith("Success: true");
        });

        it('should handle null and undefined values', () => {
            const logger = vi.fn();
            const traceResult = trace(logger);

            traceResult(success(null));
            traceResult(success(undefined));

            expect(logger).toHaveBeenCalledWith("Success: null");
            expect(logger).toHaveBeenCalledWith("Success: undefined");
        });
    });

    describe('tapBoth', () => {
        it('should execute success handler for successful Results', () => {
            const onSuccess = vi.fn();
            const onError = vi.fn();
            const tapBothEffects = tapBoth(onSuccess, onError);

            const result = tapBothEffects(success("test"));

            expect(onSuccess).toHaveBeenCalledWith("test");
            expect(onError).not.toHaveBeenCalled();
            expect(result).toEqual(success("test"));
        });

        it('should execute error handler for failed Results', () => {
            const onSuccess = vi.fn();
            const onError = vi.fn();
            const tapBothEffects = tapBoth(onSuccess, onError);

            const result = tapBothEffects(failure("error"));

            expect(onSuccess).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalledWith("error");
            expect(result).toEqual(failure("error"));
        });

        it('should be useful for metrics collection', () => {
            const metrics = { successes: 0, errors: 0 };
            const trackMetrics = tapBoth(
                () => metrics.successes++,
                () => metrics.errors++
            );

            trackMetrics(success("ok"));
            trackMetrics(failure("fail"));
            trackMetrics(success("ok2"));

            expect(metrics).toEqual({ successes: 2, errors: 1 });
        });
    });

    describe('tapIf', () => {
        it('should execute side effect when predicate passes', () => {
            const sideEffect = vi.fn();
            const tapConditional = tapIf(
                (n: number) => n > 10,
                sideEffect
            );

            const result = tapConditional(success(15));

            expect(sideEffect).toHaveBeenCalledWith(15);
            expect(result).toEqual(success(15));
        });

        it('should not execute side effect when predicate fails', () => {
            const sideEffect = vi.fn();
            const tapConditional = tapIf(
                (n: number) => n > 10,
                sideEffect
            );

            const result = tapConditional(success(5));

            expect(sideEffect).not.toHaveBeenCalled();
            expect(result).toEqual(success(5));
        });

        it('should not execute side effect for failed Results', () => {
            const sideEffect = vi.fn();
            const tapConditional = tapIf(
                (n: number) => n > 10,
                sideEffect
            );

            const result = tapConditional(failure("error"));

            expect(sideEffect).not.toHaveBeenCalled();
            expect(result).toEqual(failure("error"));
        });

        it('should work with complex predicates', () => {
            const sideEffect = vi.fn();
            const tapConditional = tapIf(
                (user: { age: number; active: boolean }) => user.age >= 18 && user.active,
                sideEffect
            );

            tapConditional(success({ age: 25, active: true }));  // Should execute
            tapConditional(success({ age: 16, active: true }));  // Should not execute
            tapConditional(success({ age: 25, active: false })); // Should not execute

            expect(sideEffect).toHaveBeenCalledTimes(1);
            expect(sideEffect).toHaveBeenCalledWith({ age: 25, active: true });
        });
    });

    describe('createTaggedTrace', () => {
        it('should prefix log messages with tag', () => {
            const logger = vi.fn();
            const taggedTrace = createTaggedTrace('TEST-TAG', logger);

            taggedTrace(success("value"));
            taggedTrace(failure("error"));

            expect(logger).toHaveBeenCalledWith('[TEST-TAG] Success: "value"');
            expect(logger).toHaveBeenCalledWith('[TEST-TAG] Error: error');
        });

        it('should use console.log by default', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const taggedTrace = createTaggedTrace('DEFAULT-TAG');

            taggedTrace(success("test"));

            expect(consoleSpy).toHaveBeenCalledWith('[DEFAULT-TAG] Success: "test"');

            consoleSpy.mockRestore();
        });

        it('should enable distinguishing between different services', () => {
            const logger = vi.fn();
            const userTrace = createTaggedTrace('USER-SERVICE', logger);
            const paymentTrace = createTaggedTrace('PAYMENT-SERVICE', logger);

            userTrace(success({ id: 1 }));
            paymentTrace(success({ amount: 100 }));

            expect(logger).toHaveBeenCalledWith('[USER-SERVICE] Success: {"id":1}');
            expect(logger).toHaveBeenCalledWith('[PAYMENT-SERVICE] Success: {"amount":100}');
        });
    });

    describe('startTimer', () => {
        it('should measure and log elapsed time', () => {
            const logger = vi.fn();
            const stopTimer = startTimer('Test Operation', logger);

            // Simulate some work
            const start = performance.now();
            while (performance.now() - start < 10) {
                // Wait for at least 10ms
            }

            stopTimer('unused');

            expect(logger).toHaveBeenCalledTimes(1);
            const logCall = logger.mock.calls[0][0];
            expect(logCall).toMatch(/^Test Operation: \d+\.\d+ms$/);

            // Extract the time and verify it's reasonable (>= 10ms)
            const timeMatch = logCall.match(/(\d+\.\d+)ms$/);
            expect(timeMatch).toBeTruthy();
            const elapsedTime = parseFloat(timeMatch![1]);
            expect(elapsedTime).toBeGreaterThanOrEqual(10);
        });

        it('should use console.log by default', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            const stopTimer = startTimer('Default Timer');

            stopTimer('unused');

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy.mock.calls[0][0]).toMatch(/^Default Timer: \d+\.\d+ms$/);

            consoleSpy.mockRestore();
        });

        it('should work with different labels', () => {
            const logger = vi.fn();

            const stopTimer1 = startTimer('Operation A', logger);
            const stopTimer2 = startTimer('Operation B', logger);

            stopTimer1('unused');
            stopTimer2('unused');

            expect(logger).toHaveBeenCalledTimes(2);
            expect(logger.mock.calls[0][0]).toMatch(/^Operation A: \d+\.\d+ms$/);
            expect(logger.mock.calls[1][0]).toMatch(/^Operation B: \d+\.\d+ms$/);
        });

        it('should work in Result pipelines', () => {
            const logger = vi.fn();
            const stopTimer = startTimer('Pipeline Timer', logger);

            // Simulate pipeline usage
            const result = success(42);
            tap(stopTimer)(result);

            expect(logger).toHaveBeenCalledTimes(1);
            expect(logger.mock.calls[0][0]).toMatch(/^Pipeline Timer: \d+\.\d+ms$/);
        });
    });

    describe('Debug Integration', () => {
        it('should compose multiple debug operations', () => {
            const logs: string[] = [];
            const errors: string[] = [];

            const tapSuccess = tap<number>((value: number) => logs.push(`Processing: ${value}`));
            const tapErr = tapError<number>((error: string) => errors.push(`Error: ${error}`));
            const traceResult = trace<number>((msg: string) => logs.push(`Trace: ${msg}`));

            // Test success path
            let result: Result<number> = success(42);
            result = tapSuccess(result);
            result = tapErr(result);
            result = traceResult(result);

            expect(logs).toContain("Processing: 42");
            expect(logs).toContain("Trace: Success: 42");
            expect(errors).toHaveLength(0);

            // Reset and test error path
            logs.length = 0;
            errors.length = 0;

            let errorResult: Result<number> = failure("test error");
            errorResult = tapSuccess(errorResult);
            errorResult = tapErr(errorResult);
            errorResult = traceResult(errorResult);

            expect(logs).toContain("Trace: Error: test error");
            expect(errors).toContain("Error: test error");
            expect(logs).not.toContain("Processing:");
        });

        it('should work with conditional debugging', () => {
            const importantLogs: number[] = [];
            const allLogs: string[] = [];

            const tapImportant = tapIf<number>(
                (n: number) => n > 100,
                (n: number) => importantLogs.push(n)
            );
            const traceAll = trace<number>((msg: string) => allLogs.push(msg));

            // Test with important value
            let result: Result<number> = success(150);
            result = tapImportant(result);
            result = traceAll(result);

            expect(importantLogs).toEqual([150]);
            expect(allLogs).toContain("Success: 150");

            // Test with unimportant value
            result = success(50);
            result = tapImportant(result);
            result = traceAll(result);

            expect(importantLogs).toEqual([150]); // Unchanged
            expect(allLogs).toContain("Success: 50");
        });

        it('should enable comprehensive debugging workflows', () => {
            interface User {
                id: number;
                name: string;
                active: boolean;
            }

            const debugLogs: string[] = [];
            const metrics = { activeUsers: 0, inactiveUsers: 0, errors: 0 };

            const taggedTrace = createTaggedTrace('USER-PROCESSOR', (msg) => debugLogs.push(msg));
            const tapMetrics = tapBoth(
                (user: User) => {
                    if (user.active) metrics.activeUsers++;
                    else metrics.inactiveUsers++;
                },
                () => metrics.errors++
            );
            const tapInactive = tapIf(
                (user: User) => !user.active,
                (user: User) => debugLogs.push(`WARN: Inactive user ${user.id}`)
            );

            // Process active user
            let result: Result<User> = success({ id: 1, name: "Alice", active: true });
            taggedTrace(result);
            tapMetrics(result);
            tapInactive(result);

            // Process inactive user
            result = success({ id: 2, name: "Bob", active: false });
            taggedTrace(result);
            tapMetrics(result);
            tapInactive(result);

            // Process error
            const errorResult: Result<User> = failure("User not found");
            taggedTrace(errorResult);
            tapMetrics(errorResult);
            tapInactive(errorResult); expect(metrics).toEqual({ activeUsers: 1, inactiveUsers: 1, errors: 1 });
            expect(debugLogs).toContain('[USER-PROCESSOR] Success: {"id":1,"name":"Alice","active":true}');
            expect(debugLogs).toContain('[USER-PROCESSOR] Success: {"id":2,"name":"Bob","active":false}');
            expect(debugLogs).toContain('[USER-PROCESSOR] Error: User not found');
            expect(debugLogs).toContain('WARN: Inactive user 2');
        });
    });
});
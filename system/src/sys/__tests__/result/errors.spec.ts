import { describe, it, expect } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure, isSuccess, isFailure } from '../../result/core';
import {
    mapError,
    chainError,
    fold,
    getOrElse,
    getOrElseLazy,
    orElse,
    orElseLazy
} from '../../result/errors';

describe('Error Transformation', () => {
    describe('mapError', () => {
        it('should transform error messages in failed Results', () => {
            const addContext = mapError((err: string) => `Validation failed: ${err}`);
            const result = addContext(failure('Required field missing'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('Validation failed: Required field missing');
            }
        });

        it('should pass through successful Results unchanged', () => {
            const addContext = mapError((err: string) => `Validation failed: ${err}`);
            const result = addContext(success(42));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(42);
            }
        });

        it('should allow error message formatting', () => {
            const formatError = mapError((err: string) => err.toUpperCase());
            const result = formatError(failure('lowercase error'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('LOWERCASE ERROR');
            }
        });

        it('should compose error transformations', () => {
            const addPrefix = mapError((err: string) => `ERROR: ${err}`);
            const addSuffix = mapError((err: string) => `${err}!`);
            const combined = (result: Result<any>) => addSuffix(addPrefix(result));

            const result = combined(failure('something went wrong'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('ERROR: something went wrong!');
            }
        });

        it('should maintain type safety', () => {
            const transform = mapError((err: string) => `Transformed: ${err}`);
            const numberResult: Result<number> = failure('original error');
            const transformed = transform(numberResult);

            expect(isFailure(transformed)).toBe(true);
            if (isFailure(transformed)) {
                expect(transformed.error).toBe('Transformed: original error');
            }
        });
    });

    describe('chainError', () => {
        const networkErrorRecovery = (error: string): Result<string> =>
            error.includes('network') ? success('offline mode') : failure(error);

        const parseErrorRecovery = (error: string): Result<number> =>
            error.includes('parse') ? success(0) : failure(`Unrecoverable: ${error}`);

        it('should recover from specific errors', () => {
            const withNetworkFallback = chainError(networkErrorRecovery);
            const result = withNetworkFallback(failure('network timeout'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('offline mode');
            }
        });

        it('should pass through non-recoverable errors', () => {
            const withNetworkFallback = chainError(networkErrorRecovery);
            const result = withNetworkFallback(failure('database error'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('database error');
            }
        });

        it('should pass through successful Results unchanged', () => {
            const withRecovery = chainError(networkErrorRecovery);
            const result = withRecovery(success('original value'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('original value');
            }
        });

        it('should enable error transformation chains', () => {
            const withParseRecovery = chainError(parseErrorRecovery);
            const result = withParseRecovery(failure('parse error occurred'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(0);
            }
        });

        it('should transform unrecoverable errors', () => {
            const withParseRecovery = chainError(parseErrorRecovery);
            const result = withParseRecovery(failure('syntax error'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('Unrecoverable: syntax error');
            }
        });

        it('should maintain type safety', () => {
            const recovery = (error: string): Result<number> =>
                error.includes('recoverable') ? success(999) : failure('not recoverable');

            const withRecovery = chainError(recovery);
            const result = withRecovery(failure('recoverable error'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe(999);
                expect(typeof result.value).toBe('number');
            }
        });
    });
});

describe('Result Elimination', () => {
    describe('fold', () => {
        const handleResult = fold(
            (value: number) => `Success: ${value}`,
            (error: string) => `Error: ${error}`
        );

        it('should handle successful Results', () => {
            const result = handleResult(success(42));
            expect(result).toBe('Success: 42');
        });

        it('should handle failed Results', () => {
            const result = handleResult(failure('something went wrong'));
            expect(result).toBe('Error: something went wrong');
        });

        it('should work with different return types', () => {
            const toLength = fold(
                (value: string) => value.length,
                (error: string) => error.length
            );

            expect(toLength(success('hello'))).toBe(5);
            expect(toLength(failure('error'))).toBe(5);
        });

        it('should enable complex transformations', () => {
            const processResult = fold(
                (value: number) => ({ success: true, data: value * 2 }),
                (error: string) => ({ success: false, message: error.toUpperCase() })
            );

            const successResult = processResult(success(21));
            expect(successResult).toEqual({ success: true, data: 42 });

            const failureResult = processResult(failure('error'));
            expect(failureResult).toEqual({ success: false, message: 'ERROR' });
        });

        it('should maintain type safety', () => {
            const numberProcessor = fold(
                (n: number) => n.toString(),
                (err: string) => `0 (${err})`
            );

            const result1 = numberProcessor(success(123));
            const result2 = numberProcessor(failure('parse error'));

            expect(typeof result1).toBe('string');
            expect(typeof result2).toBe('string');
            expect(result1).toBe('123');
            expect(result2).toBe('0 (parse error)');
        });
    });

    describe('getOrElse', () => {
        it('should return success value when Result is successful', () => {
            const getValueOrZero = getOrElse(0);
            const result = getValueOrZero(success(42));
            expect(result).toBe(42);
        });

        it('should return default value when Result is failure', () => {
            const getValueOrZero = getOrElse(0);
            const result = getValueOrZero(failure('error'));
            expect(result).toBe(0);
        });

        it('should work with different types', () => {
            const getStringOrEmpty = getOrElse('');
            expect(getStringOrEmpty(success('hello'))).toBe('hello');
            expect(getStringOrEmpty(failure('error'))).toBe('');
        });

        it('should work with complex default values', () => {
            const defaultUser = { name: 'Anonymous', id: -1 };
            const getUserOrDefault = getOrElse(defaultUser);

            const user = { name: 'Alice', id: 123 };
            expect(getUserOrDefault(success(user))).toEqual(user);
            expect(getUserOrDefault(failure('user not found'))).toEqual(defaultUser);
        });

        it('should maintain type safety', () => {
            const getNumberOrNaN = getOrElse(NaN);
            const result1 = getNumberOrNaN(success(42));
            const result2 = getNumberOrNaN(failure('not a number'));

            expect(typeof result1).toBe('number');
            expect(typeof result2).toBe('number');
            expect(result1).toBe(42);
            expect(isNaN(result2)).toBe(true);
        });
    });

    describe('getOrElseLazy', () => {
        it('should return success value when Result is successful', () => {
            const getValueOrLength = getOrElseLazy((error: string) => error.length);
            const result = getValueOrLength(success(42));
            expect(result).toBe(42);
        });

        it('should compute default value from error when Result is failure', () => {
            const getValueOrLength = getOrElseLazy((error: string) => error.length);
            const result = getValueOrLength(failure('hello'));
            expect(result).toBe(5);
        });

        it('should enable error-dependent defaults', () => {
            const getValueOrCode = getOrElseLazy((error: string) => {
                if (error.includes('404')) return 404;
                if (error.includes('500')) return 500;
                return 0;
            });

            expect(getValueOrCode(success(404))).toBe(404);
            expect(getValueOrCode(failure('404 not found'))).toBe(404);
            expect(getValueOrCode(failure('500 server error'))).toBe(500);
            expect(getValueOrCode(failure('unknown error'))).toBe(0);
        });

        it('should not compute default for successful Results', () => {
            let computeCount = 0;
            const expensiveDefault = getOrElseLazy(() => {
                computeCount++;
                return 'expensive computation';
            });

            expensiveDefault(success('value'));
            expect(computeCount).toBe(0);

            expensiveDefault(failure('error'));
            expect(computeCount).toBe(1);
        });

        it('should maintain type safety', () => {
            const getStringOrErrorLength = getOrElseLazy((error: string) => `Error length: ${error.length}`);

            const result1 = getStringOrErrorLength(success('success'));
            const result2 = getStringOrErrorLength(failure('fail'));

            expect(typeof result1).toBe('string');
            expect(typeof result2).toBe('string');
            expect(result1).toBe('success');
            expect(result2).toBe('Error length: 4');
        });
    });
});

describe('Alternative Results', () => {
    describe('orElse', () => {
        it('should return original Result when successful', () => {
            const withBackup = orElse(success('backup'));
            const result = withBackup(success('primary'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('primary');
            }
        });

        it('should return alternative Result when original fails', () => {
            const withBackup = orElse(success('backup'));
            const result = withBackup(failure('error'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('backup');
            }
        });

        it('should handle alternative failure', () => {
            const withFailedBackup = orElse(failure('backup failed'));
            const result = withFailedBackup(failure('primary failed'));

            expect(isFailure(result)).toBe(true);
            if (isFailure(result)) {
                expect(result.error).toBe('backup failed');
            }
        });

        it('should chain alternatives', () => {
            const primary = failure('primary failed');
            const backup1 = failure('backup1 failed');
            const backup2 = success('backup2 works');

            const result = orElse(orElse(backup2)(backup1))(primary);

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('backup2 works');
            }
        });

        it('should maintain type safety', () => {
            const numberWithDefault = orElse(success(0));
            const result1 = numberWithDefault(success(42));
            const result2 = numberWithDefault(failure('error'));

            expect(isSuccess(result1)).toBe(true);
            expect(isSuccess(result2)).toBe(true);
            if (isSuccess(result1) && isSuccess(result2)) {
                expect(typeof result1.value).toBe('number');
                expect(typeof result2.value).toBe('number');
                expect(result1.value).toBe(42);
                expect(result2.value).toBe(0);
            }
        });
    });

    describe('orElseLazy', () => {
        it('should return original Result when successful', () => {
            const withLazyBackup = orElseLazy(() => success('backup'));
            const result = withLazyBackup(success('primary'));

            expect(isSuccess(result)).toBe(true);
            if (isSuccess(result)) {
                expect(result.value).toBe('primary');
            }
        });

        it('should compute alternative from error when original fails', () => {
            const withContextualBackup = orElseLazy((error: string) =>
                error.includes('network') ? success('cached data') : failure('permanent error')
            );

            const networkResult = withContextualBackup(failure('network timeout'));
            expect(isSuccess(networkResult)).toBe(true);
            if (isSuccess(networkResult)) {
                expect(networkResult.value).toBe('cached data');
            }

            const otherResult = withContextualBackup(failure('disk error'));
            expect(isFailure(otherResult)).toBe(true);
            if (isFailure(otherResult)) {
                expect(otherResult.error).toBe('permanent error');
            }
        });

        it('should not compute alternative for successful Results', () => {
            let computeCount = 0;
            const withExpensiveBackup = orElseLazy(() => {
                computeCount++;
                return success('expensive backup');
            });

            withExpensiveBackup(success('primary'));
            expect(computeCount).toBe(0);

            withExpensiveBackup(failure('error'));
            expect(computeCount).toBe(1);
        });

        it('should enable complex fallback strategies', () => {
            const withSmartFallback = orElseLazy((error: string) => {
                if (error.includes('temporary')) {
                    return success('retry later');
                } else if (error.includes('auth')) {
                    return failure('authentication required');
                } else {
                    return success('default value');
                }
            });

            const tempResult = withSmartFallback(failure('temporary failure'));
            expect(isSuccess(tempResult)).toBe(true);
            if (isSuccess(tempResult)) {
                expect(tempResult.value).toBe('retry later');
            }

            const authResult = withSmartFallback(failure('auth failed'));
            expect(isFailure(authResult)).toBe(true);
            if (isFailure(authResult)) {
                expect(authResult.error).toBe('authentication required');
            }

            const unknownResult = withSmartFallback(failure('unknown error'));
            expect(isSuccess(unknownResult)).toBe(true);
            if (isSuccess(unknownResult)) {
                expect(unknownResult.value).toBe('default value');
            }
        });

        it('should maintain type safety', () => {
            const withTypedFallback = orElseLazy((error: string) =>
                success(error.length)
            );

            const result1 = withTypedFallback(success(42));
            const result2 = withTypedFallback(failure('test'));

            expect(isSuccess(result1)).toBe(true);
            expect(isSuccess(result2)).toBe(true);
            if (isSuccess(result1) && isSuccess(result2)) {
                expect(typeof result1.value).toBe('number');
                expect(typeof result2.value).toBe('number');
                expect(result1.value).toBe(42);
                expect(result2.value).toBe(4);
            }
        });
    });
});

describe('Integration and Complex Scenarios', () => {
    it('should handle complex error transformation chains', () => {
        const addContext = mapError<string>((err: string) => `API Error: ${err}`);
        const recovery = chainError<string>((err: string) =>
            err.includes('timeout') ? success('fallback data') : failure(err)
        );
        const withDefault = getOrElse('no data');

        const processApiCall = (result: Result<string>) => {
            const contextAdded = addContext(result);
            const recovered = recovery(contextAdded);
            return withDefault(recovered);
        }; expect(processApiCall(success('api data'))).toBe('api data');
        expect(processApiCall(failure('timeout'))).toBe('fallback data');
        expect(processApiCall(failure('server error'))).toBe('no data');
    });

    it('should handle nested error scenarios', () => {
        const primaryFallback = orElseLazy((err: string) =>
            err.includes('network') ? success('cached') : failure('cache miss')
        );
        const secondaryFallback = orElse(success('default'));

        const robustFetch = (result: Result<string>) =>
            secondaryFallback(primaryFallback(result));

        expect(isSuccess(robustFetch(success('live data')))).toBe(true);
        expect(isSuccess(robustFetch(failure('network error')))).toBe(true);
        expect(isSuccess(robustFetch(failure('database error')))).toBe(true);

        const networkResult = robustFetch(failure('network error'));
        if (isSuccess(networkResult)) {
            expect(networkResult.value).toBe('cached');
        }

        const dbResult = robustFetch(failure('database error'));
        if (isSuccess(dbResult)) {
            expect(dbResult.value).toBe('default');
        }
    });

    it('should maintain performance with deep error handling', () => {
        const deepErrorChain = (result: Result<number>) => {
            let processed: Result<number> = result;
            for (let i = 0; i < 100; i++) {
                processed = mapError((err: string) => `${i}: ${err}`)(processed) as Result<number>;
            }
            return processed;
        };

        const startTime = performance.now();
        const result = deepErrorChain(failure('base error'));
        const endTime = performance.now();

        expect(isFailure(result)).toBe(true);
        if (isFailure(result)) {
            expect(result.error).toContain('99: ');
            expect(result.error).toContain('base error');
        }

        // Should complete reasonably quickly (under 50ms)
        expect(endTime - startTime).toBeLessThan(50);
    });
});
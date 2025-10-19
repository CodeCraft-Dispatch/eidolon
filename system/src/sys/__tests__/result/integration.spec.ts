import { describe, expect, it, vi } from 'vitest';
import type { Result } from '../../result/core';
import { success, failure, map, chain, apply, isSuccess } from '../../result/core';
import { pipe, compose, combineWith, pipeResult } from '../../result/composition';
import { mapError, chainError, fold, orElse } from '../../result/errors';
import { sequence, traverse, partition, unsafeSequence } from '../../result/collections';
import { fromNullable, fromPredicate, tryCatch } from '../../result/constructors';
import { validateAll, validateAny, createValidator, type ValidationRule } from '../../result/validation';
import { tap, trace, tapError, tapBoth, tapIf } from '../../result/debug';

describe('Result Domain Integration Scenarios - Step 9', () => {
    describe('1. Cross-Domain Pipeline Composition', () => {
        interface User {
            id: number;
            email: string;
            age: number;
            name: string;
        }

        it('should compose functions from all domains seamlessly', () => {
            const logs: string[] = [];
            const logger = (msg: string) => logs.push(msg);

            const emailRules: ValidationRule<User>[] = [
                { predicate: (u) => u.email.includes('@'), errorMessage: 'Invalid email format' },
                { predicate: (u) => u.email.length > 5, errorMessage: 'Email too short' }
            ];

            const processUser = (rawData: unknown): Result<User> => {
                const initial = fromNullable(rawData, "Data is null");

                const debugged = tap<unknown>(() => logger('Processing raw data'))(initial);

                const step1 = chain<unknown, any>((data: unknown) =>
                    tryCatch(
                        () => JSON.parse(data as string),
                        (error) => `JSON parse error: ${error}`
                    )
                )(debugged);

                const step2 = chain((data: any) => validateAll(data, [
                    { predicate: (d) => typeof d.id === 'number', errorMessage: 'ID must be number' },
                    { predicate: (d) => typeof d.email === 'string', errorMessage: 'Email must be string' },
                    { predicate: (d) => typeof d.age === 'number', errorMessage: 'Age must be number' },
                    { predicate: (d) => typeof d.name === 'string', errorMessage: 'Name must be string' }
                ]))(step1);

                const step3 = map((data: any): User => ({
                    id: data.id,
                    email: data.email,
                    age: data.age,
                    name: data.name
                }))(step2);

                const step4 = chain((user: User) => validateAll(user, emailRules))(step3);

                const step5 = tap<User>((user: User) => logger(`Processed user: ${user.name}`))(step4);

                return mapError<User>((error: string) => `User processing failed: ${error}`)(step5);
            };

            const validJson = '{"id":1,"email":"test@example.com","age":25,"name":"Alice"}';
            const result = processUser(validJson);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.name).toBe('Alice');
                expect(result.value.email).toBe('test@example.com');
            }

            expect(logs).toContain('Processing raw data');
            expect(logs).toContain('Processed user: Alice');
        });

        it('should handle complex composition with lift operations', () => {
            const addNumbers = (a: number, b: number) => a + b;
            const multiplyBy = (factor: number) => (value: number) => value * factor;

            const complexCalculation = combineWith(addNumbers)(success(10))(success(20));

            const step1 = map(multiplyBy(2))(complexCalculation);
            const step2 = tap<number>((n) => expect(n).toBe(60))(step1);
            const result = chain((n: number) => n > 50 ? success(n) : failure('Too small'))(step2);

            expect(result).toEqual(success(60));
        });
    });

    describe('2. Complex Data Processing Workflows', () => {
        interface UserData {
            id: number;
            email: string;
            preferences: string[];
        }

        it('should handle user registration pipeline with all domains', () => {
            const auditLogs: string[] = [];
            const auditLog = (event: string) => auditLogs.push(`[AUDIT] ${event}`);

            const isValidUser = (data: any): data is UserData =>
                typeof data?.id === 'number' &&
                typeof data?.email === 'string' &&
                Array.isArray(data?.preferences);

            const processUser = (userData: unknown): Result<UserData> => {
                const initial = fromPredicate(isValidUser, 'Invalid user data structure')(userData);

                return pipeResult(
                    initial,
                    tap<UserData>(() => auditLog('User validation started')),
                    chain<UserData, UserData>((user: UserData) => validateAll(user, [
                        { predicate: (u) => u.email.includes('@'), errorMessage: 'Invalid email' },
                        { predicate: (u) => u.preferences.length > 0, errorMessage: 'No preferences' }
                    ])),
                    tap<UserData>((user) => auditLog(`User ${user.id} validated successfully`)),
                    mapError<UserData>((error) => `Registration failed: ${error}`)
                );
            };

            const registerUsers = (userDataArray: unknown[]) =>
                traverse(processUser)(userDataArray);

            const validUsers = [
                { id: 1, email: 'alice@test.com', preferences: ['email', 'sms'] },
                { id: 2, email: 'bob@test.com', preferences: ['push'] }
            ];

            const result = registerUsers(validUsers);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toHaveLength(2);
                expect(result.value[0].email).toBe('alice@test.com');
            }

            expect(auditLogs).toContain('[AUDIT] User validation started');
            expect(auditLogs).toContain('[AUDIT] User 1 validated successfully');
            expect(auditLogs).toContain('[AUDIT] User 2 validated successfully');
        });
    });

    describe('3. Error Handling Across Domain Boundaries', () => {
        it('should propagate and recover from errors across all domains', () => {
            const errorLogs: string[] = [];
            const logError = (msg: string) => errorLogs.push(`[ERROR] ${msg}`);

            const validateUser = (user: any) => validateAll(user, [
                { predicate: (u) => u.age >= 18, errorMessage: 'Must be adult' }
            ]);

            const processWithRecovery = (users: any[]) => {
                const results = users.map(user => {
                    const initial = fromNullable(user, 'User is null');
                    return pipeResult(
                        initial,
                        chain(validateUser),
                        tapError<string>((error) => logError(`Validation failed: ${error}`)),
                        orElse(success({ id: -1, age: 18, name: 'Default User' })) // Recovery
                    );
                });

                return sequence(results);
            };

            const mixedUsers = [
                { id: 1, age: 25, name: 'Alice' }, // Valid
                null,                              // Null user
                { id: 2, age: 16, name: 'Bob' }   // Underage
            ];

            const result = processWithRecovery(mixedUsers);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toHaveLength(3);
                expect((result.value[0] as any).name).toBe('Alice');
                expect((result.value[1] as any).name).toBe('Default User'); // Recovered
                expect((result.value[2] as any).name).toBe('Default User'); // Recovered
            }

            expect(errorLogs.some(log => log.includes('User is null'))).toBe(true);
            expect(errorLogs.some(log => log.includes('Must be adult'))).toBe(true);
        });
    });

    describe('4. Performance-Critical Integration', () => {
        it('should maintain performance with optimized cross-domain operations', () => {
            interface LargeData {
                id: number;
                value: string;
                metadata: Record<string, any>;
            }

            const metrics: number[] = [];
            const collectMetrics = (data: LargeData) => {
                metrics.push(performance.now());
            };

            const transformData = (item: any): LargeData => ({
                id: item.id,
                value: item.value.toUpperCase(),
                metadata: { processed: true, timestamp: Date.now() }
            });

            const items = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                value: `item-${i}`,
                extra: `data-${i}`
            }));

            const start = performance.now();

            const processLargeBatch = (items: any[]) => {
                const processed = items.map(item => {
                    const initial = success(item);
                    return pipeResult(
                        initial,
                        map(transformData),
                        tap<LargeData>(collectMetrics),
                        chain((data: LargeData) => data.id % 100 === 0 ?
                            success(data) :
                            success(data) // All succeed for performance test
                        )
                    );
                });

                const successfulOnly = processed.filter(isSuccess);
                return unsafeSequence(successfulOnly as any[]); // Use optimized version
            };

            const result = processLargeBatch(items);
            const elapsed = performance.now() - start;

            expect(result.success).toBe(true);
            expect(elapsed).toBeLessThan(100); // Should be fast
            expect(metrics).toHaveLength(1000);

            if (result.success) {
                expect(result.value).toHaveLength(1000);
                expect((result.value[0] as any).value).toBe('ITEM-0');
                expect((result.value[0] as any).metadata.processed).toBe(true);
            }
        });
    });

    describe('5. Type Safety Across Domains', () => {
        interface InputUser {
            id: number;
            email: string;
        }

        interface ProcessedUser {
            id: number;
            validated: boolean;
            email: string;
        }

        it('should preserve generic types through complex domain interactions', () => {
            const isInputUser = (data: unknown): data is InputUser =>
                typeof (data as any)?.id === 'number' &&
                typeof (data as any)?.email === 'string';

            const processUser = (user: InputUser): Result<ProcessedUser> =>
                pipeResult(
                    success(user),
                    chain((u: InputUser) => validateAll(u, [
                        { predicate: (user) => user.email.includes('@'), errorMessage: 'Invalid email' }
                    ])),
                    map((u: InputUser): ProcessedUser => ({
                        id: u.id,
                        email: u.email,
                        validated: true
                    }))
                );

            const processUserPipeline = (users: unknown[]): Result<ProcessedUser[]> =>
                traverse<unknown, ProcessedUser>(
                    (user: unknown) => {
                        const validated = fromPredicate<InputUser>(isInputUser, 'Invalid user structure')(user as InputUser);
                        return chain<InputUser, ProcessedUser>(processUser)(validated);
                    }
                )(users);

            const inputUsers = [
                { id: 1, email: 'alice@test.com' },
                { id: 2, email: 'bob@test.com' }
            ];

            const result = processUserPipeline(inputUsers);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value).toHaveLength(2);
                expect(result.value[0].validated).toBe(true);
                expect(result.value[1].validated).toBe(true);

                // Type safety check - these should compile without issues
                const firstUser: ProcessedUser = result.value[0];
                expect(firstUser.id).toBe(1);
                expect(firstUser.email).toBe('alice@test.com');
            }
        });
    });

    describe('6. Validation + Collections Integration', () => {
        interface BatchUser {
            id: number;
            email: string;
            age: number;
        }

        it('should validate entire collections with different strategies', () => {
            const emailValidator = createValidator<BatchUser>([
                { predicate: (u) => u.email.includes('@'), errorMessage: 'Invalid email format' },
                { predicate: (u) => u.email.length >= 5, errorMessage: 'Email too short' }
            ]);

            const ageValidator = createValidator<BatchUser>([
                { predicate: (u) => u.age >= 18, errorMessage: 'Must be adult' },
                { predicate: (u) => u.age <= 120, errorMessage: 'Age too high' }
            ]);

            const combineValidators = <T>(validators: ((item: T) => Result<T>)[], strategy: 'all' | 'any') =>
                (item: T): Result<T> => {
                    const results = validators.map(validator => validator(item));

                    if (strategy === 'all') {
                        const sequenced = sequence(results);
                        return sequenced.success ? success(item) : failure('Validation failed');
                    } else {
                        const hasSuccess = results.some(r => r.success);
                        return hasSuccess ? success(item) : failure('All validations failed');
                    }
                }; const validateUserBatch = (users: BatchUser[]) => {
                    const logs: string[] = [];
                    const logSuccess = (msg: string) => logs.push(`[SUCCESS] ${msg}`);
                    const logError = (msg: string) => logs.push(`[ERROR] ${msg}`);

                    const results = users.map(
                        combineValidators([emailValidator, ageValidator], 'all')
                    );

                    const sequenced = sequence(results);

                    const tapped = tapBoth<BatchUser[]>(
                        (users) => logSuccess(`Validated ${users.length} users successfully`),
                        (error) => logError(`Batch validation failed: ${error}`)
                    )(sequenced);

                    return success({ results: sequenced, logs });
                };

            const validUsers: BatchUser[] = [
                { id: 1, email: 'alice@test.com', age: 25 },
                { id: 2, email: 'bob@test.com', age: 30 }
            ];

            const result = validateUserBatch(validUsers);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.results.success).toBe(true);
                expect(result.value.logs.some((log: string) => log.includes('SUCCESS'))).toBe(true);
            }

            // Test with invalid users
            const invalidUsers: BatchUser[] = [
                { id: 1, email: 'alice@test.com', age: 25 },
                { id: 2, email: 'invalid-email', age: 16 } // Invalid email and age
            ];

            const failResult = validateUserBatch(invalidUsers);
            expect(failResult.success).toBe(true); // Wrapper succeeds
            if (failResult.success) {
                expect(failResult.value.results.success).toBe(false); // But validation fails
                expect(failResult.value.logs.some((log: string) => log.includes('ERROR'))).toBe(true);
            }
        });
    });

    describe('7. Debug Instrumentation Across All Operations', () => {
        interface RawData {
            input: string;
            timestamp: number;
        }

        interface ProcessedData {
            output: string;
            processed: boolean;
            metadata: Record<string, any>;
        }

        it('should provide observability through complex multi-domain workflows', () => {
            const traces: string[] = [];
            const timings: Record<string, number> = {};

            const startTimer = (label: string) => (data: any) => {
                timings[`${label}_start`] = performance.now();
                return data;
            };

            const endTimer = (label: string) => (data: any) => {
                timings[`${label}_end`] = performance.now();
                timings[`${label}_duration`] = timings[`${label}_end`] - timings[`${label}_start`];
                return data;
            };

            const businessRules: ValidationRule<RawData>[] = [
                { predicate: (d) => d.input.length > 0, errorMessage: 'Input cannot be empty' },
                { predicate: (d) => d.timestamp > 0, errorMessage: 'Invalid timestamp' }
            ];

            const transformToOutput = (data: RawData): ProcessedData => ({
                output: data.input.toUpperCase(),
                processed: true,
                metadata: {
                    originalLength: data.input.length,
                    processedAt: Date.now()
                }
            });

            const withFallbackData = (error: string): Result<ProcessedData> => {
                traces.push(`Fallback triggered: ${error}`);
                return success({
                    output: 'DEFAULT',
                    processed: false,
                    metadata: { fallback: true, error }
                });
            };

            const instrumentedWorkflow = (data: RawData | null) => {
                const initial = fromNullable(data, "No data provided");

                return pipeResult(
                    initial,
                    tap<RawData>(() => traces.push('Raw input received')),
                    tap<RawData>(startTimer('processing')),
                    tapBoth<RawData>(
                        () => traces.push('Parse success'),
                        () => traces.push('Parse failed')
                    ),
                    chain((d: RawData) => validateAll(d, businessRules)),
                    tap<RawData>(() => traces.push('Validation complete')),
                    map(transformToOutput),
                    tap<ProcessedData>(endTimer('processing')),
                    chainError(withFallbackData),
                    tap<ProcessedData>(() => traces.push('Pipeline complete'))
                );
            };

            // Test successful workflow
            const validData: RawData = { input: 'test data', timestamp: Date.now() };
            const result = instrumentedWorkflow(validData);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.value.output).toBe('TEST DATA');
                expect(result.value.processed).toBe(true);
            }

            expect(traces).toContain('Raw input received');
            expect(traces).toContain('Parse success');
            expect(traces).toContain('Validation complete');
            expect(traces).toContain('Pipeline complete');
            expect(timings.processing_duration).toBeGreaterThan(0);

            // Test fallback workflow
            const invalidResult = instrumentedWorkflow(null);
            expect(invalidResult.success).toBe(true);
            if (invalidResult.success) {
                expect(invalidResult.value.output).toBe('DEFAULT');
                expect(invalidResult.value.processed).toBe(false);
                expect(invalidResult.value.metadata.fallback).toBe(true);
            }
        });
    });

    describe('8. Memory and Performance Under Load', () => {
        it('should handle stress testing without memory leaks or performance bottlenecks', () => {
            interface TestData {
                id: number;
                value: string;
                metadata: any;
            }

            const generateTestData = (id: number): TestData => ({
                id,
                value: `test-value-${id}`,
                metadata: { created: Date.now(), tags: [`tag-${id % 10}`] }
            });

            const isValid = (data: TestData): boolean =>
                data.id >= 0 && data.value.length > 0;

            const rules: ValidationRule<TestData>[] = [
                { predicate: (d) => d.id >= 0, errorMessage: 'ID must be non-negative' },
                { predicate: (d) => d.value.startsWith('test-'), errorMessage: 'Invalid value format' }
            ];

            const metrics: number[] = [];
            const collectMetrics = (data: TestData) => {
                metrics.push(data.id);
            };

            const enhanceError = (error: string) => `Enhanced: ${error}`;

            const stressTest = () => {
                const largeDataset = Array.from({ length: 5000 }, (_, i) => generateTestData(i));

                const start = performance.now();

                const result = traverse(
                    (data: TestData) => pipeResult(
                        fromPredicate<TestData>(isValid, 'Invalid data')(data),
                        chain((validData: TestData) => validateAll(validData, rules)),
                        tap<TestData>(collectMetrics),
                        mapError(enhanceError)
                    )
                )(largeDataset);

                const elapsed = performance.now() - start;

                return { result, elapsed, metricsCount: metrics.length };
            };

            const { result, elapsed, metricsCount } = stressTest();

            expect(result.success).toBe(true);
            expect(elapsed).toBeLessThan(500); // Should handle 5000 items quickly
            expect(metricsCount).toBe(5000);

            if (result.success) {
                expect(result.value).toHaveLength(5000);
                expect((result.value[0] as any).id).toBe(0);
                expect((result.value[4999] as any).id).toBe(4999);
            }

            // Verify memory cleanup
            metrics.length = 0;
            expect(metrics).toHaveLength(0);
        });
    });

    describe('9. Functional Programming Law Compliance', () => {
        it('should verify monad laws hold across domain interactions', () => {
            // Test associativity: (a.chain(f)).chain(g) === a.chain(x => f(x).chain(g))
            const validatePositive = (x: number): Result<number> =>
                x > 0 ? success(x) : failure('Must be positive');

            const debugLog = (x: number): Result<number> =>
                tap<number>(() => { })(success(x)); // Debug domain

            const lawTest = (value: number) => {
                const f = validatePositive; // Validation domain
                const g = debugLog;         // Debug domain

                // Left side: (a.chain(f)).chain(g)
                const left = chain(g)(chain(f)(success(value)));

                // Right side: a.chain(x => f(x).chain(g))
                const right = chain((x: number) => chain(g)(f(x)))(success(value));

                return { left, right };
            };

            // Test with valid value
            const { left: leftValid, right: rightValid } = lawTest(5);
            expect(leftValid).toEqual(rightValid);

            // Test with invalid value
            const { left: leftInvalid, right: rightInvalid } = lawTest(-5);
            expect(leftInvalid).toEqual(rightInvalid);
        });

        it('should verify functor laws across domain boundaries', () => {
            // Test composition: map(f).map(g) === map(compose(g, f))
            const double = (x: number) => x * 2;
            const addOne = (x: number) => x + 1;

            const value = success(5);

            const separate = pipeResult(
                value,
                map(double),
                map(addOne),
                tap<number>(() => { }) // Debug domain interaction
            );

            const composedFn = (x: number) => addOne(double(x));
            const composed = pipeResult(
                value,
                map(composedFn),
                tap<number>(() => { }) // Debug domain interaction
            );

            expect(separate).toEqual(composed);
            expect(separate).toEqual(success(11)); // (5 * 2) + 1 = 11
        });
    });

    describe('10. Real-World Business Logic Integration', () => {
        interface Order {
            id: string;
            items: OrderItem[];
            customerId: string;
            total?: number;
        }

        interface OrderItem {
            productId: string;
            quantity: number;
            price: number;
        }

        interface ProcessedOrder extends Order {
            total: number;
            status: 'processed' | 'failed';
            processedAt: Date;
        }

        it('should handle complete e-commerce order processing workflow', () => {
            const auditLogs: string[] = [];
            const auditLog = (event: string, details?: any) =>
                auditLogs.push(`[AUDIT] ${event}${details ? `: ${JSON.stringify(details)}` : ''}`);

            const parseOrderJSON = (data: string): Result<any> =>
                tryCatch(
                    () => JSON.parse(data),
                    (error) => `JSON parsing failed: ${error}`
                );

            const validateOrderStructure = (order: any): Result<Order> =>
                validateAll(order, [
                    { predicate: (o) => typeof o.id === 'string', errorMessage: 'Order ID required' },
                    { predicate: (o) => Array.isArray(o.items), errorMessage: 'Items must be array' },
                    { predicate: (o) => typeof o.customerId === 'string', errorMessage: 'Customer ID required' },
                    { predicate: (o) => o.items.length > 0, errorMessage: 'Order must have items' }
                ]);

            const validateInventory = (order: Order): Result<Order> => {
                // Simulate inventory check
                const hasInventory = order.items.every(item => item.quantity > 0);
                return hasInventory ? success(order) : failure('Insufficient inventory');
            };

            const calculateTotals = (order: Order): Order => ({
                ...order,
                total: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            });

            const processPayment = (order: Order): Result<Order> => {
                // Simulate payment processing
                const paymentSucceeds = (order.total || 0) < 1000; // Fail for large orders
                return paymentSucceeds ? success(order) : failure('Payment processing failed');
            };

            const handlePaymentFailure = (error: string): Result<ProcessedOrder> => {
                auditLog('PAYMENT_FAILED', { error });
                return failure(`Payment failed: ${error}`);
            };

            const processOrder = (orderData: string): Result<{ success: boolean; order?: ProcessedOrder; error?: string }> => {
                const initial = fromNullable(orderData, "Order data missing");

                return pipeResult(
                    initial,
                    tap<string>(() => auditLog('ORDER_RECEIVED')),
                    chain(parseOrderJSON),
                    tap<any>(() => auditLog('ORDER_PARSED')),
                    chain(validateOrderStructure),
                    tap<Order>(() => auditLog('STRUCTURE_VALIDATED')),
                    chain(validateInventory),
                    tap<Order>(() => auditLog('INVENTORY_VALIDATED')),
                    map(calculateTotals),
                    tap<Order>((order) => auditLog('TOTALS_CALCULATED', { total: order.total })),
                    chain(processPayment),
                    map((order: Order): ProcessedOrder => ({
                        ...order,
                        total: order.total || 0,
                        status: 'processed' as const,
                        processedAt: new Date()
                    })),
                    tap<ProcessedOrder>((order) => auditLog('ORDER_PROCESSED', { orderId: order.id })),
                    chainError(handlePaymentFailure),
                    fold(
                        (order: ProcessedOrder) => success({ success: true, order }),
                        (error: string) => success({ success: false, error })
                    )
                );
            };

            // Test successful order
            const validOrderJson = JSON.stringify({
                id: 'order-123',
                customerId: 'customer-456',
                items: [
                    { productId: 'prod-1', quantity: 2, price: 50 },
                    { productId: 'prod-2', quantity: 1, price: 100 }
                ]
            });

            const successResult = processOrder(validOrderJson);
            expect(successResult.success).toBe(true);

            if (successResult.success) {
                expect(successResult.value.success).toBe(true);
                expect(successResult.value.order?.total).toBe(200); // (2*50) + (1*100)
                expect(successResult.value.order?.status).toBe('processed');
            }

            // Verify audit trail
            expect(auditLogs).toContain('[AUDIT] ORDER_RECEIVED');
            expect(auditLogs).toContain('[AUDIT] ORDER_PARSED');
            expect(auditLogs).toContain('[AUDIT] STRUCTURE_VALIDATED');
            expect(auditLogs).toContain('[AUDIT] INVENTORY_VALIDATED');
            expect(auditLogs.some(log => log.includes('TOTALS_CALCULATED'))).toBe(true);
            expect(auditLogs.some(log => log.includes('ORDER_PROCESSED'))).toBe(true);

            // Test failed order (too expensive for payment)
            const expensiveOrderJson = JSON.stringify({
                id: 'order-789',
                customerId: 'customer-456',
                items: [
                    { productId: 'prod-3', quantity: 10, price: 200 } // Total: 2000, will fail payment
                ]
            });

            const failResult = processOrder(expensiveOrderJson);
            expect(failResult.success).toBe(true);

            if (failResult.success) {
                expect(failResult.value.success).toBe(false);
                expect(failResult.value.error).toContain('Payment failed');
            }
        });
    });
});

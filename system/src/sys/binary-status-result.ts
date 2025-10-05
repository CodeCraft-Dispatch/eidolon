/**
 * Enumeration of all possible outcome statuses in binary operations
 */
export enum BinaryOperationStatus {
  // Success outcome (0)
  SUCCESS = 0,

  // Info outcomes (1-31)
  EMPTY_MEMORY = 1,
  NO_SET_BITS_FOUND = 2,

  // Error outcomes (32-255)
  ADDRESS_OUT_OF_BOUNDS = 32,
  INVALID_BIT_COUNT = 33,
  INVALID_BIT_POSITION = 34,
  INVALID_ADDRESS = 35,
  INVALID_BIT_VALUE = 36,
  CALCULATION_ERROR = 37
}

/**
 * Enumeration of all possible binary status severities in binary operations
 */
export enum BinaryStatusSeverity {
  SUCCESS = 0,
  INFORMATION = 1,
  WARNING = 2,
  ERROR = 3
}

/**
 * Type guard to check if a status represents a successful operation
 */
export const isBinarySuccessStatus = (status: BinaryOperationStatus): boolean => 
  status === BinaryOperationStatus.SUCCESS

/**
 * Type guard to check if a status represents an error
 */
export const isBinaryErrorStatus = (status: BinaryOperationStatus): boolean =>
  status >= 32 && status <= 255

/**
 * Type guard to check if a status represents an info condition
 */
export const isBinaryInfoStatus = (status: BinaryOperationStatus): boolean =>
  status >= 1 && status <= 31

/**
 * Get the severity level of a status (0 = success, 1 = info, 2 = warning, 3 = error)
 */
export const getBinaryStatusSeverity = (status: BinaryOperationStatus): BinaryStatusSeverity => {
  if (isBinarySuccessStatus(status)) return BinaryStatusSeverity.SUCCESS
  if (isBinaryInfoStatus(status)) return BinaryStatusSeverity.INFORMATION
  if (isBinaryErrorStatus(status)) return BinaryStatusSeverity.ERROR
  return BinaryStatusSeverity.WARNING
}

/**
 * Convert status to human-readable name using enum reflection
 */
export const getBinaryStatusName = (status: BinaryOperationStatus): string => {
  const name = BinaryOperationStatus[status]
  return name ?? `UNKNOWN_STATUS_${status}`
}

/**
 * Binary operation result that captures both status and value
 */
export interface BinaryOperationResult<T> {
  readonly status: BinaryOperationStatus
  readonly value?: T
  readonly message?: string
}

/**
 * Constructor for successful binary operation result
 */
export const binarySuccess = <T>(value: T, message?: string): BinaryOperationResult<T> => ({
  status: BinaryOperationStatus.SUCCESS,
  value,
  message
})

/**
 * Constructor for info binary operation result
 */
export const binaryResult = <T>(
  status: BinaryOperationStatus,
  value?: T,
  message?: string
): BinaryOperationResult<T> => {
  return { status, value, message }
}

/**
 * Type guard to check if a binary result is successful
 */
export const isBinarySuccess = <T>(result: BinaryOperationResult<T>): boolean =>
  isBinarySuccessStatus(result.status)

/**
 * Type guard to check if a binary result is an error
 */
export const isBinaryError = <T>(result: BinaryOperationResult<T>): boolean =>
  isBinaryErrorStatus(result.status)

/**
 * Type guard to check if a binary result is info
 */
export const isBinaryInfo = <T>(result: BinaryOperationResult<T>): boolean =>
  isBinaryInfoStatus(result.status)

/**
 * Unwrap binary result value or throw error
 */
export const unwrapBinary = <T>(result: BinaryOperationResult<T>): T | undefined => {
  if (isBinarySuccess(result)) return result.value
  throw new Error(`Binary operation failed: ${getBinaryStatusName(result.status)} - ${result.message ?? 'failure'}`)
}

/**
 * Unwrap binary result value or return default
 */
export const unwrapBinaryOr = <T>(result: BinaryOperationResult<T>, defaultValue: T): T | undefined =>
  isBinarySuccess(result) ? result.value : defaultValue

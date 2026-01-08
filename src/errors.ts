// ============================================
// Sestra SDK - Custom Error Classes
// ============================================

/**
 * Base error class for all Sestra SDK errors
 */
export class SestraError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'SestraError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, SestraError.prototype);
  }
}

/**
 * Error thrown when payment creation fails
 */
export class PaymentCreationError extends SestraError {
  constructor(message: string, statusCode?: number) {
    super(message, 'PAYMENT_CREATION_FAILED', statusCode);
    this.name = 'PaymentCreationError';
    Object.setPrototypeOf(this, PaymentCreationError.prototype);
  }
}

/**
 * Error thrown when payment verification fails
 */
export class PaymentVerificationError extends SestraError {
  public readonly referenceId?: string;

  constructor(message: string, referenceId?: string, statusCode?: number) {
    super(message, 'PAYMENT_VERIFICATION_FAILED', statusCode);
    this.name = 'PaymentVerificationError';
    this.referenceId = referenceId;
    Object.setPrototypeOf(this, PaymentVerificationError.prototype);
  }
}

/**
 * Error thrown when payment is not found
 */
export class PaymentNotFoundError extends SestraError {
  public readonly referenceId: string;

  constructor(referenceId: string) {
    super(`Payment not found: ${referenceId}`, 'PAYMENT_NOT_FOUND', 404);
    this.name = 'PaymentNotFoundError';
    this.referenceId = referenceId;
    Object.setPrototypeOf(this, PaymentNotFoundError.prototype);
  }
}

/**
 * Error thrown when session is invalid or expired
 */
export class SessionError extends SestraError {
  constructor(message: string) {
    super(message, 'SESSION_ERROR', 401);
    this.name = 'SessionError';
    Object.setPrototypeOf(this, SessionError.prototype);
  }
}

/**
 * Error thrown when no active session exists
 */
export class NoSessionError extends SessionError {
  constructor() {
    super('No active session. Call verifyPayment() or simulatePayment() first.');
    this.name = 'NoSessionError';
    Object.setPrototypeOf(this, NoSessionError.prototype);
  }
}

/**
 * Error thrown when session has expired
 */
export class SessionExpiredError extends SessionError {
  constructor() {
    super('Session expired or no calls remaining.');
    this.name = 'SessionExpiredError';
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
  }
}

/**
 * Error thrown when API request fails
 */
export class ApiError extends SestraError {
  public readonly endpoint?: string;
  public readonly response?: unknown;

  constructor(message: string, statusCode?: number, endpoint?: string, response?: unknown) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends SestraError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error thrown when sandbox mode is required but not enabled
 */
export class SandboxModeError extends SestraError {
  constructor(message: string) {
    super(message, 'SANDBOX_MODE_ERROR', 400);
    this.name = 'SandboxModeError';
    Object.setPrototypeOf(this, SandboxModeError.prototype);
  }
}

/**
 * Error thrown when wallet transaction fails
 */
export class WalletTransactionError extends SestraError {
  public readonly txHash?: string;

  constructor(message: string, txHash?: string) {
    super(message, 'WALLET_TRANSACTION_ERROR');
    this.name = 'WalletTransactionError';
    this.txHash = txHash;
    Object.setPrototypeOf(this, WalletTransactionError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends SestraError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Type guard to check if error is a SestraError
 */
export function isSestraError(error: unknown): error is SestraError {
  return error instanceof SestraError;
}

/**
 * Error code constants
 */
export const ErrorCodes = {
  PAYMENT_CREATION_FAILED: 'PAYMENT_CREATION_FAILED',
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  SESSION_ERROR: 'SESSION_ERROR',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SANDBOX_MODE_ERROR: 'SANDBOX_MODE_ERROR',
  WALLET_TRANSACTION_ERROR: 'WALLET_TRANSACTION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

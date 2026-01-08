/**
 * Sestra SDK - Error Classes Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  SestraError,
  PaymentCreationError,
  PaymentVerificationError,
  PaymentNotFoundError,
  SessionError,
  NoSessionError,
  SessionExpiredError,
  ApiError,
  NetworkError,
  SandboxModeError,
  WalletTransactionError,
  ValidationError,
  isSestraError,
  ErrorCodes,
} from '../src/errors.js';

describe('Error Classes', () => {
  describe('SestraError', () => {
    it('should create error with message and code', () => {
      const error = new SestraError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('SestraError');
    });

    it('should include status code when provided', () => {
      const error = new SestraError('Test error', 'TEST_CODE', 500);
      expect(error.statusCode).toBe(500);
    });

    it('should be instance of Error', () => {
      const error = new SestraError('Test', 'TEST');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(SestraError);
    });
  });

  describe('PaymentCreationError', () => {
    it('should create payment creation error', () => {
      const error = new PaymentCreationError('Payment failed');
      expect(error.code).toBe('PAYMENT_CREATION_FAILED');
      expect(error.name).toBe('PaymentCreationError');
    });

    it('should include status code', () => {
      const error = new PaymentCreationError('Payment failed', 400);
      expect(error.statusCode).toBe(400);
    });
  });

  describe('PaymentVerificationError', () => {
    it('should create verification error with reference', () => {
      const error = new PaymentVerificationError('Verification failed', 'ref-123');
      expect(error.code).toBe('PAYMENT_VERIFICATION_FAILED');
      expect(error.referenceId).toBe('ref-123');
    });
  });

  describe('PaymentNotFoundError', () => {
    it('should create not found error', () => {
      const error = new PaymentNotFoundError('ref-123');
      expect(error.message).toContain('ref-123');
      expect(error.referenceId).toBe('ref-123');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('SessionError', () => {
    it('should create session error', () => {
      const error = new SessionError('Session invalid');
      expect(error.code).toBe('SESSION_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('NoSessionError', () => {
    it('should create no session error with default message', () => {
      const error = new NoSessionError();
      expect(error.message).toContain('No active session');
      expect(error.name).toBe('NoSessionError');
    });
  });

  describe('SessionExpiredError', () => {
    it('should create expired session error', () => {
      const error = new SessionExpiredError();
      expect(error.message).toContain('expired');
      expect(error.name).toBe('SessionExpiredError');
    });
  });

  describe('ApiError', () => {
    it('should create API error with endpoint', () => {
      const error = new ApiError('Request failed', 500, '/api/test');
      expect(error.endpoint).toBe('/api/test');
      expect(error.statusCode).toBe(500);
    });

    it('should include response data', () => {
      const response = { error: 'Internal error' };
      const error = new ApiError('Request failed', 500, '/api/test', response);
      expect(error.response).toEqual(response);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const originalError = new Error('Connection refused');
      const error = new NetworkError('Network failed', originalError);
      expect(error.originalError).toBe(originalError);
      expect(error.code).toBe('NETWORK_ERROR');
    });
  });

  describe('SandboxModeError', () => {
    it('should create sandbox mode error', () => {
      const error = new SandboxModeError('Sandbox required');
      expect(error.code).toBe('SANDBOX_MODE_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('WalletTransactionError', () => {
    it('should create wallet error with tx hash', () => {
      const error = new WalletTransactionError('Transaction failed', 'tx-hash-123');
      expect(error.txHash).toBe('tx-hash-123');
      expect(error.code).toBe('WALLET_TRANSACTION_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid input', 'policy_id');
      expect(error.field).toBe('policy_id');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('isSestraError', () => {
    it('should return true for SestraError instances', () => {
      expect(isSestraError(new SestraError('test', 'TEST'))).toBe(true);
      expect(isSestraError(new PaymentCreationError('test'))).toBe(true);
      expect(isSestraError(new NoSessionError())).toBe(true);
    });

    it('should return false for non-SestraError', () => {
      expect(isSestraError(new Error('test'))).toBe(false);
      expect(isSestraError('string error')).toBe(false);
      expect(isSestraError(null)).toBe(false);
      expect(isSestraError(undefined)).toBe(false);
    });
  });

  describe('ErrorCodes', () => {
    it('should have all error codes defined', () => {
      expect(ErrorCodes.PAYMENT_CREATION_FAILED).toBe('PAYMENT_CREATION_FAILED');
      expect(ErrorCodes.PAYMENT_VERIFICATION_FAILED).toBe('PAYMENT_VERIFICATION_FAILED');
      expect(ErrorCodes.PAYMENT_NOT_FOUND).toBe('PAYMENT_NOT_FOUND');
      expect(ErrorCodes.SESSION_ERROR).toBe('SESSION_ERROR');
      expect(ErrorCodes.API_ERROR).toBe('API_ERROR');
      expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCodes.SANDBOX_MODE_ERROR).toBe('SANDBOX_MODE_ERROR');
      expect(ErrorCodes.WALLET_TRANSACTION_ERROR).toBe('WALLET_TRANSACTION_ERROR');
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    });
  });
});

describe('Error Inheritance', () => {
  it('all errors should be catchable as SestraError', () => {
    const errors = [
      new PaymentCreationError('test'),
      new PaymentVerificationError('test'),
      new PaymentNotFoundError('ref'),
      new SessionError('test'),
      new NoSessionError(),
      new SessionExpiredError(),
      new ApiError('test'),
      new NetworkError('test'),
      new SandboxModeError('test'),
      new WalletTransactionError('test'),
      new ValidationError('test'),
    ];

    errors.forEach(error => {
      expect(error).toBeInstanceOf(SestraError);
      expect(error).toBeInstanceOf(Error);
    });
  });
});

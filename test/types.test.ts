/**
 * Sestra SDK - Types Unit Tests
 * Type validation and interface tests
 */

import { describe, it, expect } from 'vitest';
import type {
  SestraConfig,
  PaymentStatus,
  PaymentDetails,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentResponse,
  PaymentStatusResponse,
  CancelPaymentResponse,
  SimulatePaymentRequest,
  SimulatePaymentResponse,
  Session,
  PaymentParams,
  PaymentResult,
  ApiResponse,
  ListPaymentsOptions,
} from '../src/types.js';

describe('Type Definitions', () => {
  describe('SestraConfig', () => {
    it('should accept valid config', () => {
      const config: SestraConfig = {
        sestraBaseUrl: 'https://api.sestra.com',
        serviceBaseUrl: 'https://api.myservice.com',
        solanaRpcEndpoint: 'https://api.mainnet-beta.solana.com',
        sandbox: true,
      };

      expect(config.sestraBaseUrl).toBe('https://api.sestra.com');
      expect(config.sandbox).toBe(true);
    });

    it('should accept minimal config', () => {
      const config: SestraConfig = {};
      expect(config).toBeDefined();
    });

    it('should support legacy baseUrl', () => {
      const config: SestraConfig = {
        baseUrl: 'https://legacy.api.com',
      };
      expect(config.baseUrl).toBe('https://legacy.api.com');
    });
  });

  describe('PaymentStatus', () => {
    it('should accept valid status values', () => {
      const statuses: PaymentStatus[] = ['pending', 'active', 'expired', 'revoked', 'cancelled'];
      expect(statuses).toHaveLength(5);
    });
  });

  describe('PaymentDetails', () => {
    it('should represent complete payment details', () => {
      const details: PaymentDetails = {
        blockchain: 'solana',
        network: 'mainnet-beta',
        recipient_address: 'recipient123',
        platform_address: 'platform456',
        amount_lamports: 1000000000,
        amount_sol: 1.0,
        platform_fee_lamports: 50000000,
        developer_amount_lamports: 950000000,
        reference: 'ref-123',
        expires_in_seconds: 3600,
        program_id: 'program-id',
        use_smart_contract: false,
      };

      expect(details.blockchain).toBe('solana');
      expect(details.network).toBe('mainnet-beta');
      expect(details.amount_sol).toBe(1.0);
    });

    it('should support devnet network', () => {
      const details: PaymentDetails = {
        blockchain: 'solana',
        network: 'devnet',
        recipient_address: 'recipient123',
        platform_address: 'platform456',
        amount_lamports: 1000000000,
        amount_sol: 1.0,
        platform_fee_lamports: 50000000,
        developer_amount_lamports: 950000000,
        reference: 'ref-123',
        expires_in_seconds: 3600,
        program_id: 'program-id',
        use_smart_contract: false,
        is_sandbox: true,
      };

      expect(details.network).toBe('devnet');
      expect(details.is_sandbox).toBe(true);
    });
  });

  describe('CreatePaymentRequest', () => {
    it('should accept minimal request', () => {
      const request: CreatePaymentRequest = {
        policy_id: 'policy-123',
      };
      expect(request.policy_id).toBe('policy-123');
    });

    it('should accept request with metadata', () => {
      const request: CreatePaymentRequest = {
        policy_id: 'policy-123',
        metadata: {
          user_id: 'user-456',
          custom_field: 'custom-value',
        },
      };
      expect(request.metadata?.user_id).toBe('user-456');
    });
  });

  describe('CreatePaymentResponse', () => {
    it('should represent successful response', () => {
      const response: CreatePaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'pending',
        payment_details: {
          blockchain: 'solana',
          network: 'mainnet-beta',
          recipient_address: 'recipient123',
          platform_address: 'platform456',
          amount_lamports: 1000000000,
          amount_sol: 1.0,
          platform_fee_lamports: 50000000,
          developer_amount_lamports: 950000000,
          reference: 'ref-123',
          expires_in_seconds: 3600,
          program_id: 'program-id',
          use_smart_contract: false,
        },
        activation_endpoint: '/api/v1/payments/ref-123/verify',
      };

      expect(response.success).toBe(true);
      expect(response.status).toBe('pending');
    });
  });

  describe('VerifyPaymentResponse', () => {
    it('should represent verified payment', () => {
      const response: VerifyPaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'active',
        token: 'session-token-xyz',
        expires_at: '2024-12-31T23:59:59Z',
        calls_remaining: 100,
      };

      expect(response.token).toBeDefined();
      expect(response.calls_remaining).toBe(100);
    });
  });

  describe('PaymentStatusResponse', () => {
    it('should represent payment status', () => {
      const response: PaymentStatusResponse = {
        reference_id: 'ref-123',
        status: 'active',
        amount_lamports: 1000000000,
        amount_sol: 1.0,
        created_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-02T00:00:00Z',
        activated_at: '2024-01-01T01:00:00Z',
        calls_used: 50,
        calls_remaining: 50,
      };

      expect(response.status).toBe('active');
      expect(response.calls_used).toBe(50);
    });
  });

  describe('CancelPaymentResponse', () => {
    it('should represent cancelled payment', () => {
      const response: CancelPaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'cancelled',
        message: 'Payment cancelled successfully',
      };

      expect(response.status).toBe('cancelled');
      expect(response.message).toContain('cancelled');
    });
  });

  describe('SimulatePaymentRequest', () => {
    it('should accept success flag', () => {
      const request: SimulatePaymentRequest = {
        success: true,
      };
      expect(request.success).toBe(true);
    });

    it('should accept failure simulation', () => {
      const request: SimulatePaymentRequest = {
        success: false,
      };
      expect(request.success).toBe(false);
    });
  });

  describe('SimulatePaymentResponse', () => {
    it('should represent successful simulation', () => {
      const response: SimulatePaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'active',
        is_sandbox: true,
        token: 'simulated-token',
        expires_at: '2024-12-31T23:59:59Z',
        calls_remaining: 100,
        message: 'Payment simulated successfully',
      };

      expect(response.is_sandbox).toBe(true);
      expect(response.token).toBeDefined();
    });

    it('should represent failed simulation', () => {
      const response: SimulatePaymentResponse = {
        success: false,
        reference_id: 'ref-123',
        status: 'pending',
        is_sandbox: true,
        message: 'Simulated payment failure',
      };

      expect(response.success).toBe(false);
      expect(response.token).toBeUndefined();
    });
  });

  describe('Session', () => {
    it('should represent active session', () => {
      const session: Session = {
        token: 'session-token-123',
        reference_id: 'ref-123',
        expires_at: '2024-12-31T23:59:59Z',
        calls_remaining: 100,
      };

      expect(session.token).toBeDefined();
      expect(session.calls_remaining).toBeGreaterThan(0);
    });
  });

  describe('PaymentParams', () => {
    it('should represent wallet payment params', () => {
      const params: PaymentParams = {
        recipientAddress: 'SoLaNaAdDrEsS123',
        amountLamports: 1000000000,
        memo: 'payment-reference',
      };

      expect(params.amountLamports).toBe(1000000000);
      expect(params.memo).toBe('payment-reference');
    });
  });

  describe('PaymentResult', () => {
    it('should represent successful payment', () => {
      const result: PaymentResult = {
        success: true,
        txHash: 'tx-hash-abc123',
      };

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
    });

    it('should represent failed payment', () => {
      const result: PaymentResult = {
        success: false,
        error: 'Insufficient balance',
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('ApiResponse', () => {
    it('should represent successful response', () => {
      const response: ApiResponse<{ id: string }> = {
        data: { id: 'test-123' },
      };

      expect(response.data?.id).toBe('test-123');
      expect(response.error).toBeUndefined();
    });

    it('should represent error response', () => {
      const response: ApiResponse<unknown> = {
        error: 'Something went wrong',
      };

      expect(response.data).toBeUndefined();
      expect(response.error).toBe('Something went wrong');
    });
  });

  describe('ListPaymentsOptions', () => {
    it('should accept filter options', () => {
      const options: ListPaymentsOptions = {
        status: 'active',
        limit: 10,
        offset: 20,
      };

      expect(options.status).toBe('active');
      expect(options.limit).toBe(10);
      expect(options.offset).toBe(20);
    });

    it('should accept empty options', () => {
      const options: ListPaymentsOptions = {};
      expect(options).toBeDefined();
    });
  });
});

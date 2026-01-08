/**
 * Sestra SDK - Client Unit Tests
 * Comprehensive tests for SestraClient functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SestraClient } from '../src/client.js';
import type { CreatePaymentResponse, PaymentStatusResponse, SimulatePaymentResponse } from '../src/types.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SestraClient', () => {
  let client: SestraClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SestraClient({
      sestraBaseUrl: 'https://api.test.com',
      sandbox: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use default URL when no config provided', () => {
      const defaultClient = new SestraClient();
      expect(defaultClient).toBeInstanceOf(SestraClient);
    });

    it('should accept custom sestraBaseUrl', () => {
      const customClient = new SestraClient({
        sestraBaseUrl: 'https://custom.api.com',
      });
      expect(customClient).toBeInstanceOf(SestraClient);
    });

    it('should support legacy baseUrl config', () => {
      const legacyClient = new SestraClient({
        baseUrl: 'https://legacy.api.com',
      });
      expect(legacyClient).toBeInstanceOf(SestraClient);
    });

    it('should enable sandbox mode when configured', () => {
      const sandboxClient = new SestraClient({ sandbox: true });
      expect(sandboxClient).toBeInstanceOf(SestraClient);
    });
  });

  describe('Session Management', () => {
    it('should set and get session', () => {
      const session = {
        token: 'test-token-123',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
      };

      client.setSession(session);
      expect(client.getSession()).toEqual(session);
    });

    it('should clear session', () => {
      const session = {
        token: 'test-token-123',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
      };

      client.setSession(session);
      client.clearSession();
      expect(client.getSession()).toBeUndefined();
    });

    it('should return false for hasActiveSession when no session', () => {
      expect(client.hasActiveSession()).toBe(false);
    });

    it('should return true for hasActiveSession with valid session', () => {
      const session = {
        token: 'test-token-123',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
      };

      client.setSession(session);
      expect(client.hasActiveSession()).toBe(true);
    });

    it('should return false for hasActiveSession when expired', () => {
      const session = {
        token: 'test-token-123',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() - 3600000).toISOString(),
        calls_remaining: 100,
      };

      client.setSession(session);
      expect(client.hasActiveSession()).toBe(false);
    });

    it('should return false for hasActiveSession when no calls remaining', () => {
      const session = {
        token: 'test-token-123',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 0,
      };

      client.setSession(session);
      expect(client.hasActiveSession()).toBe(false);
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const mockResponse: CreatePaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'pending',
        payment_details: {
          blockchain: 'solana',
          network: 'mainnet-beta',
          recipient_address: 'SoLaNaAdDrEsS123',
          platform_address: 'PlAtFoRmAdDrEsS456',
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.createPayment({ policy_id: 'policy-123' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ policy_id: 'policy-123' }),
        })
      );
    });

    it('should use sandbox endpoint when in sandbox mode', async () => {
      const sandboxClient = new SestraClient({
        sestraBaseUrl: 'https://api.test.com',
        sandbox: true,
      });

      const mockResponse: CreatePaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'pending',
        is_sandbox: true,
        payment_details: {
          blockchain: 'solana',
          network: 'devnet',
          recipient_address: 'SoLaNaAdDrEsS123',
          platform_address: 'PlAtFoRmAdDrEsS456',
          amount_lamports: 1000000000,
          amount_sol: 1.0,
          platform_fee_lamports: 50000000,
          developer_amount_lamports: 950000000,
          reference: 'ref-123',
          expires_in_seconds: 3600,
          program_id: 'program-id',
          use_smart_contract: false,
          is_sandbox: true,
        },
        activation_endpoint: '/api/v1/sandbox/payments/ref-123/simulate',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await sandboxClient.createPayment({ policy_id: 'policy-123' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/sandbox/payments',
        expect.any(Object)
      );
    });

    it('should throw error on failed payment creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid policy ID' }),
      });

      await expect(client.createPayment({ policy_id: 'invalid' }))
        .rejects.toThrow('Invalid policy ID');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.createPayment({ policy_id: 'policy-123' }))
        .rejects.toThrow('Network error');
    });
  });

  describe('getPaymentStatus', () => {
    it('should get payment status successfully', async () => {
      const mockResponse: PaymentStatusResponse = {
        reference_id: 'ref-123',
        status: 'pending',
        amount_lamports: 1000000000,
        amount_sol: 1.0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getPaymentStatus('ref-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payments/ref-123',
        expect.any(Object)
      );
    });

    it('should throw error when payment not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Payment not found' }),
      });

      await expect(client.getPaymentStatus('invalid-ref'))
        .rejects.toThrow('Payment not found');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment and set session', async () => {
      const mockResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'active',
        token: 'session-token-xyz',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.verifyPayment('ref-123', 'tx-hash-123');

      expect(result).toEqual(mockResponse);
      expect(client.getSession()).toBeDefined();
      expect(client.getSession()?.token).toBe('session-token-xyz');
    });

    it('should throw error in sandbox mode', async () => {
      const sandboxClient = new SestraClient({ sandbox: true });

      await expect(sandboxClient.verifyPayment('ref-123', 'tx-hash'))
        .rejects.toThrow('Use simulatePayment() for sandbox mode');
    });
  });

  describe('simulatePayment', () => {
    it('should simulate payment successfully in sandbox mode', async () => {
      const sandboxClient = new SestraClient({
        sestraBaseUrl: 'https://api.test.com',
        sandbox: true,
      });

      const mockResponse: SimulatePaymentResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'active',
        is_sandbox: true,
        token: 'simulated-token-xyz',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
        message: 'Payment simulated successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sandboxClient.simulatePayment('ref-123');

      expect(result).toEqual(mockResponse);
      expect(sandboxClient.getSession()).toBeDefined();
    });

    it('should throw error when not in sandbox mode', async () => {
      await expect(client.simulatePayment('ref-123'))
        .rejects.toThrow('simulatePayment() only works in sandbox mode');
    });

    it('should handle failed simulation', async () => {
      const sandboxClient = new SestraClient({
        sestraBaseUrl: 'https://api.test.com',
        sandbox: true,
      });

      const mockResponse: SimulatePaymentResponse = {
        success: false,
        reference_id: 'ref-123',
        status: 'pending',
        is_sandbox: true,
        message: 'Simulated payment failure',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sandboxClient.simulatePayment('ref-123', { success: false });

      expect(result.success).toBe(false);
      expect(sandboxClient.getSession()).toBeUndefined();
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment successfully', async () => {
      const mockResponse = {
        success: true,
        reference_id: 'ref-123',
        status: 'cancelled',
        message: 'Payment cancelled successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.cancelPayment('ref-123');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('listPayments', () => {
    it('should list payments with filters', async () => {
      const mockResponse: PaymentStatusResponse[] = [
        {
          reference_id: 'ref-1',
          status: 'active',
          amount_lamports: 1000000000,
          amount_sol: 1.0,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          reference_id: 'ref-2',
          status: 'pending',
          amount_lamports: 2000000000,
          amount_sol: 2.0,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.listPayments({ status: 'active', limit: 10 });

      expect(result).toEqual(mockResponse);
    });

    it('should return empty array when no payments', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const result = await client.listPayments();

      expect(result).toEqual([]);
    });
  });

  describe('request (protected API)', () => {
    beforeEach(() => {
      const session = {
        token: 'test-token-123',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
      };
      client.setSession(session);
    });

    it('should make authenticated request', async () => {
      const mockResponse = { data: 'protected content' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.request('/api/protected/data');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/protected/data',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-Token': 'test-token-123',
          }),
        })
      );
    });

    it('should decrement calls remaining after request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await client.request('/api/test');

      expect(client.getSession()?.calls_remaining).toBe(99);
    });

    it('should throw error when no session', async () => {
      client.clearSession();

      await expect(client.request('/api/protected'))
        .rejects.toThrow('No active session');
    });

    it('should throw error when session expired', async () => {
      client.setSession({
        token: 'expired-token',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() - 3600000).toISOString(),
        calls_remaining: 100,
      });

      await expect(client.request('/api/protected'))
        .rejects.toThrow('Session expired or no calls remaining');
    });

    it('should use serviceBaseUrl when configured', async () => {
      const clientWithService = new SestraClient({
        sestraBaseUrl: 'https://api.sestra.com',
        serviceBaseUrl: 'https://api.myservice.com',
      });

      clientWithService.setSession({
        token: 'test-token',
        reference_id: 'ref-123',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'service response' }),
      });

      await clientWithService.request('/api/protected');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.myservice.com/api/protected',
        expect.any(Object)
      );
    });
  });
});

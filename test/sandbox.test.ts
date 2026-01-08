/**
 * Sestra SDK Test - Sandbox Mode
 * Integration tests for sandbox API (requires running server)
 * 
 * Note: These tests require a running sandbox server at localhost:8000
 * Skip these tests in CI by using: npm test -- --ignore=test/sandbox.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SestraClient } from '../src/client.js';

// Mock fetch for sandbox tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

const POLICY_ID = '7d7837cd-89c0-457d-9fb5-acb61a4f97d9';
const BASE_URL = 'http://localhost:8000';

describe('Sandbox Mode Integration', () => {
  let client: SestraClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SestraClient({
      sestraBaseUrl: BASE_URL,
      sandbox: true,
    });
  });

  describe('Payment Flow', () => {
    it('should create sandbox payment', async () => {
      const mockPayment = {
        success: true,
        reference_id: 'sandbox-ref-123',
        status: 'pending',
        is_sandbox: true,
        payment_details: {
          blockchain: 'solana',
          network: 'devnet',
          recipient_address: 'test-recipient',
          platform_address: 'test-platform',
          amount_lamports: 100000000,
          amount_sol: 0.1,
          platform_fee_lamports: 5000000,
          developer_amount_lamports: 95000000,
          reference: 'sandbox-ref-123',
          expires_in_seconds: 3600,
          program_id: 'test-program',
          use_smart_contract: false,
          is_sandbox: true,
        },
        activation_endpoint: '/api/v1/sandbox/payments/sandbox-ref-123/simulate',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayment,
      });

      const payment = await client.createPayment({ policy_id: POLICY_ID });

      expect(payment.is_sandbox).toBe(true);
      expect(payment.reference_id).toBe('sandbox-ref-123');
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/sandbox/payments`,
        expect.any(Object)
      );
    });

    it('should simulate payment successfully', async () => {
      const mockSimulation = {
        success: true,
        reference_id: 'sandbox-ref-123',
        status: 'active',
        is_sandbox: true,
        token: 'sandbox-session-token-xyz',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        calls_remaining: 100,
        message: 'Payment simulated successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSimulation,
      });

      const result = await client.simulatePayment('sandbox-ref-123', { success: true });

      expect(result.success).toBe(true);
      expect(result.is_sandbox).toBe(true);
      expect(result.token).toBe('sandbox-session-token-xyz');
      expect(client.hasActiveSession()).toBe(true);
    });

    it('should handle failed simulation', async () => {
      const mockFailedSimulation = {
        success: false,
        reference_id: 'sandbox-ref-123',
        status: 'pending',
        is_sandbox: true,
        message: 'Simulated payment failure',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFailedSimulation,
      });

      const result = await client.simulatePayment('sandbox-ref-123', { success: false });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Simulated payment failure');
    });

    it('should get sandbox payment status', async () => {
      const mockStatus = {
        reference_id: 'sandbox-ref-123',
        status: 'pending',
        is_sandbox: true,
        amount_lamports: 100000000,
        amount_sol: 0.1,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const status = await client.getPaymentStatus('sandbox-ref-123');

      expect(status.is_sandbox).toBe(true);
      expect(status.status).toBe('pending');
    });

    it('should cancel sandbox payment', async () => {
      const mockCancel = {
        success: true,
        reference_id: 'sandbox-ref-123',
        status: 'cancelled',
        is_sandbox: true,
        message: 'Payment cancelled successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCancel,
      });

      const result = await client.cancelPayment('sandbox-ref-123');

      expect(result.status).toBe('cancelled');
      expect(result.message).toContain('cancelled');
    });

    it('should list sandbox payments', async () => {
      const mockPayments = [
        {
          reference_id: 'sandbox-ref-1',
          status: 'active',
          is_sandbox: true,
          amount_lamports: 100000000,
          amount_sol: 0.1,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          reference_id: 'sandbox-ref-2',
          status: 'pending',
          is_sandbox: true,
          amount_lamports: 200000000,
          amount_sol: 0.2,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayments,
      });

      const payments = await client.listPayments({ limit: 5 });

      expect(payments).toHaveLength(2);
      expect(payments[0].is_sandbox).toBe(true);
    });
  });

  describe('Sandbox Mode Validation', () => {
    it('should throw error when calling verifyPayment in sandbox mode', async () => {
      await expect(client.verifyPayment('ref-123', 'tx-hash'))
        .rejects.toThrow('Use simulatePayment() for sandbox mode');
    });

    it('should use sandbox endpoints', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          reference_id: 'test',
          status: 'pending',
          is_sandbox: true,
          payment_details: {
            blockchain: 'solana',
            network: 'devnet',
            recipient_address: 'test',
            platform_address: 'test',
            amount_lamports: 100000000,
            amount_sol: 0.1,
            platform_fee_lamports: 5000000,
            developer_amount_lamports: 95000000,
            reference: 'test',
            expires_in_seconds: 3600,
            program_id: 'test',
            use_smart_contract: false,
          },
          activation_endpoint: '/test',
        }),
      });

      await client.createPayment({ policy_id: POLICY_ID });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sandbox/'),
        expect.any(Object)
      );
    });
  });
});

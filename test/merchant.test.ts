/**
 * Sestra SDK - Merchant API Unit Tests
 * Tests for Merchant API endpoints (policies, transactions, stats, earnings)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SestraClient } from '../src/client.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const BASE_URL = 'https://api.sestralabs.xyz';
const API_KEY = 'sk_test_api_key_12345';

describe('Merchant API', () => {
  let client: SestraClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SestraClient({
      sestraBaseUrl: BASE_URL,
      apiKey: API_KEY,
    });
  });

  describe('getMerchantUser', () => {
    it('should get current merchant user info', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'developer@example.com',
        wallet_address: 'SoL1234567890abcdef',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const user = await client.getMerchantUser();

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('developer@example.com');
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/public/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': API_KEY,
          }),
        })
      );
    });

    it('should throw error if no API key is set', async () => {
      const clientWithoutKey = new SestraClient({ sestraBaseUrl: BASE_URL });

      await expect(clientWithoutKey.getMerchantUser()).rejects.toThrow(
        'API Key is required for Merchant API'
      );
    });
  });

  describe('getMerchantStats', () => {
    it('should get merchant stats', async () => {
      const mockStats = {
        total_payments: 150,
        active_sessions: 25,
        total_revenue_lamports: 5000000000,
        total_revenue_sol: 5.0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const stats = await client.getMerchantStats();

      expect(stats.total_payments).toBe(150);
      expect(stats.active_sessions).toBe(25);
      expect(stats.total_revenue_sol).toBe(5.0);
    });
  });

  describe('listPolicies', () => {
    it('should list all policies', async () => {
      const mockPolicies = [
        {
          id: 'policy-1',
          name: 'Basic API Access',
          endpoint_pattern: '/api/v1/*',
          ttl_seconds: 3600,
          max_calls: 100,
          required_amount_lamports: 10000000,
          is_active: true,
        },
        {
          id: 'policy-2',
          name: 'Premium API Access',
          endpoint_pattern: '/api/v1/premium/*',
          ttl_seconds: 86400,
          max_calls: 1000,
          required_amount_lamports: 100000000,
          is_active: true,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolicies,
      });

      const policies = await client.listPolicies();

      expect(policies).toHaveLength(2);
      expect(policies[0].name).toBe('Basic API Access');
      expect(policies[1].max_calls).toBe(1000);
    });

    it('should return empty array if no policies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const policies = await client.listPolicies();

      expect(policies).toHaveLength(0);
    });
  });

  describe('createPolicy', () => {
    it('should create a new policy', async () => {
      const newPolicy = {
        name: 'New Policy',
        endpoint_pattern: '/api/v1/new/*',
        ttl_seconds: 7200,
        max_calls: 500,
        required_amount_lamports: 50000000,
      };

      const mockResponse = {
        id: 'policy-new',
        ...newPolicy,
        is_active: true,
        created_at: '2024-01-15T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const policy = await client.createPolicy(newPolicy);

      expect(policy.id).toBe('policy-new');
      expect(policy.name).toBe('New Policy');
      expect(policy.is_active).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/public/policies`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPolicy),
        })
      );
    });
  });

  describe('deletePolicy', () => {
    it('should delete a policy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Policy deleted successfully' }),
      });

      await expect(client.deletePolicy('policy-123')).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/public/policies/policy-123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('getTransactions', () => {
    it('should get transactions with default options', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          reference_id: 'ref-123',
          type: 'PAYMENT',
          amount_lamports: 10000000,
          amount_sol: 0.01,
          status: 'confirmed',
          tx_hash: 'solana-tx-hash-123',
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactions,
      });

      const transactions = await client.getTransactions();

      expect(transactions).toHaveLength(1);
      expect(transactions[0].type).toBe('PAYMENT');
    });

    it('should get transactions with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await client.getTransactions({ limit: 10, offset: 5, type: 'PAYMENT' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=5'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=PAYMENT'),
        expect.any(Object)
      );
    });
  });

  describe('getEarnings', () => {
    it('should get earnings with default 7 days', async () => {
      const mockEarnings = {
        period_days: 7,
        total_lamports: 500000000,
        total_sol: 0.5,
        transaction_count: 25,
        daily_breakdown: [
          { date: '2024-01-15', amount_lamports: 100000000, amount_sol: 0.1, count: 5 },
          { date: '2024-01-14', amount_lamports: 80000000, amount_sol: 0.08, count: 4 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEarnings,
      });

      const earnings = await client.getEarnings();

      expect(earnings.period_days).toBe(7);
      expect(earnings.total_sol).toBe(0.5);
      expect(earnings.daily_breakdown).toHaveLength(2);
    });

    it('should get earnings with custom days', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          period_days: 30,
          total_lamports: 2000000000,
          total_sol: 2.0,
          transaction_count: 100,
        }),
      });

      await client.getEarnings(30);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('days=30'),
        expect.any(Object)
      );
    });
  });
});

describe('Session Activation', () => {
  let client: SestraClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SestraClient({ sestraBaseUrl: BASE_URL });
  });

  describe('activateSession', () => {
    it('should activate session with reference_id and tx_hash', async () => {
      const mockSession = {
        id: 'session-123',
        token: 'session-token-xyz',
        status: 'active',
        policy_id: 'policy-456',
        reference_id: 'ref-789',
        calls_used: 0,
        calls_remaining: 100,
        created_at: '2024-01-15T10:00:00Z',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        activated_at: '2024-01-15T10:05:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      const session = await client.activateSession('ref-789', 'solana-tx-hash');

      expect(session.id).toBe('session-123');
      expect(session.token).toBe('session-token-xyz');
      expect(session.status).toBe('active');
      expect(client.hasActiveSession()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/sessions/activate`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            reference_id: 'ref-789',
            tx_hash: 'solana-tx-hash',
          }),
        })
      );
    });

    it('should auto-set session after activation', async () => {
      const mockSession = {
        id: 'session-123',
        token: 'auto-set-token',
        status: 'active',
        policy_id: 'policy-456',
        reference_id: 'ref-auto',
        calls_used: 0,
        calls_remaining: 50,
        created_at: '2024-01-15T10:00:00Z',
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        activated_at: '2024-01-15T10:05:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      });

      await client.activateSession('ref-auto', 'tx-hash');

      const currentSession = client.getSession();
      expect(currentSession?.token).toBe('auto-set-token');
      expect(currentSession?.reference_id).toBe('ref-auto');
      expect(currentSession?.calls_remaining).toBe(50);
    });

    it('should throw error on activation failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid transaction hash' }),
      });

      await expect(client.activateSession('ref-123', 'invalid-tx'))
        .rejects.toThrow('Invalid transaction hash');
    });
  });
});

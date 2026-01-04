// ============================================
// Sestra SDK Client - Payment Gateway
// ============================================

import type {
  SestraConfig,
  Session,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentResponse,
  PaymentStatusResponse,
  CancelPaymentResponse,
  SimulatePaymentRequest,
  SimulatePaymentResponse,
  ListPaymentsOptions,
  ApiResponse,
} from './types.js';

const DEFAULT_CONFIG: Partial<SestraConfig> = {
  baseUrl: 'https://api.sestralabs.xyz',
  sandbox: false,
};

export class SestraClient {
  private config: SestraConfig;
  private sessionToken?: string;
  private currentSession?: Session;

  constructor(config: Partial<SestraConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as SestraConfig;
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Set session token for protected API access
   */
  setSession(session: Session): void {
    this.sessionToken = session.token;
    this.currentSession = session;
  }

  /**
   * Get current session
   */
  getSession(): Session | undefined {
    return this.currentSession;
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.sessionToken = undefined;
    this.currentSession = undefined;
  }

  /**
   * Check if session is active
   */
  hasActiveSession(): boolean {
    if (!this.currentSession) return false;
    const expiresAt = new Date(this.currentSession.expires_at);
    return expiresAt > new Date() && this.currentSession.calls_remaining > 0;
  }

  // ============================================
  // Payment API (Production)
  // ============================================

  /**
   * Create a new payment request
   * Returns payment details including Solana address, amount, and memo
   */
  async createPayment(params: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const endpoint = this.config.sandbox 
      ? '/api/v1/sandbox/payments' 
      : '/api/v1/payments';

    const response = await this.fetch<CreatePaymentResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to create payment');
    }

    return response.data;
  }

  /**
   * Check payment status by reference ID
   */
  async getPaymentStatus(referenceId: string): Promise<PaymentStatusResponse> {
    const endpoint = this.config.sandbox
      ? `/api/v1/sandbox/payments/${referenceId}`
      : `/api/v1/payments/${referenceId}`;

    const response = await this.fetch<PaymentStatusResponse>(endpoint);

    if (!response.data) {
      throw new Error(response.error || 'Payment not found');
    }

    return response.data;
  }

  /**
   * Verify payment with Solana transaction hash
   * Returns session token for API access
   */
  async verifyPayment(referenceId: string, txHash: string): Promise<VerifyPaymentResponse> {
    if (this.config.sandbox) {
      throw new Error('Use simulatePayment() for sandbox mode');
    }

    const response = await this.fetch<VerifyPaymentResponse>(
      `/api/v1/payments/${referenceId}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ tx_hash: txHash }),
      }
    );

    if (!response.data) {
      throw new Error(response.error || 'Payment verification failed');
    }

    // Auto-set session
    this.setSession({
      token: response.data.token,
      reference_id: response.data.reference_id,
      expires_at: response.data.expires_at,
      calls_remaining: response.data.calls_remaining,
    });

    return response.data;
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(referenceId: string): Promise<CancelPaymentResponse> {
    const endpoint = this.config.sandbox
      ? `/api/v1/sandbox/payments/${referenceId}/cancel`
      : `/api/v1/payments/${referenceId}/cancel`;

    const response = await this.fetch<CancelPaymentResponse>(endpoint, {
      method: 'POST',
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to cancel payment');
    }

    return response.data;
  }

  /**
   * List payments with optional filters
   */
  async listPayments(options: ListPaymentsOptions = {}): Promise<PaymentStatusResponse[]> {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const endpoint = this.config.sandbox
      ? `/api/v1/sandbox/payments?${params}`
      : `/api/v1/payments?${params}`;

    const response = await this.fetch<PaymentStatusResponse[]>(endpoint);

    return response.data || [];
  }

  // ============================================
  // Sandbox API (Testing)
  // ============================================

  /**
   * Simulate payment verification (sandbox only)
   * No real Solana transaction required
   */
  async simulatePayment(
    referenceId: string, 
    options: SimulatePaymentRequest = { success: true }
  ): Promise<SimulatePaymentResponse> {
    if (!this.config.sandbox) {
      throw new Error('simulatePayment() only works in sandbox mode. Set sandbox: true in config.');
    }

    const response = await this.fetch<SimulatePaymentResponse>(
      `/api/v1/sandbox/payments/${referenceId}/simulate`,
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );

    if (!response.data) {
      throw new Error(response.error || 'Payment simulation failed');
    }

    // Auto-set session if successful
    if (response.data.success && response.data.token) {
      this.setSession({
        token: response.data.token,
        reference_id: response.data.reference_id,
        expires_at: response.data.expires_at || '',
        calls_remaining: response.data.calls_remaining || 0,
      });
    }

    return response.data;
  }

  // ============================================
  // Protected API Access
  // ============================================

  /**
   * Make authenticated request to protected endpoint
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.sessionToken) {
      throw new Error('No active session. Call verifyPayment() or simulatePayment() first.');
    }

    if (!this.hasActiveSession()) {
      throw new Error('Session expired or no calls remaining.');
    }

    const response = await this.fetch<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'X-Session-Token': this.sessionToken,
      },
    });

    if (!response.data) {
      throw new Error(response.error || 'Request failed');
    }

    // Decrement calls remaining
    if (this.currentSession) {
      this.currentSession.calls_remaining--;
    }

    return response.data;
  }

  // ============================================
  // Internal
  // ============================================

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json() as T & { error?: string; detail?: string };

      if (!response.ok) {
        const errorData = data as { error?: string; detail?: string };
        return { error: errorData.error || errorData.detail || 'Request failed' };
      }

      return { data: data as T };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      return { error: message };
    }
  }
}

export default SestraClient;

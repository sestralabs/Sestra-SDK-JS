// ============================================
// Sestra SDK Types - Payment Gateway
// ============================================

export interface SestraConfig {
  /**
   * Sestra API URL for payments and session issuance
   * @default 'https://api.sestralabs.xyz'
   */
  sestraBaseUrl?: string;
  
  /**
   * Provider's protected API URL (your service)
   * Required for making authenticated requests to protected endpoints
   */
  serviceBaseUrl?: string;
  
  /**
   * @deprecated Use sestraBaseUrl instead
   */
  baseUrl?: string;
  
  solanaRpcEndpoint?: string;
  sandbox?: boolean;
}

// ============================================
// Payment Types
// ============================================

export type PaymentStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'cancelled';

export interface PaymentDetails {
  blockchain: 'solana';
  network: 'mainnet-beta' | 'devnet';
  recipient_address: string;      // Developer wallet (receives 95%)
  platform_address: string;       // Platform wallet (receives 5% fee)
  amount_lamports: number;
  amount_sol: number;
  platform_fee_lamports: number;
  developer_amount_lamports: number;
  reference: string;              // Unique payment reference
  expires_in_seconds: number;
  // Smart contract info
  program_id: string;
  use_smart_contract: boolean;
  is_sandbox?: boolean;
}

export interface CreatePaymentRequest {
  policy_id: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  is_sandbox?: boolean;
  payment_details: PaymentDetails;
  activation_endpoint: string;
  note?: string;
}

export interface VerifyPaymentRequest {
  tx_hash: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  token: string;
  expires_at: string;
  calls_remaining: number;
}

export interface PaymentStatusResponse {
  reference_id: string;
  status: PaymentStatus;
  is_sandbox?: boolean;
  amount_lamports: number;
  amount_sol: number;
  created_at: string;
  expires_at: string;
  activated_at?: string;
  calls_used?: number;
  calls_remaining?: number;
}

export interface CancelPaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  is_sandbox?: boolean;
  message: string;
}

// ============================================
// Sandbox Types
// ============================================

export interface SimulatePaymentRequest {
  success?: boolean;
}

export interface SimulatePaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  is_sandbox: boolean;
  token?: string;
  expires_at?: string;
  calls_remaining?: number;
  message: string;
}

// ============================================
// Session Types (for protected API access)
// ============================================

export interface Session {
  token: string;
  reference_id: string;
  expires_at: string;
  calls_remaining: number;
}

// ============================================
// Wallet Types
// ============================================

export interface PaymentParams {
  recipientAddress: string;
  amountLamports: number;
  memo: string;
}

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ListPaymentsOptions {
  status?: PaymentStatus;
  limit?: number;
  offset?: number;
}

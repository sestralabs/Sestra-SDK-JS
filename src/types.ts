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
  
  /**
   * Solana RPC endpoint
   * @default 'https://api.mainnet-beta.solana.com'
   */
  solanaRpcEndpoint?: string;
  
  /**
   * Enable sandbox mode for testing
   */
  sandbox?: boolean;
  
  /**
   * API Key for Merchant API access
   */
  apiKey?: string;
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
}

export interface SandboxPaymentDetails {
  blockchain: 'solana';
  network: 'devnet';
  recipient_address: string;
  amount_lamports: number;
  amount_sol: number;
  memo: string;
  expires_in_seconds: number;
  is_sandbox: boolean;
}

export interface CreatePaymentRequest {
  policy_id: string;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  payment_details: PaymentDetails;
  activation_endpoint: string;
}

export interface SandboxCreatePaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  is_sandbox: boolean;
  payment_details: SandboxPaymentDetails;
  activation_endpoint: string;
  note: string;
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

export interface SandboxPaymentStatusResponse {
  reference_id: string;
  status: PaymentStatus;
  is_sandbox: boolean;
  amount_lamports: number;
  amount_sol: number;
  created_at: string;
  expires_at: string;
  activated_at?: string;
  calls_used?: number;
  calls_remaining?: number;
}

export interface SandboxCancelPaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  is_sandbox: boolean;
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

// ============================================
// Session Activation Types
// ============================================

export interface SessionActivateRequest {
  reference_id: string;
  tx_hash: string;
}

export interface SessionActivateResponse {
  id: string;
  token: string;
  status: string;
  policy_id: string;
  reference_id: string;
  calls_used: number;
  calls_remaining: number;
  created_at: string;
  expires_at: string;
  activated_at?: string;
}

// ============================================
// Merchant API Types (requires API Key)
// ============================================

export interface Policy {
  id: string;
  name: string;
  endpoint_pattern: string;
  ttl_seconds: number;
  max_calls: number;
  required_amount_lamports: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePolicyRequest {
  name: string;
  endpoint_pattern: string;
  ttl_seconds: number;
  max_calls: number;
  required_amount_lamports: number;
}

export interface MerchantUser {
  id: string;
  email: string;
  wallet_address?: string;
  created_at: string;
}

export interface MerchantStats {
  total_payments: number;
  active_sessions: number;
  total_revenue_lamports: number;
  total_revenue_sol: number;
}

export interface Transaction {
  id: string;
  reference_id: string;
  type: 'PAYMENT' | 'REFUND';
  amount_lamports: number;
  amount_sol: number;
  status: string;
  tx_hash?: string;
  created_at: string;
}

export interface Earnings {
  period_days: number;
  total_lamports: number;
  total_sol: number;
  transaction_count: number;
  daily_breakdown?: Array<{
    date: string;
    amount_lamports: number;
    amount_sol: number;
    count: number;
  }>;
}

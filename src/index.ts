// ============================================
// Sestra SDK - Payment Gateway for Solana
// ============================================

export { SestraClient } from './client.js';
export { SestraWallet } from './wallet.js';

// Error Classes
export {
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
} from './errors.js';
export type { ErrorCode } from './errors.js';

// Types
export type {
  // Config
  SestraConfig,
  
  // Payment Types
  PaymentStatus,
  PaymentDetails,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentResponse,
  PaymentStatusResponse,
  CancelPaymentResponse,
  ListPaymentsOptions,
  
  // Sandbox Types
  SimulatePaymentRequest,
  SimulatePaymentResponse,
  
  // Session Types
  Session,
  
  // Wallet Types
  PaymentParams,
  PaymentResult,
  
  // API Types
  ApiResponse,
} from './types.js';

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive unit test suite for client, wallet, and types
- ESLint configuration for code quality
- GitHub Actions CI/CD workflows
- Security policy documentation
- Code of conduct

## [0.1.0] - 2024-01-08

### Added
- Initial release of Sestra SDK
- `SestraClient` class for payment gateway integration
  - `createPayment()` - Create new payment requests
  - `getPaymentStatus()` - Check payment status by reference ID
  - `verifyPayment()` - Verify payment with Solana transaction hash
  - `simulatePayment()` - Simulate payments in sandbox mode
  - `cancelPayment()` - Cancel pending payments
  - `listPayments()` - List payments with filters
  - `request()` - Make authenticated requests to protected APIs
- `SestraWallet` class for Solana payment transactions
  - `createPaymentTransaction()` - Create payment transaction for signing
  - `createPaymentFromDetails()` - Create transaction from payment details
  - `sendPayment()` - Send payment with keypair (server-side)
  - `getBalance()` - Get wallet balance in lamports
  - `getBalanceSOL()` - Get wallet balance in SOL
  - `waitForConfirmation()` - Wait for transaction confirmation
  - `isTransactionConfirmed()` - Check transaction confirmation status
- Session management with automatic token handling
- Sandbox mode for testing without real transactions
- Full TypeScript support with comprehensive type definitions
- Support for both ESM and CommonJS modules

### Security
- Secure session token handling
- Input validation for all API parameters
- No hardcoded credentials or sensitive data

[Unreleased]: https://github.com/sestralabs/Sestra-SDK-JS/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sestralabs/Sestra-SDK-JS/releases/tag/v0.1.0

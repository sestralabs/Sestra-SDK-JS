# @sestra/sdk

[![npm version](https://img.shields.io/npm/v/@sestra/sdk.svg)](https://www.npmjs.com/package/@sestra/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![CI](https://github.com/sestralabs/Sestra-SDK-JS/actions/workflows/ci.yml/badge.svg)](https://github.com/sestralabs/Sestra-SDK-JS/actions/workflows/ci.yml)

**Sestra SDK** - The official JavaScript/TypeScript SDK for the Sestra Payment Gateway. Enable pay-per-request API monetization using Solana blockchain payments.

## Features

- 🚀 **Simple Integration** - Get started in minutes with intuitive APIs
- 💰 **Solana Payments** - Accept SOL payments with automatic verification
- 🧪 **Sandbox Mode** - Test without real transactions
- 🔐 **Session Management** - Automatic session handling and token refresh
- 📊 **Merchant API** - Manage policies, view transactions, track earnings
- 🌐 **Browser & Node.js** - Works in any JavaScript environment
- 📝 **TypeScript** - Full type definitions included
- ⚡ **Wallet Integration** - Compatible with Phantom, Solflare, and more

## Installation

```bash
npm install @sestra/sdk @solana/web3.js
```

## Quick Start

### Sandbox Mode (Testing)

```typescript
import { SestraClient } from '@sestra/sdk';

// Initialize client in sandbox mode
const client = new SestraClient({
  sestraBaseUrl: 'https://api.sestralabs.xyz',
  serviceBaseUrl: 'https://api.your-service.com', // Your protected API
  sandbox: true, // Enable sandbox mode
});

async function testPayment() {
  // 1. Create a payment request
  const payment = await client.createPayment({
    policy_id: 'your-policy-id',
  });
  
  console.log('Payment created:', payment.reference_id);
  console.log('Amount:', payment.payment_details.amount_sol, 'SOL');
  
  // 2. Simulate payment (no real Solana transaction needed)
  const result = await client.simulatePayment(payment.reference_id);
  
  console.log('Session token:', result.token);
  console.log('Calls remaining:', result.calls_remaining);
  
  // 3. Access protected API
  const data = await client.request('/api/protected/example');
  console.log('Response:', data);
}
```

### Production Mode (Real Payments)

```typescript
import { SestraClient, SestraWallet } from '@sestra/sdk';
import { PublicKey } from '@solana/web3.js';

// Initialize client in production mode
const client = new SestraClient({
  sestraBaseUrl: 'https://api.sestralabs.xyz',
  serviceBaseUrl: 'https://api.your-service.com', // Your protected API
  sandbox: false,
});

const wallet = new SestraWallet('https://api.mainnet-beta.solana.com');

async function payAndAccess() {
  // 1. Create a payment request
  const payment = await client.createPayment({
    policy_id: 'your-policy-id',
  });
  
  console.log('Pay to:', payment.payment_details.recipient_address);
  console.log('Amount:', payment.payment_details.amount_sol, 'SOL');
  console.log('Memo:', payment.payment_details.memo);
  
  // 2. Create transaction for user to sign
  const payerPublicKey = new PublicKey('user-wallet-address');
  const transaction = await wallet.createPaymentFromDetails(
    payerPublicKey,
    payment.payment_details
  );
  
  // 3. User signs and sends transaction (via Phantom, Solflare, etc.)
  // const signedTx = await walletAdapter.signTransaction(transaction);
  // const txHash = await connection.sendRawTransaction(signedTx.serialize());
  
  // 4. Verify payment with transaction hash
  const txHash = '5abc...'; // From wallet
  const session = await client.verifyPayment(payment.reference_id, txHash);
  
  console.log('Session token:', session.token);
  
  // 5. Access protected API
  const data = await client.request('/api/protected/example');
  console.log('Response:', data);
}
```

## API Reference

### SestraClient

```typescript
const client = new SestraClient({
  // Sestra API URL for payments and session issuance
  sestraBaseUrl: 'https://api.sestralabs.xyz',
  
  // Provider's protected API URL (your service)
  serviceBaseUrl: 'https://api.your-service.com',
  
  // Enable sandbox mode for testing
  sandbox: false,
});
```

#### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `sestraBaseUrl` | Sestra API URL for payments/sessions | `https://api.sestralabs.xyz` |
| `serviceBaseUrl` | Provider's protected API URL | Same as `sestraBaseUrl` |
| `sandbox` | Enable sandbox mode for testing | `false` |

#### Payment Methods

| Method | Description |
|--------|-------------|
| `createPayment(params)` | Create a new payment request |
| `getPaymentStatus(referenceId)` | Check payment status |
| `verifyPayment(referenceId, txHash)` | Verify payment (production) |
| `simulatePayment(referenceId, options)` | Simulate payment (sandbox) |
| `cancelPayment(referenceId)` | Cancel pending payment |
| `listPayments(options)` | List payments with filters |

#### Session Methods

| Method | Description |
|--------|-------------|
| `setSession(session)` | Set session manually |
| `getSession()` | Get current session |
| `clearSession()` | Clear current session |
| `hasActiveSession()` | Check if session is active |

#### Protected API Access

```typescript
// After verifyPayment() or simulatePayment()
const data = await client.request('/api/protected/endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
});
```

### SestraWallet

Helper class for creating Solana payment transactions.

```typescript
const wallet = new SestraWallet('https://api.mainnet-beta.solana.com');

// Create transaction from payment details
const tx = await wallet.createPaymentFromDetails(payerPublicKey, paymentDetails);

// Check balance
const balance = await wallet.getBalanceSOL('wallet-address');

// Wait for confirmation
const confirmed = await wallet.waitForConfirmation(txHash);
```

## Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. createPayment({ policy_id })                             │
│    → Returns: reference_id, payment_details                 │
├─────────────────────────────────────────────────────────────┤
│ 2. User pays SOL to recipient_address with memo             │
│    (or simulatePayment() in sandbox mode)                   │
├─────────────────────────────────────────────────────────────┤
│ 3. verifyPayment(reference_id, tx_hash)                     │
│    → Returns: session token                                 │
├─────────────────────────────────────────────────────────────┤
│ 4. client.request('/api/protected/...')                     │
│    → Access API until token expires or calls exhausted      │
└─────────────────────────────────────────────────────────────┘
```

## Browser Usage with Phantom/Solflare

```typescript
import { SestraClient, SestraWallet } from '@sestra/sdk';

const client = new SestraClient({
  sestraBaseUrl: 'https://api.sestralabs.xyz',
  serviceBaseUrl: 'https://api.your-service.com',
});
const wallet = new SestraWallet();

// Get payment details
const payment = await client.createPayment({ policy_id: 'xxx' });

// Create transaction
const tx = await wallet.createPaymentFromDetails(
  window.solana.publicKey,
  payment.payment_details
);

// Sign with Phantom
const signedTx = await window.solana.signTransaction(tx);
const txHash = await connection.sendRawTransaction(signedTx.serialize());

// Verify payment
await client.verifyPayment(payment.reference_id, txHash);

// Now make authenticated requests
const data = await client.request('/api/protected/data');
```

## Types

```typescript
interface CreatePaymentResponse {
  success: boolean;
  reference_id: string;
  status: PaymentStatus;
  payment_details: {
    blockchain: 'solana';
    network: 'mainnet-beta' | 'devnet';
    recipient_address: string;
    amount_lamports: number;
    amount_sol: number;
    memo: string;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  token: string;
  expires_at: string;
  calls_remaining: number;
}

type PaymentStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'cancelled';
```

## Documentation

- [API Reference](./API.md) - Complete API documentation
- [Examples](./examples/) - Code examples for common use cases
- [Contributing](./CONTRIBUTING.md) - How to contribute
- [Changelog](./CHANGELOG.md) - Version history

## Support

- 📖 [Documentation](https://docs.sestralabs.xyz)
- 💬 [Discord](https://discord.gg/sestralabs)
- 🐛 [Issues](https://github.com/sestralabs/Sestra-SDK-JS/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.

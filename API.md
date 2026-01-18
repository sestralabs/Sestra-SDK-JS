# Sestra SDK API Reference

Complete API documentation for the Sestra JavaScript/TypeScript SDK.

## Table of Contents

- [SestraClient](#sestraclient)
  - [Constructor](#constructor)
  - [Session Management](#session-management)
  - [Payment API](#payment-api)
  - [Sandbox API](#sandbox-api)
  - [Merchant API](#merchant-api)
  - [Protected API Access](#protected-api-access)
- [SestraWallet](#sestrawallet)
  - [Transaction Creation](#transaction-creation)
  - [Payment Sending](#payment-sending)
  - [Utility Methods](#utility-methods)
- [Types](#types)
- [Error Handling](#error-handling)

---

## SestraClient

The main client for interacting with the Sestra Payment Gateway API.

### Constructor

```typescript
import { SestraClient } from '@sestra/sdk';

const client = new SestraClient(config?: SestraConfig);
```

#### SestraConfig Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sestraBaseUrl` | `string` | `'https://api.sestralabs.xyz'` | Sestra API base URL |
| `serviceBaseUrl` | `string` | - | Your protected service URL |
| `solanaRpcEndpoint` | `string` | `'https://api.mainnet-beta.solana.com'` | Solana RPC endpoint |
| `sandbox` | `boolean` | `false` | Enable sandbox mode for testing |
| `apiKey` | `string` | - | API Key for Merchant API access |

#### Example

```typescript
// Production client
const client = new SestraClient({
  serviceBaseUrl: 'https://api.yourservice.com',
});

// Sandbox client for testing
const sandboxClient = new SestraClient({
  sandbox: true,
});

// Merchant API client
const merchantClient = new SestraClient({
  apiKey: 'sk_live_your_api_key',
});
```

---

### Session Management

#### setSession(session: Session)

Set the session token for authenticated requests.

```typescript
client.setSession({
  token: 'session-token-xyz',
  reference_id: 'ref-123',
  expires_at: '2024-01-15T12:00:00Z',
  calls_remaining: 100,
});
```

#### getSession(): Session | undefined

Get the current session.

```typescript
const session = client.getSession();
if (session) {
  console.log(`Calls remaining: ${session.calls_remaining}`);
}
```

#### hasActiveSession(): boolean

Check if there's an active (non-expired) session.

```typescript
if (client.hasActiveSession()) {
  // Make authenticated requests
}
```

#### clearSession()

Clear the current session.

```typescript
client.clearSession();
```

---

### Payment API

#### createPayment(params: CreatePaymentRequest)

Create a new payment request.

```typescript
const payment = await client.createPayment({
  policy_id: 'policy-uuid-here',
  metadata: { user_id: '123' }, // optional
});

console.log(payment.reference_id);
console.log(payment.payment_details.amount_sol);
console.log(payment.payment_details.recipient_address);
```

**Returns:** `CreatePaymentResponse` (production) or `SandboxCreatePaymentResponse` (sandbox)

#### getPaymentStatus(referenceId: string)

Check the status of a payment.

```typescript
const status = await client.getPaymentStatus('ref-123');
console.log(status.status); // 'pending' | 'active' | 'expired' | 'cancelled'
```

#### verifyPayment(referenceId: string, txHash: string)

Verify a payment with the Solana transaction hash. This also activates the session.

```typescript
const result = await client.verifyPayment('ref-123', 'solana-tx-hash');

if (result.success) {
  console.log(`Session token: ${result.token}`);
  console.log(`Calls remaining: ${result.calls_remaining}`);
}
```

#### cancelPayment(referenceId: string)

Cancel a pending payment.

```typescript
const result = await client.cancelPayment('ref-123');
console.log(result.message);
```

#### listPayments(options?: ListPaymentsOptions)

List payments with optional filters.

```typescript
const payments = await client.listPayments({
  status: 'active',
  limit: 10,
  offset: 0,
});
```

---

### Sandbox API

#### simulatePayment(referenceId: string, options?: SimulatePaymentRequest)

Simulate payment verification in sandbox mode (no real Solana transaction needed).

```typescript
const sandboxClient = new SestraClient({ sandbox: true });

// Create payment
const payment = await sandboxClient.createPayment({ policy_id: 'policy-123' });

// Simulate successful payment
const result = await sandboxClient.simulatePayment(payment.reference_id, {
  success: true,
});

// Session is automatically activated
console.log(result.token);
```

---

### Merchant API

These methods require an API key.

#### getMerchantUser()

Get the current merchant user info.

```typescript
const user = await client.getMerchantUser();
console.log(user.email);
console.log(user.wallet_address);
```

#### getMerchantStats()

Get merchant statistics.

```typescript
const stats = await client.getMerchantStats();
console.log(`Total payments: ${stats.total_payments}`);
console.log(`Active sessions: ${stats.active_sessions}`);
console.log(`Revenue: ${stats.total_revenue_sol} SOL`);
```

#### listPolicies()

List all policies.

```typescript
const policies = await client.listPolicies();
policies.forEach(policy => {
  console.log(`${policy.name}: ${policy.required_amount_lamports} lamports`);
});
```

#### createPolicy(params: CreatePolicyRequest)

Create a new policy.

```typescript
const policy = await client.createPolicy({
  name: 'Basic API Access',
  endpoint_pattern: '/api/v1/*',
  ttl_seconds: 3600,
  max_calls: 100,
  required_amount_lamports: 10000000, // 0.01 SOL
});
```

#### deletePolicy(policyId: string)

Delete a policy.

```typescript
await client.deletePolicy('policy-uuid');
```

#### getTransactions(options?)

Get merchant transactions.

```typescript
const transactions = await client.getTransactions({
  limit: 50,
  offset: 0,
  type: 'PAYMENT', // or 'REFUND'
});
```

#### getEarnings(days?: number)

Get earnings for the specified period (default: 7 days).

```typescript
const earnings = await client.getEarnings(30);
console.log(`30-day earnings: ${earnings.total_sol} SOL`);
console.log(`Transaction count: ${earnings.transaction_count}`);
```

---

### Protected API Access

#### request<T>(endpoint: string, options?: RequestInit)

Make authenticated requests to your protected service.

```typescript
// After payment verification, session is set automatically
const data = await client.request<MyApiResponse>('/api/v1/protected-resource', {
  method: 'GET',
});
```

#### activateSession(referenceId: string, txHash: string)

Alternative method to activate a session directly.

```typescript
const session = await client.activateSession('ref-123', 'solana-tx-hash');
console.log(session.token);
console.log(session.calls_remaining);
```

---

## SestraWallet

Helper class for creating and sending Solana payment transactions.

### Constructor

```typescript
import { SestraWallet } from '@sestra/sdk';

const wallet = new SestraWallet(rpcEndpoint?: string);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rpcEndpoint` | `string` | `'https://api.mainnet-beta.solana.com'` | Solana RPC endpoint |

---

### Transaction Creation

#### createPaymentFromDetails(payerPublicKey, paymentDetails)

Create a transaction from payment details returned by the API.

```typescript
import { PublicKey } from '@solana/web3.js';

const payment = await client.createPayment({ policy_id: 'policy-123' });

const transaction = await wallet.createPaymentFromDetails(
  new PublicKey('payer-wallet-address'),
  payment.payment_details
);

// Sign with wallet adapter (Phantom, Solflare, etc.)
const signedTx = await walletAdapter.signTransaction(transaction);
```

#### createPaymentTransaction(payerPublicKey, params)

Create a payment transaction manually.

```typescript
const transaction = await wallet.createPaymentTransaction(
  payerPublicKey,
  {
    recipientAddress: 'recipient-wallet-address',
    amountLamports: 10000000, // 0.01 SOL
    memo: 'payment-reference-id',
  }
);
```

---

### Payment Sending

#### sendPayment(keypair, params)

Send a payment transaction (server-side with keypair).

```typescript
import { Keypair } from '@solana/web3.js';

const keypair = Keypair.fromSecretKey(secretKeyArray);

const result = await wallet.sendPayment(keypair, {
  recipientAddress: 'recipient-address',
  amountLamports: 10000000,
  memo: 'ref-123',
});

if (result.success) {
  console.log(`Transaction: ${result.txHash}`);
}
```

#### sendPaymentFromDetails(keypair, paymentDetails)

Send a payment using API payment details.

```typescript
const result = await wallet.sendPaymentFromDetails(keypair, payment.payment_details);
```

---

### Utility Methods

#### getNetwork()

Get the current network.

```typescript
const network = wallet.getNetwork(); // 'mainnet-beta' or 'devnet'
```

#### getBalance(address)

Get wallet balance in lamports.

```typescript
const lamports = await wallet.getBalance('wallet-address');
```

#### getBalanceSOL(address)

Get wallet balance in SOL.

```typescript
const sol = await wallet.getBalanceSOL('wallet-address');
console.log(`Balance: ${sol} SOL`);
```

#### waitForConfirmation(txHash, timeout?)

Wait for transaction confirmation.

```typescript
const confirmed = await wallet.waitForConfirmation('tx-hash', 30000);
```

#### isTransactionConfirmed(txHash)

Check if a transaction is confirmed.

```typescript
const isConfirmed = await wallet.isTransactionConfirmed('tx-hash');
```

---

## Types

### Payment Types

```typescript
type PaymentStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'cancelled';

interface PaymentDetails {
  blockchain: 'solana';
  network: 'mainnet-beta' | 'devnet';
  recipient_address: string;
  platform_address: string;
  amount_lamports: number;
  amount_sol: number;
  platform_fee_lamports: number;
  developer_amount_lamports: number;
  reference: string;
  expires_in_seconds: number;
  program_id: string;
  use_smart_contract: boolean;
}

interface SandboxPaymentDetails {
  blockchain: 'solana';
  network: 'devnet';
  recipient_address: string;
  amount_lamports: number;
  amount_sol: number;
  memo: string;
  expires_in_seconds: number;
  is_sandbox: boolean;
}
```

### Session Types

```typescript
interface Session {
  token: string;
  reference_id: string;
  expires_at: string;
  calls_remaining: number;
}

interface SessionActivateResponse {
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
```

### Merchant Types

```typescript
interface Policy {
  id: string;
  name: string;
  endpoint_pattern: string;
  ttl_seconds: number;
  max_calls: number;
  required_amount_lamports: number;
  is_active: boolean;
}

interface MerchantStats {
  total_payments: number;
  active_sessions: number;
  total_revenue_lamports: number;
  total_revenue_sol: number;
}

interface Earnings {
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
```

---

## Error Handling

The SDK provides custom error classes for better error handling.

```typescript
import {
  SestraError,
  PaymentCreationError,
  PaymentVerificationError,
  SessionError,
  ApiError,
  NetworkError,
  ValidationError,
  isSestraError,
  ErrorCodes,
} from '@sestra/sdk';

try {
  await client.createPayment({ policy_id: 'invalid' });
} catch (error) {
  if (isSestraError(error)) {
    console.log(`Error code: ${error.code}`);
    console.log(`Message: ${error.message}`);
    
    if (error instanceof PaymentCreationError) {
      // Handle payment creation error
    }
  }
}
```

### Error Classes

| Class | Code | Description |
|-------|------|-------------|
| `SestraError` | - | Base error class |
| `PaymentCreationError` | `PAYMENT_CREATION_FAILED` | Failed to create payment |
| `PaymentVerificationError` | `PAYMENT_VERIFICATION_FAILED` | Failed to verify payment |
| `PaymentNotFoundError` | `PAYMENT_NOT_FOUND` | Payment not found |
| `SessionError` | `SESSION_ERROR` | General session error |
| `NoSessionError` | `NO_SESSION` | No active session |
| `SessionExpiredError` | `SESSION_EXPIRED` | Session has expired |
| `ApiError` | `API_ERROR` | API returned an error |
| `NetworkError` | `NETWORK_ERROR` | Network request failed |
| `SandboxModeError` | `SANDBOX_MODE_ERROR` | Sandbox mode mismatch |
| `WalletTransactionError` | `WALLET_TRANSACTION_FAILED` | Wallet transaction failed |
| `ValidationError` | `VALIDATION_ERROR` | Input validation failed |

---

## Full Example

```typescript
import { SestraClient, SestraWallet } from '@sestra/sdk';
import { Keypair } from '@solana/web3.js';

async function main() {
  // Initialize clients
  const client = new SestraClient({
    serviceBaseUrl: 'https://api.yourservice.com',
  });
  const wallet = new SestraWallet();

  // 1. Create payment
  const payment = await client.createPayment({
    policy_id: 'your-policy-id',
  });

  console.log(`Pay ${payment.payment_details.amount_sol} SOL`);
  console.log(`To: ${payment.payment_details.recipient_address}`);

  // 2. Send payment (server-side example)
  const keypair = Keypair.fromSecretKey(/* your secret key */);
  const result = await wallet.sendPaymentFromDetails(
    keypair,
    payment.payment_details
  );

  if (!result.success) {
    throw new Error(result.error);
  }

  // 3. Verify payment and get session
  const verification = await client.verifyPayment(
    payment.reference_id,
    result.txHash!
  );

  console.log(`Session activated! Token: ${verification.token}`);

  // 4. Access protected API
  const data = await client.request('/api/v1/protected-endpoint');
  console.log(data);
}

main().catch(console.error);
```

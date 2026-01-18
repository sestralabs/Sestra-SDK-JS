# Sestra SDK Examples

This directory contains example code demonstrating how to use the Sestra SDK.

## Examples

### 1. Basic Payment Flow (`basic-payment.ts`)

Complete payment flow demonstration:
- Create payment request
- Send Solana payment
- Verify payment
- Access protected API

```bash
# Set environment variables
export SESTRA_POLICY_ID="your-policy-id"
export SERVICE_URL="https://api.yourservice.com"
export KEYPAIR_PATH="./keypair.json"

# Run example
npx ts-node examples/basic-payment.ts
```

### 2. Sandbox Testing (`sandbox-testing.ts`)

Test the SDK without real Solana transactions:
- Create sandbox payments
- Simulate payment success/failure
- List and cancel payments

```bash
npx ts-node examples/sandbox-testing.ts
```

### 3. Merchant API (`merchant-api.ts`)

Manage your merchant account:
- View account stats
- Create and manage policies
- View transactions and earnings

```bash
export SESTRA_API_KEY="sk_live_your_api_key"
npx ts-node examples/merchant-api.ts
```

### 4. Browser Wallet Integration (`browser-wallet.ts`)

Integration with browser wallets (Phantom, Solflare):
- Connect wallet
- Create and sign transactions
- Handle payment flow in browser

This example is meant to be used with a bundler (Webpack, Vite, etc.) in a React/Vue/Svelte application.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install @sestra/sdk @solana/web3.js
   ```

2. For server-side examples, create a Solana keypair:
   ```bash
   solana-keygen new -o keypair.json
   ```

3. Get a policy ID from the [Sestra Dashboard](https://console.sestralabs.xyz)

## Running Examples

```bash
# Install ts-node if not installed
npm install -g ts-node typescript

# Run any example
npx ts-node examples/<example-name>.ts
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SESTRA_POLICY_ID` | Your policy ID from Sestra Dashboard | Yes |
| `SERVICE_URL` | Your protected service URL | For production |
| `KEYPAIR_PATH` | Path to Solana keypair JSON | For server-side |
| `SESTRA_API_KEY` | API key for Merchant API | For merchant features |

## Notes

- **Sandbox Mode**: Use sandbox mode for testing without real transactions
- **Mainnet**: Ensure you have SOL in your wallet for mainnet transactions
- **Security**: Never commit keypair files or API keys to version control

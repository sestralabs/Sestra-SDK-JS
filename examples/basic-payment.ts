/**
 * Basic Payment Flow Example
 * 
 * This example demonstrates the complete payment flow using the Sestra SDK:
 * 1. Create a payment request
 * 2. Send payment on Solana
 * 3. Verify payment and get session
 * 4. Access protected API
 */

import { SestraClient, SestraWallet, PaymentDetails } from '@sestra/sdk';
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';

// Configuration
const POLICY_ID = process.env.SESTRA_POLICY_ID || 'your-policy-id';
const SERVICE_URL = process.env.SERVICE_URL || 'https://api.yourservice.com';
const KEYPAIR_PATH = process.env.KEYPAIR_PATH || './keypair.json';

async function main() {
  console.log('🚀 Starting Sestra Payment Flow\n');

  // Initialize SDK clients
  const client = new SestraClient({
    serviceBaseUrl: SERVICE_URL,
  });

  const wallet = new SestraWallet();

  // Load keypair (for server-side payments)
  const secretKey = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
  const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

  console.log(`📍 Payer Address: ${keypair.publicKey.toBase58()}`);

  // Check balance
  const balance = await wallet.getBalanceSOL(keypair.publicKey.toBase58());
  console.log(`💰 Balance: ${balance} SOL\n`);

  // Step 1: Create payment
  console.log('📝 Step 1: Creating payment request...');
  const payment = await client.createPayment({
    policy_id: POLICY_ID,
    metadata: {
      user_id: 'example-user',
      timestamp: new Date().toISOString(),
    },
  });

  console.log(`   Reference ID: ${payment.reference_id}`);
  console.log(`   Amount: ${payment.payment_details.amount_sol} SOL`);
  console.log(`   Recipient: ${payment.payment_details.recipient_address}`);
  console.log(`   Expires in: ${payment.payment_details.expires_in_seconds}s\n`);

  // Step 2: Send Solana payment
  console.log('💸 Step 2: Sending Solana payment...');
  const paymentResult = await wallet.sendPaymentFromDetails(
    keypair,
    payment.payment_details as PaymentDetails
  );

  if (!paymentResult.success) {
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }

  console.log(`   Transaction Hash: ${paymentResult.txHash}\n`);

  // Step 3: Verify payment
  console.log('✅ Step 3: Verifying payment...');
  const verification = await client.verifyPayment(
    payment.reference_id,
    paymentResult.txHash!
  );

  console.log(`   Status: ${verification.status}`);
  console.log(`   Session Token: ${verification.token?.substring(0, 20)}...`);
  console.log(`   Calls Remaining: ${verification.calls_remaining}\n`);

  // Step 4: Access protected API
  console.log('🔐 Step 4: Accessing protected API...');
  try {
    const response = await client.request('/api/v1/protected-resource');
    console.log('   Protected resource accessed successfully!');
    console.log(`   Response: ${JSON.stringify(response, null, 2)}\n`);
  } catch (error) {
    console.log(`   Note: Protected endpoint not available in this example\n`);
  }

  // Check session status
  console.log('📊 Session Status:');
  const session = client.getSession();
  if (session) {
    console.log(`   Token: ${session.token.substring(0, 20)}...`);
    console.log(`   Reference: ${session.reference_id}`);
    console.log(`   Expires: ${session.expires_at}`);
    console.log(`   Calls Remaining: ${session.calls_remaining}`);
  }

  console.log('\n✨ Payment flow completed successfully!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

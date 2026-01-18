/**
 * Sandbox Testing Example
 * 
 * This example demonstrates how to use the sandbox mode for testing
 * without making real Solana transactions.
 */

import { SestraClient } from '@sestra/sdk';

const POLICY_ID = process.env.SESTRA_POLICY_ID || 'test-policy-id';

async function main() {
  console.log('🧪 Sestra SDK - Sandbox Testing\n');

  // Initialize sandbox client
  const client = new SestraClient({
    sandbox: true,
    serviceBaseUrl: 'https://api.yourservice.com',
  });

  console.log('📍 Mode: Sandbox (no real transactions)\n');

  // Step 1: Create sandbox payment
  console.log('📝 Step 1: Creating sandbox payment...');
  const payment = await client.createPayment({
    policy_id: POLICY_ID,
  });

  console.log(`   Reference ID: ${payment.reference_id}`);
  console.log(`   Is Sandbox: ${'is_sandbox' in payment ? payment.is_sandbox : 'N/A'}`);
  
  if ('payment_details' in payment) {
    console.log(`   Amount: ${payment.payment_details.amount_sol} SOL`);
  }
  console.log('');

  // Step 2: Simulate successful payment
  console.log('🎭 Step 2: Simulating payment (success)...');
  const successResult = await client.simulatePayment(payment.reference_id, {
    success: true,
  });

  console.log(`   Status: ${successResult.status}`);
  console.log(`   Message: ${successResult.message}`);
  if (successResult.token) {
    console.log(`   Token: ${successResult.token.substring(0, 20)}...`);
  }
  console.log('');

  // Check if session is active
  console.log('🔍 Step 3: Checking session status...');
  if (client.hasActiveSession()) {
    const session = client.getSession();
    console.log(`   ✅ Session is active`);
    console.log(`   Calls Remaining: ${session?.calls_remaining}`);
  } else {
    console.log(`   ❌ No active session`);
  }
  console.log('');

  // Create another payment to test failure simulation
  console.log('📝 Step 4: Creating another payment for failure test...');
  const failPayment = await client.createPayment({
    policy_id: POLICY_ID,
  });
  console.log(`   Reference ID: ${failPayment.reference_id}\n`);

  // Simulate failed payment
  console.log('🎭 Step 5: Simulating payment (failure)...');
  try {
    const failResult = await client.simulatePayment(failPayment.reference_id, {
      success: false,
    });
    console.log(`   Status: ${failResult.status}`);
    console.log(`   Message: ${failResult.message}`);
  } catch (error) {
    console.log(`   Expected failure occurred`);
  }
  console.log('');

  // List all sandbox payments
  console.log('📋 Step 6: Listing sandbox payments...');
  const payments = await client.listPayments();
  console.log(`   Total payments: ${payments.length}`);
  payments.slice(0, 5).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.reference_id} - ${p.status}`);
  });
  console.log('');

  // Cancel a payment
  console.log('🚫 Step 7: Cancelling a pending payment...');
  const newPayment = await client.createPayment({ policy_id: POLICY_ID });
  const cancelResult = await client.cancelPayment(newPayment.reference_id);
  console.log(`   Reference: ${cancelResult.reference_id}`);
  console.log(`   Status: ${cancelResult.status}`);
  console.log(`   Message: ${'message' in cancelResult ? cancelResult.message : 'Cancelled'}`);

  console.log('\n✨ Sandbox testing completed!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

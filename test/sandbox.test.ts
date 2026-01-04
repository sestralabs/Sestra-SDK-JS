/**
 * Sestra SDK Test - Sandbox Mode
 * Tests the SDK against the local sandbox API
 */

import { SestraClient } from '../src/client.js';

const POLICY_ID = '7d7837cd-89c0-457d-9fb5-acb61a4f97d9';
const BASE_URL = 'http://localhost:8000';

async function testSandboxPaymentFlow() {
  console.log('🧪 Testing Sestra SDK - Sandbox Mode\n');
  
  // Initialize client in sandbox mode
  const client = new SestraClient({
    baseUrl: BASE_URL,
    sandbox: true,
  });

  try {
    // 1. Create Payment
    console.log('1️⃣ Creating sandbox payment...');
    const payment = await client.createPayment({
      policy_id: POLICY_ID,
    });
    
    console.log('   ✅ Payment created!');
    console.log(`   Reference ID: ${payment.reference_id}`);
    console.log(`   Amount: ${payment.payment_details.amount_sol} SOL`);
    console.log(`   Network: ${payment.payment_details.network}`);
    console.log(`   Is Sandbox: ${payment.is_sandbox}`);
    console.log('');

    // 2. Check Payment Status
    console.log('2️⃣ Checking payment status...');
    const status = await client.getPaymentStatus(payment.reference_id);
    console.log(`   ✅ Status: ${status.status}`);
    console.log('');

    // 3. Simulate Payment
    console.log('3️⃣ Simulating payment (success)...');
    const result = await client.simulatePayment(payment.reference_id, { success: true });
    
    console.log('   ✅ Payment simulated!');
    console.log(`   Status: ${result.status}`);
    console.log(`   Token: ${result.token?.substring(0, 20)}...`);
    console.log(`   Calls Remaining: ${result.calls_remaining}`);
    console.log('');

    // 4. Check Session
    console.log('4️⃣ Checking session...');
    const session = client.getSession();
    console.log(`   ✅ Session active: ${client.hasActiveSession()}`);
    console.log(`   Token: ${session?.token.substring(0, 20)}...`);
    console.log('');

    // 5. List Payments
    console.log('5️⃣ Listing sandbox payments...');
    const payments = await client.listPayments({ limit: 5 });
    console.log(`   ✅ Found ${payments.length} payments`);
    console.log('');

    // 6. Test Failed Payment Simulation
    console.log('6️⃣ Testing failed payment simulation...');
    const payment2 = await client.createPayment({ policy_id: POLICY_ID });
    const failedResult = await client.simulatePayment(payment2.reference_id, { success: false });
    console.log(`   ✅ Failed simulation: ${failedResult.message}`);
    console.log('');

    // 7. Cancel Payment
    console.log('7️⃣ Testing cancel payment...');
    const payment3 = await client.createPayment({ policy_id: POLICY_ID });
    const cancelResult = await client.cancelPayment(payment3.reference_id);
    console.log(`   ✅ Cancelled: ${cancelResult.message}`);
    console.log('');

    console.log('🎉 All tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testSandboxPaymentFlow();

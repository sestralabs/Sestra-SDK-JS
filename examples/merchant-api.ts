/**
 * Merchant API Example
 * 
 * This example demonstrates how to use the Merchant API to manage
 * policies, view transactions, and track earnings.
 * 
 * Requires: API Key from Sestra Dashboard
 */

import { SestraClient } from '@sestra/sdk';

const API_KEY = process.env.SESTRA_API_KEY || 'sk_live_your_api_key';

async function main() {
  console.log('🏪 Sestra SDK - Merchant API\n');

  // Initialize client with API key
  const client = new SestraClient({
    apiKey: API_KEY,
  });

  // Get merchant user info
  console.log('👤 Getting merchant info...');
  try {
    const user = await client.getMerchantUser();
    console.log(`   Email: ${user.email}`);
    console.log(`   Wallet: ${user.wallet_address || 'Not set'}`);
    console.log(`   Created: ${user.created_at}`);
  } catch (error) {
    console.log(`   ⚠️  Could not fetch user info (check API key)`);
  }
  console.log('');

  // Get merchant stats
  console.log('📊 Getting merchant stats...');
  try {
    const stats = await client.getMerchantStats();
    console.log(`   Total Payments: ${stats.total_payments}`);
    console.log(`   Active Sessions: ${stats.active_sessions}`);
    console.log(`   Total Revenue: ${stats.total_revenue_sol} SOL`);
  } catch (error) {
    console.log(`   ⚠️  Could not fetch stats`);
  }
  console.log('');

  // List policies
  console.log('📜 Listing policies...');
  try {
    const policies = await client.listPolicies();
    if (policies.length === 0) {
      console.log('   No policies found');
    } else {
      policies.forEach((policy, i) => {
        console.log(`   ${i + 1}. ${policy.name}`);
        console.log(`      ID: ${policy.id}`);
        console.log(`      Pattern: ${policy.endpoint_pattern}`);
        console.log(`      Price: ${policy.required_amount_lamports / 1e9} SOL`);
        console.log(`      TTL: ${policy.ttl_seconds}s`);
        console.log(`      Max Calls: ${policy.max_calls}`);
        console.log(`      Active: ${policy.is_active}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Could not fetch policies`);
  }

  // Create a new policy (example - commented out to avoid creating test data)
  console.log('➕ Creating a new policy (example)...');
  console.log('   // Uncomment below to create a policy');
  console.log(`   
   const newPolicy = await client.createPolicy({
     name: 'Basic API Access',
     endpoint_pattern: '/api/v1/*',
     ttl_seconds: 3600,      // 1 hour
     max_calls: 100,
     required_amount_lamports: 10000000, // 0.01 SOL
   });
  `);
  console.log('');

  // Get recent transactions
  console.log('💳 Getting recent transactions...');
  try {
    const transactions = await client.getTransactions({
      limit: 5,
      type: 'PAYMENT',
    });

    if (transactions.length === 0) {
      console.log('   No transactions found');
    } else {
      transactions.forEach((tx, i) => {
        console.log(`   ${i + 1}. ${tx.reference_id}`);
        console.log(`      Type: ${tx.type}`);
        console.log(`      Amount: ${tx.amount_sol} SOL`);
        console.log(`      Status: ${tx.status}`);
        console.log(`      TX Hash: ${tx.tx_hash || 'N/A'}`);
        console.log(`      Created: ${tx.created_at}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`   ⚠️  Could not fetch transactions`);
  }

  // Get earnings report
  console.log('💰 Getting earnings report...');
  try {
    const earnings7d = await client.getEarnings(7);
    console.log('   Last 7 days:');
    console.log(`      Total: ${earnings7d.total_sol} SOL`);
    console.log(`      Transactions: ${earnings7d.transaction_count}`);
    
    if (earnings7d.daily_breakdown && earnings7d.daily_breakdown.length > 0) {
      console.log('      Daily breakdown:');
      earnings7d.daily_breakdown.forEach((day) => {
        console.log(`         ${day.date}: ${day.amount_sol} SOL (${day.count} tx)`);
      });
    }
    console.log('');

    const earnings30d = await client.getEarnings(30);
    console.log('   Last 30 days:');
    console.log(`      Total: ${earnings30d.total_sol} SOL`);
    console.log(`      Transactions: ${earnings30d.transaction_count}`);
  } catch (error) {
    console.log(`   ⚠️  Could not fetch earnings`);
  }

  console.log('\n✨ Merchant API demo completed!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

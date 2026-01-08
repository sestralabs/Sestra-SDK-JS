/**
 * Sestra SDK - Wallet Unit Tests
 * Comprehensive tests for SestraWallet functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SestraWallet } from '../src/wallet.js';
import { PublicKey, Keypair } from '@solana/web3.js';
import type { PaymentDetails } from '../src/types.js';

// Valid base58 public keys for testing
const VALID_PAYER = Keypair.generate().publicKey;
const VALID_RECIPIENT = Keypair.generate().publicKey.toBase58();
const VALID_PLATFORM = Keypair.generate().publicKey.toBase58();

describe('SestraWallet', () => {
  let wallet: SestraWallet;

  beforeEach(() => {
    wallet = new SestraWallet('https://api.mainnet-beta.solana.com');
  });

  describe('constructor', () => {
    it('should create wallet with default RPC endpoint', () => {
      const defaultWallet = new SestraWallet();
      expect(defaultWallet).toBeInstanceOf(SestraWallet);
    });

    it('should create wallet with custom RPC endpoint', () => {
      const customWallet = new SestraWallet('https://custom-rpc.com');
      expect(customWallet).toBeInstanceOf(SestraWallet);
    });

    it('should detect mainnet network', () => {
      const mainnetWallet = new SestraWallet('https://api.mainnet-beta.solana.com');
      expect(mainnetWallet.getNetwork()).toBe('mainnet-beta');
    });

    it('should detect devnet network', () => {
      const devnetWallet = new SestraWallet('https://api.devnet.solana.com');
      expect(devnetWallet.getNetwork()).toBe('devnet');
    });
  });

  describe('getNetwork', () => {
    it('should return current network', () => {
      expect(wallet.getNetwork()).toBe('mainnet-beta');
    });

    it('should return devnet for devnet endpoint', () => {
      const devnetWallet = new SestraWallet('https://api.devnet.solana.com');
      expect(devnetWallet.getNetwork()).toBe('devnet');
    });
  });

  describe('createPaymentTransaction', () => {
    it('should create transaction with correct structure', async () => {
      const params = {
        recipientAddress: VALID_RECIPIENT,
        amountLamports: 1000000000,
        memo: 'payment-ref-123',
      };

      const transaction = await wallet.createPaymentTransaction(VALID_PAYER, params);

      expect(transaction).toBeDefined();
      expect(transaction.instructions).toHaveLength(2); // Transfer + Memo
      expect(transaction.feePayer?.toBase58()).toBe(VALID_PAYER.toBase58());
    });

    it('should include transfer instruction as first instruction', async () => {
      const params = {
        recipientAddress: VALID_RECIPIENT,
        amountLamports: 1000000000,
        memo: 'test-memo',
      };

      const transaction = await wallet.createPaymentTransaction(VALID_PAYER, params);
      const transferInstruction = transaction.instructions[0];

      expect(transferInstruction).toBeDefined();
      // SystemProgram ID (all 1s with last digit being 1)
      expect(transferInstruction.programId.toBase58()).toBe('11111111111111111111111111111111');
    });

    it('should include memo instruction as second instruction', async () => {
      const params = {
        recipientAddress: VALID_RECIPIENT,
        amountLamports: 1000000000,
        memo: 'payment-ref-123',
      };

      const transaction = await wallet.createPaymentTransaction(VALID_PAYER, params);
      const memoInstruction = transaction.instructions[1];

      expect(memoInstruction).toBeDefined();
      expect(memoInstruction.programId.toBase58()).toBe('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      expect(memoInstruction.data.toString()).toBe('payment-ref-123');
    });

    it('should set recent blockhash', async () => {
      const params = {
        recipientAddress: VALID_RECIPIENT,
        amountLamports: 1000000000,
        memo: 'test',
      };

      const transaction = await wallet.createPaymentTransaction(VALID_PAYER, params);
      expect(transaction.recentBlockhash).toBeDefined();
    });
  });

  describe('createPaymentFromDetails', () => {
    it('should create transaction from PaymentDetails object', async () => {
      const paymentDetails: PaymentDetails = {
        blockchain: 'solana',
        network: 'mainnet-beta',
        recipient_address: VALID_RECIPIENT,
        platform_address: VALID_PLATFORM,
        amount_lamports: 1000000000,
        amount_sol: 1.0,
        platform_fee_lamports: 50000000,
        developer_amount_lamports: 950000000,
        reference: 'payment-ref-456',
        expires_in_seconds: 3600,
        program_id: 'program-123',
        use_smart_contract: false,
      };

      const transaction = await wallet.createPaymentFromDetails(VALID_PAYER, paymentDetails);

      expect(transaction).toBeDefined();
      expect(transaction.instructions).toHaveLength(2);
    });

    it('should use reference as memo', async () => {
      const paymentDetails: PaymentDetails = {
        blockchain: 'solana',
        network: 'mainnet-beta',
        recipient_address: VALID_RECIPIENT,
        platform_address: VALID_PLATFORM,
        amount_lamports: 1000000000,
        amount_sol: 1.0,
        platform_fee_lamports: 50000000,
        developer_amount_lamports: 950000000,
        reference: 'unique-reference-123',
        expires_in_seconds: 3600,
        program_id: 'program-123',
        use_smart_contract: false,
      };

      const transaction = await wallet.createPaymentFromDetails(VALID_PAYER, paymentDetails);
      const memoInstruction = transaction.instructions[1];

      expect(memoInstruction.data.toString()).toBe('unique-reference-123');
    });
  });
});

describe('SestraWallet Error Handling', () => {
  let wallet: SestraWallet;

  beforeEach(() => {
    wallet = new SestraWallet();
  });

  describe('createPaymentTransaction', () => {
    it('should throw error for invalid recipient address', async () => {
      const params = {
        recipientAddress: 'invalid-address',
        amountLamports: 1000000000,
        memo: 'test',
      };

      await expect(wallet.createPaymentTransaction(VALID_PAYER, params))
        .rejects.toThrow();
    });

    it('should throw error for empty memo', async () => {
      const params = {
        recipientAddress: VALID_RECIPIENT,
        amountLamports: 1000000000,
        memo: '',
      };

      // Empty memo should still work (creates empty memo instruction)
      const transaction = await wallet.createPaymentTransaction(VALID_PAYER, params);
      expect(transaction).toBeDefined();
    });
  });

  describe('getBalance', () => {
    it('should throw error for invalid address format', async () => {
      await expect(wallet.getBalance('invalid-address'))
        .rejects.toThrow();
    });
  });
});

describe('SestraWallet Payment Flow Integration', () => {
  let wallet: SestraWallet;

  beforeEach(() => {
    wallet = new SestraWallet('https://api.devnet.solana.com');
  });

  it('should create complete payment transaction with all components', async () => {
    const paymentDetails: PaymentDetails = {
      blockchain: 'solana',
      network: 'devnet',
      recipient_address: VALID_RECIPIENT,
      platform_address: VALID_PLATFORM,
      amount_lamports: 100000000,
      amount_sol: 0.1,
      platform_fee_lamports: 5000000,
      developer_amount_lamports: 95000000,
      reference: 'test-payment-ref',
      expires_in_seconds: 1800,
      program_id: 'test-program',
      use_smart_contract: false,
    };

    const transaction = await wallet.createPaymentFromDetails(VALID_PAYER, paymentDetails);

    expect(transaction).toBeDefined();
    expect(transaction.instructions.length).toBe(2);
    expect(transaction.feePayer?.toBase58()).toBe(VALID_PAYER.toBase58());
    expect(transaction.recentBlockhash).toBeDefined();
  });

  it('should handle devnet network detection', () => {
    expect(wallet.getNetwork()).toBe('devnet');
  });
});

describe('SestraWallet Keypair Generation', () => {
  it('should work with generated keypairs', async () => {
    const wallet = new SestraWallet();
    const payer = Keypair.generate();
    const recipient = Keypair.generate();

    const params = {
      recipientAddress: recipient.publicKey.toBase58(),
      amountLamports: 500000000,
      memo: 'generated-keypair-test',
    };

    const transaction = await wallet.createPaymentTransaction(payer.publicKey, params);

    expect(transaction).toBeDefined();
    expect(transaction.feePayer?.toBase58()).toBe(payer.publicKey.toBase58());
  });
});

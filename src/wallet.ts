// ============================================
// Sestra Wallet - Solana Payment Helper
// ============================================

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { createMemoInstruction } from '@solana/spl-memo';
import type { PaymentParams, PaymentResult, PaymentDetails, SandboxPaymentDetails } from './types.js';

export class SestraWallet {
  private connection: Connection;
  private network: 'mainnet-beta' | 'devnet';

  constructor(rpcEndpoint = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.network = rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet-beta';
  }

  /**
   * Get current network
   */
  getNetwork(): string {
    return this.network;
  }

  /**
   * Create payment transaction from PaymentDetails
   * Use this with wallet adapters (Phantom, Solflare, etc.)
   */
  async createPaymentFromDetails(
    payerPublicKey: PublicKey,
    paymentDetails: PaymentDetails
  ): Promise<Transaction> {
    return this.createPaymentTransaction(payerPublicKey, {
      recipientAddress: paymentDetails.recipient_address,
      amountLamports: paymentDetails.amount_lamports,
      memo: paymentDetails.reference,
    });
  }

  /**
   * Create a payment transaction (for signing by user's wallet)
   */
  async createPaymentTransaction(
    payerPublicKey: PublicKey,
    params: PaymentParams
  ): Promise<Transaction> {
    const { recipientAddress, amountLamports, memo } = params;

    const transaction = new Transaction();

    // Add SOL transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: amountLamports,
      })
    );

    // Add memo instruction with reference_id (using @solana/spl-memo)
    transaction.add(
      createMemoInstruction(memo, [payerPublicKey])
    );

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPublicKey;

    return transaction;
  }

  /**
   * Send payment transaction (server-side with keypair)
   */
  async sendPayment(
    keypair: Keypair,
    params: PaymentParams
  ): Promise<PaymentResult> {
    try {
      const transaction = await this.createPaymentTransaction(
        keypair.publicKey,
        params
      );

      const txHash = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [keypair]
      );

      return { success: true, txHash };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      return { success: false, error: message };
    }
  }

  /**
   * Send payment from PaymentDetails (server-side with keypair)
   */
  async sendPaymentFromDetails(
    keypair: Keypair,
    paymentDetails: PaymentDetails
  ): Promise<PaymentResult> {
    return this.sendPayment(keypair, {
      recipientAddress: paymentDetails.recipient_address,
      amountLamports: paymentDetails.amount_lamports,
      memo: paymentDetails.reference,
    });
  }

  /**
   * Get wallet balance in lamports
   */
  async getBalance(address: string): Promise<number> {
    const pubkey = new PublicKey(address);
    return await this.connection.getBalance(pubkey);
  }

  /**
   * Get wallet balance in SOL
   */
  async getBalanceSOL(address: string): Promise<number> {
    const lamports = await this.getBalance(address);
    return lamports / 1_000_000_000;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(txHash: string, timeout = 30000): Promise<boolean> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const status = await this.connection.getSignatureStatus(txHash);
      
      if (status.value?.confirmationStatus === 'finalized' ||
          status.value?.confirmationStatus === 'confirmed') {
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }

  /**
   * Check if transaction is confirmed
   */
  async isTransactionConfirmed(txHash: string): Promise<boolean> {
    try {
      const status = await this.connection.getSignatureStatus(txHash);
      return status.value?.confirmationStatus === 'finalized' ||
             status.value?.confirmationStatus === 'confirmed';
    } catch {
      return false;
    }
  }
}

export default SestraWallet;

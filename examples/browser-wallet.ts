/**
 * Browser Wallet Integration Example
 * 
 * This example demonstrates how to integrate the Sestra SDK with
 * browser wallet adapters like Phantom, Solflare, etc.
 * 
 * This is meant to be used in a browser environment with a bundler.
 */

import { SestraClient, SestraWallet } from '@sestra/sdk';
import { PublicKey } from '@solana/web3.js';

// Types for wallet adapter (simplified)
interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  sendTransaction(transaction: any, connection: any): Promise<string>;
}

// Configuration
const POLICY_ID = 'your-policy-id';
const SERVICE_URL = 'https://api.yourservice.com';

class PaymentHandler {
  private client: SestraClient;
  private wallet: SestraWallet;
  private walletAdapter: WalletAdapter | null = null;

  constructor() {
    this.client = new SestraClient({
      serviceBaseUrl: SERVICE_URL,
    });
    this.wallet = new SestraWallet();
  }

  /**
   * Set the wallet adapter (Phantom, Solflare, etc.)
   */
  setWalletAdapter(adapter: WalletAdapter) {
    this.walletAdapter = adapter;
  }

  /**
   * Connect to the browser wallet
   */
  async connectWallet(): Promise<string> {
    if (!this.walletAdapter) {
      throw new Error('Wallet adapter not set');
    }

    await this.walletAdapter.connect();
    
    if (!this.walletAdapter.publicKey) {
      throw new Error('Failed to get public key');
    }

    return this.walletAdapter.publicKey.toBase58();
  }

  /**
   * Create a payment and return payment details for UI
   */
  async createPayment() {
    const payment = await this.client.createPayment({
      policy_id: POLICY_ID,
    });

    return {
      referenceId: payment.reference_id,
      amountSol: payment.payment_details.amount_sol,
      amountLamports: payment.payment_details.amount_lamports,
      recipientAddress: payment.payment_details.recipient_address,
      expiresIn: payment.payment_details.expires_in_seconds,
      paymentDetails: payment.payment_details,
    };
  }

  /**
   * Execute payment using browser wallet
   */
  async executePayment(paymentDetails: any): Promise<string> {
    if (!this.walletAdapter || !this.walletAdapter.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create transaction
    const transaction = await this.wallet.createPaymentFromDetails(
      this.walletAdapter.publicKey,
      paymentDetails
    );

    // Sign with browser wallet
    const signedTransaction = await this.walletAdapter.signTransaction(transaction);

    // Send transaction
    const connection = (this.wallet as any).connection;
    const txHash = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation
    await this.wallet.waitForConfirmation(txHash);

    return txHash;
  }

  /**
   * Verify payment and activate session
   */
  async verifyPayment(referenceId: string, txHash: string) {
    const result = await this.client.verifyPayment(referenceId, txHash);
    return result;
  }

  /**
   * Complete payment flow
   */
  async completePaymentFlow(): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      // 1. Connect wallet
      const walletAddress = await this.connectWallet();
      console.log('Connected wallet:', walletAddress);

      // 2. Create payment
      const payment = await this.createPayment();
      console.log('Payment created:', payment.referenceId);

      // 3. Execute payment
      const txHash = await this.executePayment(payment.paymentDetails);
      console.log('Transaction sent:', txHash);

      // 4. Verify payment
      const verification = await this.verifyPayment(payment.referenceId, txHash);
      console.log('Payment verified:', verification.status);

      return {
        success: true,
        token: verification.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user has active session
   */
  hasActiveSession(): boolean {
    return this.client.hasActiveSession();
  }

  /**
   * Make authenticated API request
   */
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.client.request<T>(endpoint, options);
  }
}

// Usage example for React/Vue/Svelte components
/*
import { useWallet } from '@solana/wallet-adapter-react';

function PaymentButton() {
  const wallet = useWallet();
  const handler = new PaymentHandler();

  useEffect(() => {
    if (wallet.wallet) {
      handler.setWalletAdapter(wallet as unknown as WalletAdapter);
    }
  }, [wallet]);

  const handlePayment = async () => {
    const result = await handler.completePaymentFlow();
    if (result.success) {
      console.log('Payment successful! Token:', result.token);
    } else {
      console.error('Payment failed:', result.error);
    }
  };

  return (
    <button onClick={handlePayment} disabled={!wallet.connected}>
      Pay with SOL
    </button>
  );
}
*/

export { PaymentHandler };

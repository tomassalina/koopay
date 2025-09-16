import { Horizon, Keypair, Networks, TransactionBuilder, Operation } from '@stellar/stellar-sdk';
import CryptoJS from 'crypto-js';

export interface StellarWallet {
  publicKey: string;
  secretKey?: string;
  authMethod: string;
  createdAt: number;
}

export interface WalletBalance {
  asset: string;
  balance: string;
}

export class StellarWalletManager {
  private server: Horizon.Server;
  private network: string;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    this.server = new Horizon.Server(
      network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
  }

  /**
   * Create a deterministic wallet from Google user data
   */
  createWalletFromGoogle(userId: string, email: string): StellarWallet {
    // Create deterministic keypair from Google user ID
    const seed = CryptoJS.SHA256(`google:${userId}:${email}`).toString();
    const keypair = Keypair.fromSecret(seed);
    
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      authMethod: 'google',
      createdAt: Date.now()
    };
  }

  /**
   * Create a deterministic wallet from any identifier
   */
  createWalletFromIdentifier(identifier: string, authMethod: string): StellarWallet {
    // Create a deterministic seed from the identifier
    const seedData = `${authMethod}:${identifier}`;
    const hash = CryptoJS.SHA256(seedData).toString();
    
    // Convert hash to 32-byte buffer for Ed25519 seed
    // Pad or truncate to exactly 32 bytes
    const hashBuffer = Buffer.from(hash, 'hex');
    const seedBuffer = Buffer.alloc(32);
    
    if (hashBuffer.length >= 32) {
      hashBuffer.copy(seedBuffer, 0, 0, 32);
    } else {
      hashBuffer.copy(seedBuffer, 0);
      // Fill remaining bytes with repeated hash
      let offset = hashBuffer.length;
      while (offset < 32) {
        const remaining = Math.min(hashBuffer.length, 32 - offset);
        hashBuffer.copy(seedBuffer, offset, 0, remaining);
        offset += remaining;
      }
    }
    
    const keypair = Keypair.fromRawEd25519Seed(seedBuffer);
    
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
      authMethod,
      createdAt: Date.now()
    };
  }

  /**
   * Fund a testnet account using friendbot
   */
  async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (this.network !== 'testnet') return false;

    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      if (!response.ok) {
        throw new Error('Friendbot funding failed');
      }
      console.log('✅ Account funded with testnet XLM');
      return true;
    } catch (error: any) {
      console.warn('⚠️ Friendbot funding failed:', error.message);
      return false;
    }
  }

  /**
   * Check if account exists on Stellar network
   */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await this.server.loadAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: string): Promise<WalletBalance[]> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account.balances.map(balance => ({
        asset: balance.asset_type === 'native' ? 'XLM' : (balance as any).asset_code || 'Unknown',
        balance: balance.balance
      }));
    } catch (error) {
      console.error('Error fetching balance:', error);
      return [];
    }
  }

  /**
   * Create and fund a new wallet
   */
  async createAndFundWallet(identifier: string, authMethod: string): Promise<StellarWallet> {
    const wallet = this.createWalletFromIdentifier(identifier, authMethod);
    
    // Check if account already exists
    const exists = await this.accountExists(wallet.publicKey);
    
    if (!exists && this.network === 'testnet') {
      // Fund the account
      await this.fundTestnetAccount(wallet.publicKey);
      
      // Wait a bit for the account to be created
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    return wallet;
  }

  /**
   * Send payment (simplified version)
   */
  async sendPayment(
    secretKey: string,
    destination: string,
    amount: string,
    asset: string = 'XLM'
  ): Promise<string | null> {
    try {
      const keypair = Keypair.fromSecret(secretKey);
      const account = await this.server.loadAccount(keypair.publicKey());
      
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      })
      .addOperation(
        Operation.payment({
          destination,
          asset: asset === 'XLM' ? new (await import('@stellar/stellar-sdk')).Asset.native() : 
            new (await import('@stellar/stellar-sdk')).Asset(asset, 'ISSUER'),
          amount
        })
      )
      .setTimeout(30)
      .build();

      transaction.sign(keypair);
      
      const result = await this.server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      console.error('Payment failed:', error);
      return null;
    }
  }
}

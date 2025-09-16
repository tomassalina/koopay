'use client';

import { useState, useEffect, useCallback } from 'react';
import { StellarWalletManager, StellarWallet, WalletBalance } from '@/lib/stellar/wallet';
import { createClient } from '@/lib/supabase/client';

export interface UseStellarWalletReturn {
  wallet: StellarWallet | null;
  balance: WalletBalance[];
  isLoading: boolean;
  error: string | null;
  createWallet: (userId: string, email: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendPayment: (destination: string, amount: string, asset?: string) => Promise<string | null>;
}

export function useStellarWallet(): UseStellarWalletReturn {
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [balance, setBalance] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const walletManager = new StellarWalletManager('testnet');
  const supabase = createClient();

  // Load wallet from Supabase on mount
  useEffect(() => {
    loadWalletFromSupabase();
  }, []);

  // Load balance when wallet changes
  useEffect(() => {
    if (wallet?.publicKey) {
      refreshBalance();
    }
  }, [wallet?.publicKey]);

  const loadWalletFromSupabase = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setWallet(null);
        return;
      }

      // Check if wallet exists in user metadata
      const walletData = user.user_metadata?.stellar_wallet;
      
      if (walletData) {
        setWallet(walletData);
      }
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = useCallback(async (userId: string, email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create wallet from Google user data
      const newWallet = await walletManager.createAndFundWallet(userId, 'google');
      
      // Save wallet to Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          stellar_wallet: newWallet
        }
      });

      if (error) {
        throw error;
      }

      setWallet(newWallet);
      console.log('✅ Stellar wallet created:', newWallet.publicKey);
    } catch (err: any) {
      console.error('Error creating wallet:', err);
      setError(err.message || 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  }, [walletManager, supabase]);

  const refreshBalance = useCallback(async () => {
    if (!wallet?.publicKey) return;

    try {
      setIsLoading(true);
      const balances = await walletManager.getBalance(wallet.publicKey);
      setBalance(balances);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.publicKey, walletManager]);

  const sendPayment = useCallback(async (
    destination: string,
    amount: string,
    asset: string = 'XLM'
  ): Promise<string | null> => {
    if (!wallet?.secretKey) {
      setError('Wallet secret key not available');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const txHash = await walletManager.sendPayment(
        wallet.secretKey,
        destination,
        amount,
        asset
      );

      if (txHash) {
        // Refresh balance after successful payment
        await refreshBalance();
      }

      return txHash;
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.secretKey, walletManager, refreshBalance]);

  return {
    wallet,
    balance,
    isLoading,
    error,
    createWallet,
    refreshBalance,
    sendPayment
  };
}
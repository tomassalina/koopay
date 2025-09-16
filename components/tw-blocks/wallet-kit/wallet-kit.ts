import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  AlbedoModule,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";

import { Keypair, Networks, Transaction } from "@stellar/stellar-sdk";
/**
 * Stellar Wallet Kit
 *
 * @description The Stellar Wallet Kit is used to connect to the wallet
 * @description The Stellar Wallet Kit is used to sign transactions
 * @description The Stellar Wallet Kit is used to get the wallet address
 */
export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule(), new AlbedoModule()],
});

interface SignTransactionParams {
  unsignedTransaction: string;
  address: string;
}

/**
 * Sign Transaction Params
 *
 * @param unsignedTransaction - The unsigned transaction
 * @param address - The address of the wallet
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
}: SignTransactionParams): Promise<string> => {
  const { signedTxXdr } = await kit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  return signedTxXdr;
};

interface SignTransactionWithSecretParams {
  unsignedTransaction: string;
  secretKey: string;
}

/**
 * Signs a transaction using a secret key directly.
 *
 * @param {SignTransactionWithSecretParams} params - The parameters for signing.
 * @param {string} params.unsignedTransaction - The base64-encoded unsigned transaction XDR.
 * @param {string} params.secretKey - The secret key of the signing account.
 * @returns {Promise<string>} A promise that resolves with the signed transaction XDR.
 */
export const signTransactionWithSecret = async ({
  unsignedTransaction,
  secretKey,
}: SignTransactionWithSecretParams): Promise<string> => {
  const transaction = new Transaction(unsignedTransaction, Networks.TESTNET);
  const keypair = Keypair.fromSecret(secretKey);
  transaction.sign(keypair);
  return transaction.toXDR();
};

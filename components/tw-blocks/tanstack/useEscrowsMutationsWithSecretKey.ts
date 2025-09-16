import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EscrowType,
  FundEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  useFundEscrow,
  useInitializeEscrow,
  useUpdateEscrow,
  ChangeMilestoneStatusPayload,
  useChangeMilestoneStatus,
  ApproveMilestonePayload,
  useApproveMilestone,
  useSendTransaction,
  useStartDispute,
  useReleaseFunds,
  useResolveDispute,
  MultiReleaseStartDisputePayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseResolveDisputePayload,
  SingleReleaseResolveDisputePayload,
} from "@trustless-work/escrow";
import { signTransactionWithSecret } from "../wallet-kit/wallet-kit";

/**
 * A dedicated set of mutations for interacting with escrows using a secret key for signing.
 * This hook does not interact with the browser wallet.
 */
export const useEscrowsMutationsWithSecretKey = () => {
  const queryClient = useQueryClient();
  const { deployEscrow } = useInitializeEscrow();
  const { updateEscrow } = useUpdateEscrow();
  const { fundEscrow } = useFundEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { approveMilestone } = useApproveMilestone();
  const { sendTransaction } = useSendTransaction();
  const { startDispute } = useStartDispute();
  const { releaseFunds } = useReleaseFunds();
  const { resolveDispute } = useResolveDispute();

  const createMutation = (
    action: (payload: any, type: EscrowType) => Promise<{ unsignedTransaction?: string, [key: string]: any }>,
    invalidateQueryKey: string[] = ["escrows"],
  ) => {
    return useMutation({
      mutationFn: async ({
        payload,
        type,
        secretKey,
      }: {
        payload: any;
        type: EscrowType;
        secretKey: string;
      }) => {
        const actionResponse = await action(payload, type);
        const { unsignedTransaction } = actionResponse;

        if (!unsignedTransaction) {
          throw new Error("Unsigned transaction is missing from the response.");
        }

        const signedTxXdr = await signTransactionWithSecret({
          unsignedTransaction,
          secretKey,
        });

        if (!signedTxXdr) {
          throw new Error("Failed to sign transaction.");
        }

        const txResponse = await sendTransaction(signedTxXdr);

        if (txResponse.status !== "SUCCESS") {
          throw new Error("Transaction submission failed.");
        }

        return { ...actionResponse, ...txResponse };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      },
      onError: (error) => {
        console.error("Mutation Error:", error);
      },
    });
  };

  return {
    deployEscrow: createMutation((payload, type) => deployEscrow(payload, type)),
    updateEscrow: createMutation((payload, type) => updateEscrow(payload, type)),
    fundEscrow: createMutation((payload, type) => fundEscrow(payload, type)),
    changeMilestoneStatus: createMutation((payload, type) => changeMilestoneStatus(payload, type)),
    approveMilestone: createMutation((payload, type) => approveMilestone(payload, type)),
    startDispute: createMutation((payload, type) => startDispute(payload, type)),
    releaseFunds: createMutation((payload, type) => releaseFunds(payload, type)),
    resolveDispute: createMutation((payload, type) => resolveDispute(payload, type)),
  };
};

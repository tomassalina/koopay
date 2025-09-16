"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import { toast } from "sonner";
import {
  GetEscrowsFromIndexerResponse,
  UpdateMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
} from "@trustless-work/escrow/types";
import { Wrench } from "lucide-react";

interface FixRolesButtonProps {
  disabled?: boolean;
}

/**
 * One-click action to update escrow to have new freelancer roles.
 * Sets both `receiver` and `serviceProvider` to the freelancer wallet.
 * Uses the connected wallet as signer; freelancer public key is read from env.
 */
export const FixRolesButton: React.FC<FixRolesButtonProps> = ({ disabled }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { walletAddress } = useWalletContext();
  const { selectedEscrow, setSelectedEscrow } = useEscrowContext();
  const { updateEscrow } = useEscrowsMutations();

  const freelancerPk = (process.env.NEXT_PUBLIC_FREELANCER_PK || "").trim();

  const onClick = async () => {
    if (!selectedEscrow) {
      toast.error("Select a project first.");
      return;
    }
    if (!walletAddress) {
      toast.error("Connect a wallet to continue.");
      return;
    }
    if (!freelancerPk) {
      toast.error("NEXT_PUBLIC_FREELANCER_PK is not configured.");
      return;
    }

    try {
      setIsSubmitting(true);

      const decimals =
        Number(selectedEscrow.trustline?.decimals ?? 10000000) || 10000000;

      // Build roles to send based on the actual keys present
      // on the selected escrow. This avoids sending extra keys
      // that an older on-chain contract version may not accept.
      const originalRoleKeys = Object.keys(selectedEscrow.roles || {});
      const rolesToSend: Record<string, string> = {};
      for (const key of originalRoleKeys) {
        if (key === "receiver" || key === "serviceProvider") {
          rolesToSend[key] = freelancerPk;
        } else {
          rolesToSend[key] = (selectedEscrow.roles as Record<string, string>)[
            key
          ];
        }
      }

      if (selectedEscrow.type === "multi-release") {
        const payload: UpdateMultiReleaseEscrowPayload = {
          contractId: selectedEscrow.contractId || "",
          signer: walletAddress,
          escrow: {
            engagementId: selectedEscrow.engagementId || "",
            title: selectedEscrow.title || "",
            description: selectedEscrow.description || "",
            platformFee: Number(selectedEscrow.platformFee ?? 0),
            receiverMemo: selectedEscrow.receiverMemo
              ? Number(selectedEscrow.receiverMemo)
              : undefined,
            trustline: {
              address: (selectedEscrow.trustline?.address as string) || "",
              decimals,
            },
            roles: rolesToSend as unknown as UpdateMultiReleaseEscrowPayload["escrow"]["roles"],
            milestones: (selectedEscrow.milestones || []).map(
              (m: { description?: string; amount?: string | number }) => ({
                description: m?.description || "",
                amount: Number(m?.amount ?? 0),
              }),
            ),
          },
        };

        await updateEscrow.mutateAsync({
          payload,
          type: "multi-release",
          address: walletAddress,
        });

        const nextSelected: GetEscrowsFromIndexerResponse = {
          ...selectedEscrow,
          ...payload.escrow,
          trustline: {
            name:
              selectedEscrow.trustline?.name ||
              (selectedEscrow.trustline?.address as string) ||
              "",
            address: payload.escrow.trustline.address,
            decimals: payload.escrow.trustline.decimals,
          },
        } as unknown as GetEscrowsFromIndexerResponse;

        setSelectedEscrow(nextSelected);
      } else {
        const payload: UpdateSingleReleaseEscrowPayload = {
          contractId: selectedEscrow.contractId || "",
          signer: walletAddress,
          escrow: {
            engagementId: selectedEscrow.engagementId || "",
            title: selectedEscrow.title || "",
            description: selectedEscrow.description || "",
            platformFee: Number(selectedEscrow.platformFee ?? 0),
            amount: Number(
              (selectedEscrow as unknown as { amount?: number }).amount ?? 0,
            ),
            receiverMemo: selectedEscrow.receiverMemo
              ? Number(selectedEscrow.receiverMemo)
              : undefined,
            trustline: {
              address: (selectedEscrow.trustline?.address as string) || "",
              decimals,
            },
            roles: rolesToSend as unknown as UpdateSingleReleaseEscrowPayload["escrow"]["roles"],
            milestones: (selectedEscrow.milestones || []).map(
              (m: { description?: string }) => ({
                description: m?.description || "",
              }),
            ),
          },
        };

        await updateEscrow.mutateAsync({
          payload,
          type: "single-release",
          address: walletAddress,
        });

        const nextSelected: GetEscrowsFromIndexerResponse = {
          ...selectedEscrow,
          ...payload.escrow,
          trustline: {
            name:
              selectedEscrow.trustline?.name ||
              (selectedEscrow.trustline?.address as string) ||
              "",
            address: payload.escrow.trustline.address,
            decimals: payload.escrow.trustline.decimals,
          },
        } as unknown as GetEscrowsFromIndexerResponse;

        setSelectedEscrow(nextSelected);
      }

      toast.success(
        "Roles updated: receiver + service provider set to freelancer",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update roles";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isSubmitting || disabled}
      className="w-full"
      variant="secondary"
    >
      <Wrench className="mr-2 h-4 w-4" />
      {isSubmitting ? "Updating Roles..." : "Fix Roles (Set Freelancer)"}
    </Button>
  );
};

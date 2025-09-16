"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInitializeEscrowSchema } from "./schema";
import { z } from "zod";
import {
  InitializeMultiReleaseEscrowPayload,
  InitializeMultiReleaseEscrowResponse,
} from "@trustless-work/escrow/types";
import { toast } from "sonner";
// Import the new hook for secret key signing
import { useEscrowsMutationsWithSecretKey } from "@/components/tw-blocks/tanstack/useEscrowsMutationsWithSecretKey";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";
import { Keypair } from "@stellar/stellar-sdk";

type OnSuccessCallback = (
  escrow: InitializeMultiReleaseEscrowPayload & { contractId: string },
) => void;

export function useKoopayInitializeEscrow({
  onSuccess,
}: { onSuccess?: OnSuccessCallback } = {}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { getMultiReleaseFormSchema } = useInitializeEscrowSchema();
  const formSchema = getMultiReleaseFormSchema();
  const { setSelectedEscrow } = useEscrowContext();

  const adminPk = process.env.NEXT_PUBLIC_ADMIN_PK || "";
  const freelancerPk = process.env.NEXT_PUBLIC_FREELANCER_PK || "";
  const platformFeeEnv = process.env.NEXT_PUBLIC_PLATFORM_FEE || "";
  const contractorSk = process.env.NEXT_PUBLIC_CONTRACTOR_SK || "";

  // Use the new mutation hook
  const { deployEscrow } = useEscrowsMutationsWithSecretKey();

  const contractorPk = React.useMemo(() => {
    if (!contractorSk) return "";
    try {
      return Keypair.fromSecret(contractorSk).publicKey();
    } catch {
      console.error("Invalid contractor secret key");
      return "";
    }
  }, [contractorSk]);

  const generateEngagementId = () => `eng-${Date.now()}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      engagementId: generateEngagementId(),
      title: "",
      description: "",
      platformFee: platformFeeEnv,
      receiverMemo: "",
      trustline: {
        address: trustlineOptions.find((t) => t.label === "USDC")?.value || "",
        decimals: 10000000,
      },
      roles: {
        approver: contractorPk || "",
        serviceProvider: freelancerPk,
        platformAddress: adminPk,
        receiver: freelancerPk,
        releaseSigner: adminPk,
        disputeResolver: adminPk,
      },
      milestones: [{ description: "", amount: "" }],
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    // keep env-derived roles in sync if env values change at runtime
    if (adminPk) {
      form.setValue("roles.platformAddress", adminPk);
      form.setValue("roles.releaseSigner", adminPk);
      form.setValue("roles.disputeResolver", adminPk);
    }
    if (freelancerPk) {
      form.setValue("roles.serviceProvider", freelancerPk);
      form.setValue("roles.receiver", freelancerPk);
    }
    form.setValue("roles.approver", contractorPk || "");
  }, [adminPk, freelancerPk, contractorPk, form]);

  const milestones = form.watch("milestones");
  const isAnyMilestoneEmpty = milestones.some(
    (milestone) => milestone.description === "",
  );

  const handleAddMilestone = () => {
    const currentMilestones = form.getValues("milestones");
    form.setValue("milestones", [
      ...currentMilestones,
      { description: "", amount: "" },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    const currentMilestones = form.getValues("milestones");
    form.setValue(
      "milestones",
      currentMilestones.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = form.handleSubmit(async (payload) => {
    setIsSubmitting(true);
    try {
      if (!adminPk || !freelancerPk) {
        toast.error("Admin (Koopay) or Freelancer key is not configured.");
        return;
      }
      if (!contractorSk || !contractorPk) {
        toast.error(
          "Contractor secret key (NEXT_PUBLIC_CONTRACTOR_SK) is invalid or missing.",
        );
        return;
      }

      const finalPayload: InitializeMultiReleaseEscrowPayload = {
        ...payload,
        platformFee:
          typeof payload.platformFee === "string"
            ? Number(payload.platformFee)
            : payload.platformFee,
        receiverMemo:
          payload.receiverMemo !== undefined && payload.receiverMemo !== ""
            ? Number(payload.receiverMemo)
            : undefined,
        signer: contractorPk,
        roles: {
          approver: contractorPk,
          serviceProvider: freelancerPk,
          platformAddress: adminPk,
          receiver: freelancerPk,
          releaseSigner: adminPk,
          disputeResolver: adminPk,
        },
        milestones: payload.milestones.map((milestone) => ({
          ...milestone,
          amount:
            typeof milestone.amount === "string"
              ? Number(milestone.amount)
              : milestone.amount,
        })),
      };

      const response = (await deployEscrow.mutateAsync({
        payload: finalPayload,
        type: "multi-release",
        secretKey: contractorSk,
      })) as InitializeMultiReleaseEscrowResponse;

      toast.success("Project created successfully!");
      const newEscrow = { ...finalPayload, contractId: response.contractId };

      if (onSuccess) {
        onSuccess(newEscrow);
      } else {
        setSelectedEscrow(newEscrow);
        form.reset();
      }
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    isSubmitting,
    milestones,
    isAnyMilestoneEmpty,
    handleSubmit,
    handleAddMilestone,
    handleRemoveMilestone,
  };
}

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
import { useWalletContext } from "@/components/tw-blocks/wallet-kit/WalletProvider";
import { useEscrowsMutations } from "@/components/tw-blocks/tanstack/useEscrowsMutations";
import {
  ErrorResponse,
  handleError,
} from "@/components/tw-blocks/handle-errors/handle";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";

export function useInitializeEscrow() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { getMultiReleaseFormSchema } = useInitializeEscrowSchema();
  const formSchema = getMultiReleaseFormSchema();
  const { setSelectedEscrow } = useEscrowContext();

  const { walletAddress } = useWalletContext();
  const adminPk = process.env.NEXT_PUBLIC_ADMIN_PK || "";
  const platformFeeEnv = process.env.NEXT_PUBLIC_PLATFORM_FEE || "";
  const { deployEscrow } = useEscrowsMutations();

  const generateEngagementId = () => {
    try {
      // Prefer crypto.randomUUID when available
      if (typeof crypto !== "undefined" && crypto?.randomUUID) {
        return crypto.randomUUID();
      }
    } catch {}
    return `eng-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  };

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
        approver: walletAddress || "",
        serviceProvider: adminPk,
        platformAddress: adminPk,
        receiver: adminPk,
        releaseSigner: adminPk,
        disputeResolver: adminPk,
      },
      milestones: [{ description: "", amount: "" }],
    },
    mode: "onChange",
  });

  // Keep roles in sync: contractor from wallet, Koopay/admin from env
  React.useEffect(() => {
    form.setValue("roles.approver", walletAddress || "");
  }, [walletAddress, form]);

  React.useEffect(() => {
    if (adminPk) {
      form.setValue("roles.serviceProvider", adminPk);
      form.setValue("roles.platformAddress", adminPk);
      form.setValue("roles.receiver", adminPk);
      form.setValue("roles.releaseSigner", adminPk);
      form.setValue("roles.disputeResolver", adminPk);
    }
  }, [adminPk, form]);

  const milestones = form.watch("milestones");
  const isAnyMilestoneEmpty = milestones.some(
    (milestone) => milestone.description === "",
  );

  const handleAddMilestone = () => {
    const currentMilestones = form.getValues("milestones");
    const updatedMilestones = [
      ...currentMilestones,
      { description: "", amount: "" },
    ];
    form.setValue("milestones", updatedMilestones);
  };

  const handleRemoveMilestone = (index: number) => {
    const currentMilestones = form.getValues("milestones");
    const updatedMilestones = currentMilestones.filter((_, i) => i !== index);
    form.setValue("milestones", updatedMilestones);
  };

  const fillTemplateForm = () => {
    const usdc = trustlineOptions.find((t) => t.label === "USDC");

    const templateData: z.infer<typeof formSchema> = {
      engagementId: generateEngagementId(),
      title: "Design Landing Page",
      description: "Landing for the new product of the company.",
      platformFee: platformFeeEnv || 5,
      receiverMemo: "123",
      trustline: {
        address: usdc?.value || "",
        decimals: 10000000,
      },
      roles: {
        approver: walletAddress || "",
        serviceProvider: adminPk,
        platformAddress: adminPk,
        receiver: adminPk,
        releaseSigner: adminPk,
        disputeResolver: adminPk,
      },
      milestones: [
        { description: "Design the wireframe", amount: 2 },
        { description: "Develop the wireframe", amount: 2 },
        { description: "Deploy the wireframe", amount: 2 },
      ],
    };

    // Set form values
    Object.entries(templateData).forEach(([key, value]) => {
      form.setValue(key as keyof z.infer<typeof formSchema>, value);
    });

    // Explicitly set the trustline field
    form.setValue("trustline.address", usdc?.value || "");
    form.setValue("trustline.decimals", 10000000);
  };

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      if (!adminPk) {
        toast.error(
          "Koopay admin key (NEXT_PUBLIC_ADMIN_PK) is not configured.",
        );
        setIsSubmitting(false);
        return;
      }
      if (!platformFeeEnv) {
        toast.error(
          "Platform fee (NEXT_PUBLIC_PLATFORM_FEE) is not configured.",
        );
        setIsSubmitting(false);
        return;
      }

      /**
       * Create the final payload for the initialize escrow mutation
       *
       * @param payload - The payload from the form
       * @returns The final payload for the initialize escrow mutation
       */
      const finalPayload: InitializeMultiReleaseEscrowPayload = {
        ...payload,
        platformFee:
          typeof payload.platformFee === "string"
            ? Number(payload.platformFee)
            : payload.platformFee,
        receiverMemo: Number(payload.receiverMemo) ?? 0,
        signer: walletAddress || "",
        roles: {
          approver: walletAddress || "",
          serviceProvider: adminPk,
          platformAddress: adminPk,
          receiver: adminPk,
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

      /**
       * Call the initialize escrow mutation
       *
       * @param payload - The final payload for the initialize escrow mutation
       * @param type - The type of the escrow
       * @param address - The address of the escrow
       */
      const response: InitializeMultiReleaseEscrowResponse =
        (await deployEscrow.mutateAsync({
          payload: finalPayload,
          type: "multi-release",
          address: walletAddress || "",
        })) as InitializeMultiReleaseEscrowResponse;

      toast.success("Escrow initialized successfully");

      setSelectedEscrow({ ...finalPayload, contractId: response.contractId });
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
    } finally {
      setIsSubmitting(false);
      form.reset();
      // Reapply configured defaults after reset
      form.setValue("engagementId", generateEngagementId());
      form.setValue("platformFee", platformFeeEnv);
      const usdc = trustlineOptions.find((t) => t.label === "USDC");
      form.setValue("trustline.address", usdc?.value || "");
      form.setValue("trustline.decimals", 10000000);
    }
  });

  return {
    form,
    isSubmitting,
    milestones,
    isAnyMilestoneEmpty,
    fillTemplateForm,
    handleSubmit,
    handleAddMilestone,
    handleRemoveMilestone,
  };
}

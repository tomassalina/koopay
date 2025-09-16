"use client";

import React, { useState, useMemo } from "react";
import { KoopayCreateProjectForm } from "./KoopayCreateProjectForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useEscrowsMutationsWithSecretKey } from "@/components/tw-blocks/tanstack/useEscrowsMutationsWithSecretKey";
import { toast } from "sonner";
import type {
  MultiReleaseMilestone,
  FundEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
} from "@trustless-work/escrow/types";
import {
  handleError,
  ErrorResponse,
} from "@/components/tw-blocks/handle-errors/handle";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/components/tw-blocks/helpers/format.helper";
import { Keypair } from "@stellar/stellar-sdk";

export const ProjectOnboarding = () => {
  const [step, setStep] = useState<"create" | "processing" | "complete">(
    "create",
  );
  const [, setIsProcessing] = useState(false);

  const { fundEscrow } = useEscrowsMutationsWithSecretKey();
  const contractorSk = process.env.NEXT_PUBLIC_CONTRACTOR_SK || "";

  const contractorPk = useMemo(() => {
    if (!contractorSk) return "";
    try {
      return Keypair.fromSecret(contractorSk).publicKey();
    } catch {
      console.error("Invalid contractor secret key");
      return "";
    }
  }, [contractorSk]);

  const handleProjectCreatedAndFund = async (
    escrow: InitializeMultiReleaseEscrowPayload & { contractId: string },
  ) => {
    setIsProcessing(true);
    setStep("processing");

    const totalAmount = (escrow.milestones as MultiReleaseMilestone[]).reduce(
      (acc, ms) => acc + Number(ms.amount || 0),
      0,
    );

    // @ts-expect-error name
    const currency = escrow.trustline?.name || "USDC";

    if (!contractorSk || !contractorPk) {
      toast.error(
        "Contractor secret key (NEXT_PUBLIC_CONTRACTOR_SK) is not configured correctly.",
      );
      setIsProcessing(false);
      setStep("create");
      return;
    }

    if (!escrow.contractId || totalAmount <= 0) {
      toast.error("Cannot fund project. Missing information.");
      setIsProcessing(false);
      setStep("create");
      return;
    }

    try {
      const payload: FundEscrowPayload = {
        amount: totalAmount,
        contractId: escrow.contractId,
        signer: contractorPk,
      };

      await fundEscrow.mutateAsync({
        payload,
        type: "multi-release",
        secretKey: contractorSk,
      });

      toast.success(
        `Project created and funded successfully with ${formatCurrency(
          totalAmount,
          currency,
        )}.`,
      );
      setStep("complete");
    } catch (error) {
      toast.error(handleError(error as ErrorResponse).message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === "create") {
    return <KoopayCreateProjectForm onSuccess={handleProjectCreatedAndFund} />;
  }

  if (step === "processing") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Processing Project</CardTitle>
          <CardDescription>
            Your project is being created and funded. Please wait.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (step === "complete") {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>🎉 Project Funded! 🎉</CardTitle>
          <CardDescription>
            You can now manage your project from the projects page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return null;
};

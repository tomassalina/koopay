// lib/hooks/useFullProjectCreation.ts
"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Keypair } from "@stellar/stellar-sdk";
import { useEscrowsMutationsWithSecretKey } from "@/components/tw-blocks/tanstack/useEscrowsMutationsWithSecretKey";
import { useContractGeneration } from "./useContractGeneration";
import type {
  InitializeMultiReleaseEscrowPayload,
  InitializeMultiReleaseEscrowResponse,
  FundEscrowPayload,
} from "@trustless-work/escrow/types";
import {
  handleError,
  ErrorResponse,
} from "@/components/tw-blocks/handle-errors/handle";

// Re-using the interface from the original hook
interface ProjectData {
  title: string;
  description: string;
  total_amount: number;
  expected_delivery_date: string;
  freelancer_id?: string | null;
  milestones: Array<{
    title: string;
    description: string;
    percentage: number;
  }>;
}

export function useFullProjectCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const { deployEscrow, fundEscrow } = useEscrowsMutationsWithSecretKey();
  const {} = useContractGeneration();

  // Environment variables
  const adminPk = process.env.NEXT_PUBLIC_ADMIN_PK || "";
  const freelancerPk = process.env.NEXT_PUBLIC_FREELANCER_PK || "";
  const contractorSk = process.env.NEXT_PUBLIC_CONTRACTOR_SK || "";
  const platformFeeEnv = process.env.NEXT_PUBLIC_PLATFORM_FEE || "5";

  const contractorPk = useMemo(() => {
    if (!contractorSk) return "";
    try {
      return Keypair.fromSecret(contractorSk).publicKey();
    } catch {
      console.error("Invalid contractor secret key from .env");
      return "";
    }
  }, [contractorSk]);

  const createAndFundProject = async (data: ProjectData) => {
    setIsLoading(true);
    setError(null);

    // --- Validations ---
    if (!adminPk || !freelancerPk) {
      const msg = "Admin (Koopay) or Freelancer key is not configured in .env";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
    if (!contractorSk || !contractorPk) {
      const msg =
        "Contractor secret key (NEXT_PUBLIC_CONTRACTOR_SK) is invalid or missing.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }

    try {
      // --- 1. Deploy Escrow Contract ---
      const engagementId = `eng-${Date.now()}`;
      const deployPayload: InitializeMultiReleaseEscrowPayload = {
        engagementId,
        title: data.title,
        description: data.description,
        platformFee: Number(platformFeeEnv),
        signer: contractorPk,
        trustline: {
          address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA", // USDC Testnet
          decimals: 10000000,
        },
        roles: {
          approver: contractorPk,
          serviceProvider: freelancerPk,
          platformAddress: adminPk,
          receiver: freelancerPk,
          releaseSigner: adminPk,
          disputeResolver: adminPk,
        },
        milestones: data.milestones.map((m) => ({
          description: m.title,
          amount: data.total_amount * (m.percentage / 100),
        })),
      };

      toast.info("Deploying project contract...");
      const deployResponse = (await deployEscrow.mutateAsync({
        payload: deployPayload,
        type: "multi-release",
        secretKey: contractorSk,
      })) as InitializeMultiReleaseEscrowResponse;

      const contractId = deployResponse.contractId;
      toast.success("Contract deployed successfully!");

      // --- 2. Fund Escrow Contract ---
      const fundPayload: FundEscrowPayload = {
        amount: data.total_amount,
        contractId,
        signer: contractorPk,
      };

      toast.info("Funding project...");
      await fundEscrow.mutateAsync({
        payload: fundPayload,
        type: "multi-release",
        secretKey: contractorSk,
      });
      toast.success("Project funded!");

      // --- 3. Save to Supabase (adapted from useProjectCreation) ---
      toast.info("Saving project to database...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          contractor_id: user.id,
          freelancer_id: data.freelancer_id,
          title: data.title,
          description: data.description,
          total_amount: data.total_amount,
          expected_delivery_date: data.expected_delivery_date,
          status: "active", // Project is active since it's funded
          // Store the on-chain contract ID
          contact_id: contractId,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const milestonesData = data.milestones.map((m) => ({
        project_id: project.id,
        title: m.title,
        description: m.description,
        percentage: m.percentage,
        status: "pending" as const,
      }));

      const { error: milestonesError } = await supabase
        .from("milestones")
        .insert(milestonesData);
      if (milestonesError) throw milestonesError;

      toast.success("Project saved successfully!");
      setIsLoading(false);
      return { success: true, project };
    } catch (error) {
      const errorMessage = handleError(error as ErrorResponse).message;
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { createAndFundProject, isLoading, error };
}

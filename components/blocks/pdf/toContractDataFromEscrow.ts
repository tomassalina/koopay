import type { ContractData, Milestone } from "./contract-types";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

export function toContractDataFromEscrow(escrow: Escrow): ContractData {
  const approver = escrow.roles?.approver || "";
  const serviceProvider =
    escrow.roles?.serviceProvider || escrow.roles?.receiver || "";
  const currency = escrow.trustline?.name || "XLM";

  const milestones: Milestone[] = (escrow.milestones || []).map(
    (m: { description?: string; amount?: string | number }, i) => ({
      title: `Milestone ${i + 1}`,
      description: m.description || "",
      amount: Number(m.amount ?? 0),
    }),
  );

  const totalAmount =
    escrow.type === "single-release"
      ? Number(escrow.amount ?? 0)
      : milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const data: ContractData = {
    contractTitle: "Service Agreement",
    contractId: escrow.contractId || undefined,
    contractor: {
      name: approver || "—",
    },
    freelancer: {
      name: serviceProvider || "—",
    },
    scopeOfWork: String(escrow.receiverMemo || ""),
    paymentCurrency: currency,
    totalAmount,
    milestones,
  };

  return data;
}

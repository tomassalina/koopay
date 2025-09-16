export type Party = {
  name: string
  email?: string
  company?: string
  address?: string
  title?: string
}

export type Milestone = {
  title: string
  description?: string
  amount: number
  dueDate?: string
}

export type ContractData = {
  contractTitle: string
  contractor: Party
  freelancer: Party
  startDate?: string
  endDate?: string
  scopeOfWork: string
  paymentCurrency: string
  totalAmount: number
  milestones?: Milestone[]
  terms?: string
  signaturePlace?: string
  contractId?: string
}


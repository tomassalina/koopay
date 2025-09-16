"use client"

import { createContext, useContext, useState, ReactNode } from "react";

interface ContractorOnboardingData {
  contractorType: 'individual' | 'company';
  companyName?: string;
  legalName?: string;
  displayName?: string;
  fullName?: string;
  individualId?: string;
  businessId?: string;
  country: string;
  address: string;
  website?: string;
  description?: string;
  logoFile?: File;
}

interface FreelancerOnboardingData {
  fullName: string;
  freelancerId: string; // DNI
  country: string;
  address: string;
  position: string;
  bio?: string;
  avatarFile?: File;
}

interface OnboardingContextType {
  contractorData: Partial<ContractorOnboardingData>;
  updateContractorData: (data: Partial<ContractorOnboardingData>) => void;
  clearContractorData: () => void;
  freelancerData: Partial<FreelancerOnboardingData>;
  updateFreelancerData: (data: Partial<FreelancerOnboardingData>) => void;
  clearFreelancerData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [contractorData, setContractorData] = useState<Partial<ContractorOnboardingData>>({});
  const [freelancerData, setFreelancerData] = useState<Partial<FreelancerOnboardingData>>({});

  const updateContractorData = (data: Partial<ContractorOnboardingData>) => {
    setContractorData(prev => ({ ...prev, ...data }));
  };

  const clearContractorData = () => {
    setContractorData({});
  };

  const updateFreelancerData = (data: Partial<FreelancerOnboardingData>) => {
    setFreelancerData(prev => ({ ...prev, ...data }));
  };

  const clearFreelancerData = () => {
    setFreelancerData({});
  };

  return (
    <OnboardingContext.Provider value={{
      contractorData,
      updateContractorData,
      clearContractorData,
      freelancerData,
      updateFreelancerData,
      clearFreelancerData
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}

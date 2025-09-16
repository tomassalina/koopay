"use client"

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

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

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const uploadLogo = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const createContractorProfile = async (data: ContractorOnboardingData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Upload logo if provided
      let logoUrl: string | null = null;
      if (data.logoFile) {
        logoUrl = await uploadLogo(data.logoFile, user.id);
      }

      // Update user role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'contractor'
        });

      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }

      // Create contractor profile
      const contractorProfileData = {
        id: user.id,
        contractor_type: data.contractorType,
        country: data.country,
        address: data.address,
        logo_url: logoUrl,
        ...(data.contractorType === 'individual' ? {
          full_name: data.fullName,
          individual_id: data.individualId
        } : {
          legal_name: data.legalName,
          display_name: data.displayName,
          business_id: data.businessId,
          website_url: data.website
        })
      };

      const { error: contractorError } = await supabase
        .from('contractor_profiles')
        .upsert(contractorProfileData);

      if (contractorError) {
        throw new Error(`Error creating contractor profile: ${contractorError.message}`);
      }

      console.log('Contractor profile created successfully:', contractorProfileData);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating contractor profile:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const createFreelancerProfile = async (data: FreelancerOnboardingData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Upload avatar if provided
      let avatarUrl: string | null = null;
      if (data.avatarFile) {
        avatarUrl = await uploadAvatar(data.avatarFile, user.id);
      }

      // Update user role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'freelancer'
        });

      if (profileError) {
        throw new Error(`Error updating profile: ${profileError.message}`);
      }

      // Create freelancer profile
      const freelancerProfileData = {
        id: user.id,
        full_name: data.fullName,
        freelancer_id: data.freelancerId,
        country: data.country,
        address: data.address,
        position: data.position,
        bio: data.bio || null,
        avatar_url: avatarUrl
      };

      const { error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .upsert(freelancerProfileData);

      if (freelancerError) {
        throw new Error(`Error creating freelancer profile: ${freelancerError.message}`);
      }

      console.log('Freelancer profile created successfully:', freelancerProfileData);
      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating freelancer profile:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createContractorProfile,
    createFreelancerProfile,
    isLoading,
    error
  };
}

"use client";

import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/contexts/OnboardingContext";
import { useOnboarding } from "@/lib/hooks/useOnboarding";

export default function ContractorOptionalData() {
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const router = useRouter();
  const { contractorData, updateContractorData, clearContractorData } =
    useOnboardingContext();
  const { createContractorProfile, isLoading, error } = useOnboarding();

  const handleNext = async () => {
    // Update context with optional data
    updateContractorData({
      description: description || undefined,
      logoFile: logoFile || undefined,
    });

    // Create contractor profile in Supabase
    const completeData = {
      ...contractorData,
      description: description || undefined,
      logoFile: logoFile || undefined,
      contractorType: contractorData.contractorType || ("individual" as const),
      country: contractorData.country || "",
      address: contractorData.address || "",
    };

    const result = await createContractorProfile(completeData);

    if (result.success) {
      clearContractorData();
      router.push("/");
    } else {
      console.error("Error completing onboarding:", result.error);
    }
  };

  const handleSkip = async () => {
    // Skip optional data but still complete onboarding
    const completeData = {
      ...contractorData,
      description: undefined,
      logoFile: undefined,
      contractorType: contractorData.contractorType || ("individual" as const),
      country: contractorData.country || "",
      address: contractorData.address || "",
    };

    const result = await createContractorProfile(completeData);

    if (result.success) {
      clearContractorData();
      router.push("/");
    } else {
      console.error("Error completing onboarding:", result.error);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/contractor/personal-data");
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      console.log("Logo uploaded:", file.name);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col px-6 py-8">
      {/* Header with Back button and Progress */}
      <div className="flex items-center justify-between mb-16">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/10 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <ProgressIndicator currentStep={3} totalSteps={3} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start max-w-2xl mx-auto w-full">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-16">Optional Data</h1>

        {/* Form Fields */}
        <div className="space-y-6 mb-16">
          {/* Brief description */}
          <div>
            <textarea
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          {/* Upload logo */}
          <div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 gap-2 py-4"
            >
              <Upload className="h-5 w-5" />
              Upload logo (optional)
            </Button>
            {logoFile && (
              <p className="text-green-400 text-sm mt-2">
                Logo selected: {logoFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="ghost"
          onClick={handleSkip}
          disabled={isLoading}
          className="text-white hover:bg-white/10 px-8 py-3 text-lg disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Skip"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg gap-2 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Next"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </main>
  );
}

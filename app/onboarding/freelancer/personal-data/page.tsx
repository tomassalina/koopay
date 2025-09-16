"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/contexts/OnboardingContext";

export default function FreelancerPersonalData() {
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");

  const router = useRouter();
  const { updateFreelancerData } = useOnboardingContext();

  const handleNext = () => {
    // Save personal data to context
    const personalData = {
      fullName,
      freelancerId: dni,
      country,
      address,
    };

    updateFreelancerData(personalData);
    router.push("/onboarding/freelancer/professional-profile");
  };

  const handleBack = () => {
    router.push("/onboarding");
  };

  return (
    <main className="min-h-screen bg-black flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-16">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/10 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <ProgressIndicator currentStep={1} totalSteps={2} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-start max-w-2xl mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Personal Data</h1>
          <p className="text-white/80 text-lg">
            Complete your basic personal information
          </p>
        </div>

        <div className="space-y-6 mb-16">
          {/* Full Name */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Full Name *
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="E.g: John Smith Garcia"
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* DNI */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              DNI *
            </label>
            <Input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 12345678"
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Country *
            </label>
            <div className="relative">
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="E.g: Colombia"
                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 pr-10"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Address *
            </label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="E.g: 123 Main St, New York"
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!fullName || !dni || !country || !address}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 gap-2 disabled:opacity-50"
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}

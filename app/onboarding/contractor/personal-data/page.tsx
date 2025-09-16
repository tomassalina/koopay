"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContractorPersonalData() {
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [legalAddress, setLegalAddress] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [website, setWebsite] = useState('');

  const router = useRouter();

  const handleNext = () => {
    // TODO: Save personal data and navigate to next step
    console.log('Personal Data:', { companyName, country, legalAddress, businessId, website });
    router.push('/onboarding/contractor/optional-data');
  };

  const handleSkip = () => {
    // TODO: Handle skip logic
    console.log('Skipping personal data');
    router.push('/onboarding/contractor/optional-data');
  };

  const handleBack = () => {
    router.push('/onboarding/contractor');
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

        <ProgressIndicator currentStep={2} totalSteps={3} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start max-w-2xl mx-auto w-full">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-16">
          Datos personales
        </h1>

        {/* Form Fields */}
        <div className="space-y-6 mb-16">
          {/* Nombre legal de tu empresa */}
          <div>
            <Input
              type="text"
              placeholder="Nombre legal de tu empresa *"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-auto"
            />
          </div>

          {/* País en la que se ubica tu empresa */}
          <div className="relative">
            <Input
              type="text"
              placeholder="País en la que se ubica tu empresa *"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-auto pr-10"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 pointer-events-none" />
          </div>

          {/* Dirección legal */}
          <div>
            <Input
              type="text"
              placeholder="Dirección legal *"
              value={legalAddress}
              onChange={(e) => setLegalAddress(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-auto"
            />
          </div>

          {/* Bussiness ID and Website */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Bussiness ID *"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-auto"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-white hover:bg-white/10 px-8 py-3 text-lg"
        >
          Omitir
        </Button>
        <Button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg gap-2"
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}

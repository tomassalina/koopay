"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/contexts/OnboardingContext";

export default function ContractorOnboarding() {
  const [contractorType, setContractorType] = useState<
    "persona-juridica" | "empresa"
  >("empresa");
  const router = useRouter();
  const { updateContractorData } = useOnboardingContext();

  const handleNext = () => {
    // Save contractor type to context
    const mappedType =
      contractorType === "persona-juridica" ? "individual" : "company";
    updateContractorData({ contractorType: mappedType });
    router.push("/onboarding/contractor/personal-data");
  };

  const handleBack = () => {
    router.push("/onboarding");
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

        <ProgressIndicator currentStep={1} totalSteps={3} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-start max-w-4xl mx-auto w-full">
        {/* Title and Subtitle */}
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Tipo de contratista
          </h1>
          <p className="text-white/80 text-lg">
            Selecciona el tipo de contratista que eres
          </p>
        </div>

        {/* Options - Side by side layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Legal entity */}
          <Card
            className={`cursor-pointer transition-all duration-300 h-full ${
              contractorType === "persona-juridica"
                ? "ring-2 ring-blue-500 bg-blue-500/10"
                : "bg-gray-900/50 hover:bg-gray-900/70"
            }`}
            onClick={() => setContractorType("persona-juridica")}
          >
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div className="text-center mb-6">
                <h3 className="text-white text-xl font-medium mb-4">
                  Legal Entity
                </h3>
                <p className="text-white/60 text-sm">
                  For independent professionals and legal entities
                </p>
              </div>

              <Button
                className={`w-full gap-2 ${
                  contractorType === "persona-juridica"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-purple-800 hover:bg-purple-700 text-white"
                }`}
              >
                Legal Entity
                {contractorType === "persona-juridica" && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card
            className={`cursor-pointer transition-all duration-300 h-full ${
              contractorType === "empresa"
                ? "ring-2 ring-blue-500 bg-blue-500/10"
                : "bg-gray-900/50 hover:bg-gray-900/70"
            }`}
            onClick={() => setContractorType("empresa")}
          >
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div className="text-center mb-6">
                <h3 className="text-white text-xl font-medium mb-4">Empresa</h3>
                <p className="text-white/60 text-sm">
                  Para empresas y organizaciones establecidas
                </p>
              </div>

              <Button
                className={`w-full gap-2 ${
                  contractorType === "empresa"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-purple-800 hover:bg-purple-700 text-white"
                }`}
              >
                Empresa
                {contractorType === "empresa" && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer with Next Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 gap-2"
        >
          Siguiente
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
}

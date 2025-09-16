"use client"

import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FreelancerOnboarding() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/onboarding');
  };

  return (
    <main className="min-h-screen bg-black flex flex-col px-6 py-8">
      {/* Header with Back button and Progress */}
      <div className="flex items-center justify-between mb-12">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-white mb-12">
          Freelancer Onboarding
        </h1>
        
        <p className="text-white/80 text-lg">
          Esta sección está en desarrollo. Pronto tendrás acceso al onboarding completo para freelancers.
        </p>
      </div>
    </main>
  );
}

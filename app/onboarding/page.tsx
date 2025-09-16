"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'contractor' | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // Navigate to specific onboarding flow based on selected role
    if (selectedRole === 'contractor') {
      router.push('/onboarding/contractor');
    } else if (selectedRole === 'freelancer') {
      router.push('/onboarding/freelancer');
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12">
        <Image 
          src="/logo.svg" 
          alt="Koopay" 
          width={174}
          height={48}
          className="h-12 w-auto"
        />
      </div>

      {/* Main Question */}
      <h1 className="text-3xl font-bold text-white text-center mb-12">
        Como quieres utilizar la app?
      </h1>

      {/* Role Selection Cards */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
        {/* Freelancer Card */}
        <Card 
          className={`flex-1 cursor-pointer transition-all duration-300 ${
            selectedRole === 'freelancer' 
              ? 'ring-2 ring-blue-500 bg-purple-900/30' 
              : 'bg-purple-900/20 hover:bg-purple-900/30'
          }`}
          onClick={() => setSelectedRole('freelancer')}
        >
          <CardContent className="p-8 text-center h-80 flex flex-col justify-between">
            {/* Image placeholder area - ready for future image */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-white/60 text-sm">Image placeholder</span>
              </div>
            </div>
            
            {/* Text content */}
            <div className="space-y-4">
              <p className="text-white text-lg">
                Soy freelancer y quiero recibir pagos
              </p>
              <Button 
                className={`w-full gap-2 ${
                  selectedRole === 'freelancer'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                    : 'bg-purple-800 hover:bg-purple-700 text-white'
                }`}
              >
                Freelancer
                {selectedRole === 'freelancer' && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contractor Card */}
        <Card 
          className={`flex-1 cursor-pointer transition-all duration-300 ${
            selectedRole === 'contractor' 
              ? 'ring-2 ring-blue-500 bg-purple-900/30' 
              : 'bg-purple-900/20 hover:bg-purple-900/30'
          }`}
          onClick={() => setSelectedRole('contractor')}
        >
          <CardContent className="p-8 text-center h-80 flex flex-col justify-between">
            {/* Image placeholder area - ready for future image */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-white/60 text-sm">Image placeholder</span>
              </div>
            </div>
            
            {/* Text content */}
            <div className="space-y-4">
              <p className="text-white text-lg">
                Soy Contratista y quiero enviar pagos
              </p>
              <Button 
                className={`w-full gap-2 ${
                  selectedRole === 'contractor'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white'
                    : 'bg-purple-800 hover:bg-purple-700 text-white'
                }`}
              >
                Contratista
                {selectedRole === 'contractor' && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Button - Only show when a role is selected */}
      {selectedRole && (
        <div className="mt-12">
          <Button 
            onClick={handleContinue}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg"
          >
            Continuar
          </Button>
        </div>
      )}
    </main>
  );
}

"use client"

import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContractorOptionalData() {
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const router = useRouter();

  const handleNext = () => {
    // TODO: Save optional data and complete onboarding
    console.log('Optional Data:', { description, logoFile });
    // For now, redirect to main app
    router.push('/');
  };

  const handleSkip = () => {
    // TODO: Skip optional data and complete onboarding
    console.log('Skipping optional data');
    // For now, redirect to main app
    router.push('/');
  };

  const handleBack = () => {
    router.push('/onboarding/contractor/personal-data');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      console.log('Logo uploaded:', file.name);
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
        <h1 className="text-4xl font-bold text-white mb-16">
          Datos opcionales
        </h1>

        {/* Form Fields */}
        <div className="space-y-6 mb-16">
          {/* Breve descripción */}
          <div>
            <textarea
              placeholder="Breve descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 rounded-lg p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          {/* Subir logo */}
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
              onClick={() => document.getElementById('logo-upload')?.click()}
              className="w-full bg-gray-800 border-gray-700 text-white hover:bg-gray-700 gap-2 py-4"
            >
              <Upload className="h-5 w-5" />
              Subir logo (opcional)
            </Button>
            {logoFile && (
              <p className="text-green-400 text-sm mt-2">
                Logo seleccionado: {logoFile.name}
              </p>
            )}
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

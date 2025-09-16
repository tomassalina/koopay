"use client";

import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/progress-indicator";
import { ArrowLeft, ArrowRight, Upload, User } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/contexts/OnboardingContext";
import { useOnboarding } from "@/lib/hooks/useOnboarding";

export default function FreelancerProfessionalProfile() {
  const [position, setPosition] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const router = useRouter();
  const { freelancerData, updateFreelancerData, clearFreelancerData } =
    useOnboardingContext();
  const { createFreelancerProfile, isLoading, error } = useOnboarding();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleNext = async () => {
    // Update context with professional data
    updateFreelancerData({
      position,
      bio: bio || undefined,
      avatarFile: avatarFile || undefined,
    });

    // Create freelancer profile in Supabase
    const completeData = {
      ...freelancerData,
      position,
      bio: bio || undefined,
      avatarFile: avatarFile || undefined,
      fullName: freelancerData.fullName || "",
      freelancerId: freelancerData.freelancerId || "",
      country: freelancerData.country || "",
      address: freelancerData.address || "",
    };

    const result = await createFreelancerProfile(completeData);

    if (result.success) {
      clearFreelancerData();
      router.push("/");
    } else {
      console.error("Error completing onboarding:", result.error);
    }
  };

  const handleSkip = async () => {
    // Skip professional data but still complete onboarding
    const completeData = {
      ...freelancerData,
      position,
      bio: undefined,
      avatarFile: undefined,
      fullName: freelancerData.fullName || "",
      freelancerId: freelancerData.freelancerId || "",
      country: freelancerData.country || "",
      address: freelancerData.address || "",
    };

    const result = await createFreelancerProfile(completeData);

    if (result.success) {
      clearFreelancerData();
      router.push("/");
    } else {
      console.error("Error completing onboarding:", result.error);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/freelancer/personal-data");
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
        <ProgressIndicator currentStep={2} totalSteps={2} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-start max-w-2xl mx-auto w-full">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Professional Profile
          </h1>
          <p className="text-white/80 text-lg">
            Complete your professional information
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {/* Position */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Position/Role *
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="E.g: Frontend Developer, UX Designer, etc."
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Professional Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your experience, skills and specialties..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                {avatarFile ? (
                  <Image
                    src={URL.createObjectURL(avatarFile)}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-500" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {avatarFile ? "Change photo" : "Upload photo"}
                </label>
                <p className="text-gray-500 text-xs mt-1">
                  JPG, PNG or GIF. Maximum 5MB
                </p>
              </div>
            </div>
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
          disabled={isLoading || !position}
          className="text-white hover:bg-white/10 px-8 py-3 text-lg disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Skip"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading || !position}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg gap-2 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Complete"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </main>
  );
}

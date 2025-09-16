import { OnboardingProvider } from "@/lib/contexts/OnboardingContext";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}

import { OptimizedBackground } from "@/components/optimized-background";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <OptimizedBackground>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </OptimizedBackground>
  );
}

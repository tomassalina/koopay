import { AuthLayout } from "@/components/auth-layout";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <AuthLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <SignUpForm />
      </div>
    </AuthLayout>
  );
}

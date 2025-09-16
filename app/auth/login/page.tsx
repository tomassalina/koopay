import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthLayout>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <LoginForm />
      </div>
    </AuthLayout>
  );
}

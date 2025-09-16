"use client";

import { ReactNode } from "react";
import { OptimizedBackground } from "./optimized-background";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <OptimizedBackground>
      <div className="min-h-screen flex">
        {/* Left Section - Login Form */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="w-full">{children}</div>
        </div>

        {/* Right Section - Branding */}
        <div className="w-1/2 items-center justify-center hidden md:flex items-left justify-top">
          <div className="text-left space-y-8">
            {/* Logo */}
            <Image src="/logo.svg" alt="Koopay Logo" width={174} height={48} />

            {/* Tagline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Secure payment for freelancers
              </h1>
            </div>

            <div>
              <Image
                src="/login-illustration.png"
                alt="Login Illustration"
                width={530}
                height={300}
              />
            </div>
          </div>
        </div>
      </div>
    </OptimizedBackground>
  );
}

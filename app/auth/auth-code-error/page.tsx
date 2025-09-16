"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <CardTitle className="text-white text-xl">Error de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/80 text-center">
            Hubo un problema con el proceso de autenticación.
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">Error: {error}</p>
              {errorDescription && (
                <p className="text-red-300 text-xs mt-1">{errorDescription}</p>
              )}
            </div>
          )}
          
          <p className="text-white/60 text-sm">
            Esto puede suceder por:
          </p>
          <ul className="text-white/60 text-sm space-y-2">
            <li>• El proceso de login fue interrumpido</li>
            <li>• Problemas de conexión temporales</li>
            <li>• Configuración de cookies del navegador</li>
            <li>• El estado de OAuth se perdió durante la redirección</li>
          </ul>
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Intentar de nuevo
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

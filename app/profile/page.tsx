import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WalletSection } from "@/components/wallet-section";
import { User, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const user = data.user;
  const wallet = user.user_metadata?.stellar_wallet;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user.user_metadata?.full_name || 'User'}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          {wallet && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✨ Stellar Wallet Active
            </Badge>
          )}
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Provider</label>
                <Badge variant="secondary" className="capitalize">
                  {user.app_metadata?.provider || 'email'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {user.id.slice(0, 8)}...
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Section */}
        <WalletSection />

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>About Your Wallet</CardTitle>
            <CardDescription>
              Your Stellar wallet was created automatically when you signed in with Google
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • <strong>Invisible Creation:</strong> Your wallet was generated deterministically from your Google account
            </p>
            <p>
              • <strong>Testnet Ready:</strong> Your wallet is funded with testnet XLM for testing
            </p>
            <p>
              • <strong>Secure:</strong> Your private key is derived from your Google account data
            </p>
            <p>
              • <strong>Recoverable:</strong> You can always recreate this wallet by logging in with the same Google account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

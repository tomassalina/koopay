import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";
import { StellarWalletManager } from "@/lib/stellar/wallet";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
  // Always redirect to onboarding after successful authentication
  const next = "/onboarding";

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}&error_description=${errorDescription}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Create Stellar wallet for Google users
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.app_metadata?.provider === 'google') {
          // Check if wallet already exists
          const existingWallet = user.user_metadata?.stellar_wallet;
          
          if (!existingWallet) {
            console.log('🌟 Creating invisible Stellar wallet for Google user...');
            const walletManager = new StellarWalletManager('testnet');
            
            // Get Google user ID from identity data or use email as fallback
            const googleIdentity = user.identities?.find(identity => identity.provider === 'google');
            const googleUserId = googleIdentity?.id || user.email || user.id;
            
            console.log('🔍 Using identifier:', googleUserId);
            
            // Create wallet from Google user ID
            const wallet = await walletManager.createAndFundWallet(
              googleUserId,
              'google'
            );
            
            // Save wallet to user metadata
            await supabase.auth.updateUser({
              data: {
                stellar_wallet: wallet
              }
            });
            
            console.log('✅ Stellar wallet created:', wallet.publicKey);
          }
        }
      } catch (walletError) {
        console.error('Error creating wallet:', walletError);
        // Don't fail the login if wallet creation fails
      }
      
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

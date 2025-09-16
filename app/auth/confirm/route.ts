import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { StellarWalletManager } from "@/lib/stellar/wallet";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Always redirect to onboarding after successful email verification
  const next = "/onboarding";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // Create Stellar wallet for email users after email verification
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if wallet already exists
          const existingWallet = user.user_metadata?.stellar_wallet;
          
          if (!existingWallet) {
            console.log('🌟 Creating invisible Stellar wallet for email user...');
            const walletManager = new StellarWalletManager('testnet');
            
            // Use email as the identifier for email-based users
            const userIdentifier = user.email || user.id;
            
            console.log('🔍 Using identifier:', userIdentifier);
            
            // Create wallet from email/user ID
            const wallet = await walletManager.createAndFundWallet(
              userIdentifier,
              'email'
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
        // Don't fail the email verification if wallet creation fails
      }
      
      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Check if user is authenticated and trying to access onboarding
  if (user && request.nextUrl.pathname.startsWith("/onboarding")) {
    const userId = user.sub;
    const userRole = user.user_metadata?.role;

    // If user has a role, check if they already completed onboarding
    if (userRole) {
      let hasCompletedOnboarding = false;

      try {
        if (userRole === "contractor") {
          // Check if user exists in contractor_profiles table
          const { data: contractorProfile, error } = await supabase
            .from("contractor_profiles")
            .select("id")
            .eq("id", userId)
            .single();

          hasCompletedOnboarding = !error && !!contractorProfile;
        } else if (userRole === "freelancer") {
          // Check if user exists in freelancer_profiles table
          const { data: freelancerProfile, error } = await supabase
            .from("freelancer_profiles")
            .select("id")
            .eq("id", userId)
            .single();

          hasCompletedOnboarding = !error && !!freelancerProfile;
        }

        // If user already completed onboarding, redirect to dashboard
        if (hasCompletedOnboarding) {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // Continue with normal flow if there's an error
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

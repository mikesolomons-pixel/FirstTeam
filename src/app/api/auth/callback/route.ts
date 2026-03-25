import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If the next param points to reset-password, redirect there
      const redirectTo = next.startsWith("/auth/reset-password")
        ? `${origin}/auth/reset-password`
        : `${origin}${next}`;
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+authenticate`);
}

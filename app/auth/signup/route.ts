import { NextRequest, NextResponse } from "next/server";
import { encodeNotice, getSafeRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirectPath(String(formData.get("next") ?? "/account"));

  if (!fullName || !email || !password) {
    return NextResponse.redirect(
      new URL(
        `/signup?error=${encodeNotice("Complete all the required fields.")}&next=${encodeURIComponent(next)}`,
        request.url
      )
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/signup?error=${encodeNotice(error.message)}&next=${encodeURIComponent(next)}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      `/login?message=${encodeNotice("Account created. If email confirmation is enabled, confirm your email first, then sign in.")}&next=${encodeURIComponent(next)}`,
      request.url
    )
  );
}

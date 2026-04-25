import { NextRequest, NextResponse } from "next/server";
import { encodeNotice, getSafeRedirectPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirectPath(String(formData.get("next") ?? "/account"));

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeNotice("Enter both email and password.")}&next=${encodeURIComponent(next)}`,
        request.url
      )
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeNotice(error.message)}&next=${encodeURIComponent(next)}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}

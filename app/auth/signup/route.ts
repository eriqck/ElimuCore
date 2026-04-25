import { NextRequest, NextResponse } from "next/server";
import { encodeNotice, getSafeRedirectPath } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const adminSupabase = createAdminClient();
  const { error: createUserError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (createUserError) {
    return NextResponse.redirect(
      new URL(
        `/signup?error=${encodeNotice(createUserError.message)}&next=${encodeURIComponent(next)}`,
        request.url
      )
    );
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeNotice("Account created. Sign in using your email and password.")}&next=${encodeURIComponent(next)}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(next, request.url)
  );
}

import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { resetPasswordWithOtp } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!email || !otp || !password || !confirmPassword) {
    return NextResponse.redirect(
      new URL(
        `/reset-password?email=${encodeURIComponent(email)}&error=${encodeNotice("Complete all the fields first.")}`,
        request.url
      )
    );
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      new URL(
        `/reset-password?email=${encodeURIComponent(email)}&error=${encodeNotice("Use a password with at least 6 characters.")}`,
        request.url
      )
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.redirect(
      new URL(
        `/reset-password?email=${encodeURIComponent(email)}&error=${encodeNotice("Your passwords do not match.")}`,
        request.url
      )
    );
  }

  try {
    const result = await resetPasswordWithOtp({
      email,
      otp,
      password
    });

    if (!result.success) {
      return NextResponse.redirect(
        new URL(
          `/reset-password?email=${encodeURIComponent(email)}&error=${encodeNotice(result.message)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeNotice(result.message)}`,
        request.url
      )
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not reset your password right now.";

    return NextResponse.redirect(
      new URL(
        `/reset-password?email=${encodeURIComponent(email)}&error=${encodeNotice(message)}`,
        request.url
      )
    );
  }
}

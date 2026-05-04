import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { startPasswordReset } from "@/lib/password-reset";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return NextResponse.redirect(
      new URL(
        `/forgot-password?error=${encodeNotice("Enter your email address.")}`,
        request.url
      )
    );
  }

  try {
    const result = await startPasswordReset(email);

    if (!result.dispatched) {
      return NextResponse.redirect(
        new URL(
          `/forgot-password?error=${encodeNotice("No account was found with that email address.")}&email=${encodeURIComponent(email)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/reset-password?email=${encodeURIComponent(email)}&message=${encodeNotice("Check your email for the 6-digit code.")}`,
        request.url
      )
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not send the code right now.";

    return NextResponse.redirect(
      new URL(
        `/forgot-password?error=${encodeNotice(message)}`,
        request.url
      )
    );
  }
}

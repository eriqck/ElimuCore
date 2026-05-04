import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { getCurrentMemberContext, hasAdminAccess } from "@/lib/membership";
import {
  generateSchemeRequestOutput,
  getSchemeRequestById,
  getSchemeRequestForUser
} from "@/lib/scheme-bot";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const memberContext = await getCurrentMemberContext();

  if (!memberContext.user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(`/scheme-bot/${id}`)}`, request.url),
      { status: 303 }
    );
  }

  const schemeRequest = hasAdminAccess(memberContext.profile)
    ? await getSchemeRequestById(id)
    : await getSchemeRequestForUser(id, memberContext.user.id);

  if (!schemeRequest) {
    return NextResponse.redirect(
      new URL(
        `/scheme-bot?notice=${encodeNotice("That scheme request could not be found.")}`,
        request.url
      ),
      { status: 303 }
    );
  }

  if (schemeRequest.accessMode !== "premium" && !schemeRequest.paidAt) {
    return NextResponse.redirect(
      new URL(
        `/scheme-bot/${schemeRequest.id}?notice=${encodeNotice("Complete payment before retrying this scheme.")}`,
        request.url
      ),
      { status: 303 }
    );
  }

  try {
    await generateSchemeRequestOutput(schemeRequest.id);

      return NextResponse.redirect(
        new URL(
          `/scheme-bot/${schemeRequest.id}?notice=${encodeNotice("Scheme prepared successfully.")}`,
          request.url
        ),
      { status: 303 }
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "We could not retry that scheme right now.";

    return NextResponse.redirect(
      new URL(
        `/scheme-bot/${schemeRequest.id}?notice=${encodeNotice(message)}`,
        request.url
      ),
      { status: 303 }
    );
  }
}

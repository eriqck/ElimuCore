import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { getCurrentMemberContext, hasAdminAccess } from "@/lib/membership";
import { getSchemeRequestById, getSchemeRequestForUser } from "@/lib/scheme-bot";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
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
    return NextResponse.json(
      { error: "Scheme request not found." },
      { status: 404 }
    );
  }

  if (!schemeRequest.storageBucket || !schemeRequest.storagePath) {
    return NextResponse.redirect(
      new URL(
        `/scheme-bot/${schemeRequest.id}?notice=${encodeNotice("This document file is not ready yet.")}`,
        request.url
      ),
      { status: 303 }
    );
  }

  const supabase = createAdminClient();
  const { data: signedUrl, error } = await supabase.storage
    .from(schemeRequest.storageBucket)
    .createSignedUrl(schemeRequest.storagePath, 60 * 5, {
      download:
        schemeRequest.generatedTitle ??
        `${schemeRequest.classLabel} ${schemeRequest.subject} document.docx`
    });

  if (error || !signedUrl?.signedUrl) {
    return NextResponse.json(
      { error: "Could not create a scheme download link right now." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedUrl.signedUrl, { status: 302 });
}

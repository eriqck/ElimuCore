import { NextRequest, NextResponse } from "next/server";
import { encodeNotice } from "@/lib/auth";
import { getCurrentMemberContext } from "@/lib/membership";
import { createAdminClient } from "@/lib/supabase/admin";

type PublishedResourceRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  access: "free" | "premium";
};

type ResourceDownloadFileRow = {
  id: string;
  label: string;
  bucket_path: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<unknown> }
) {
  const { slug } = (await context.params) as { slug: string };
  const fileId = request.nextUrl.searchParams.get("file");

  if (!fileId) {
    return NextResponse.json(
      { error: "Missing file identifier." },
      { status: 400 }
    );
  }

  try {
    const memberContext = await getCurrentMemberContext();
    const supabase = createAdminClient();
    const { data: resourceData, error: resourceError } = await supabase
      .from("resources")
      .select("id, slug, title, published, access")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    const resource = resourceData as PublishedResourceRow | null;

    if (resourceError || !resource) {
      return NextResponse.json(
        { error: "Resource not found." },
        { status: 404 }
      );
    }

    if (resource.access === "premium" && !memberContext.user) {
      return NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(`/resources/${slug}`)}`, request.url)
      );
    }

    if (resource.access === "premium" && !memberContext.activeMembership) {
      return NextResponse.redirect(
        new URL(
          `/account?notice=${encodeNotice("An active membership is required to download premium ELimuCore resources.")}`,
          request.url
        )
      );
    }

    const { data: fileData, error: fileError } = await supabase
      .from("resource_files")
      .select("id, label, bucket_path")
      .eq("id", fileId)
      .eq("resource_id", resource.id)
      .maybeSingle();
    const file = fileData as ResourceDownloadFileRow | null;

    if (fileError || !file) {
      return NextResponse.json(
        { error: "File not found for this resource." },
        { status: 404 }
      );
    }

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from("resource-files")
      .createSignedUrl(file.bucket_path, 60 * 5, {
        download: file.label
      });

    if (signedUrlError || !signedUrl?.signedUrl) {
      return NextResponse.json(
        { error: "Could not create a download link right now." },
        { status: 500 }
      );
    }

    return NextResponse.redirect(signedUrl.signedUrl, {
      status: 302
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Downloads are not configured yet. Add the Supabase service role key to enable signed file links."
      },
      { status: 503 }
    );
  }
}

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/api/",
          "/auth/",
          "/payments/",
          "/resources",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password"
        ]
      }
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`
  };
}

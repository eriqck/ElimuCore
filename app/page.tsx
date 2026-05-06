import type { Metadata } from "next";
import { ElimuCoreHome } from "@/components/home/elimu-core-home";
import {
  homePageDescription,
  homePageTitle,
  primarySiteLinks,
  siteAlternateNames,
  siteLogoUrl,
  siteName,
  siteOgImageUrl,
  siteUrl
} from "@/lib/site";

export const metadata: Metadata = {
  title: homePageTitle,
  description: homePageDescription,
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: `${siteName} | ${homePageTitle}`,
    description: homePageDescription,
    url: siteUrl,
    images: [
      {
        url: siteOgImageUrl,
        width: 1200,
        height: 630,
        alt: `${siteName} homepage preview`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | ${homePageTitle}`,
    description: homePageDescription,
    images: [siteOgImageUrl]
  }
};

export default function HomePage() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: siteLogoUrl
      },
      description: homePageDescription,
      telephone: "+254759481281",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Baazar's Plaza",
        addressLocality: "Nairobi",
        addressCountry: "KE"
      },
      sameAs: ["https://www.facebook.com/elimucoreh"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: "+254759481281",
        areaServed: "KE",
        availableLanguage: ["English", "Swahili"]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      alternateName: siteAlternateNames,
      url: siteUrl,
      description: homePageDescription,
      hasPart: primarySiteLinks.map((item) => ({
        "@type": "WebPage",
        name: item.name,
        url: item.url
      }))
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <ElimuCoreHome />
    </>
  );
}

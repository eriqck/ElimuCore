"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  consumeMarketingCookieEvents,
  trackMarketingEvent
} from "@/lib/marketing-client";

export function MarketingPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedSearch = searchParams.toString();

  useEffect(() => {
    const pageHref =
      typeof window !== "undefined" ? window.location.href : pathname;

    trackMarketingEvent({
      eventName: "PageView",
      dedupeKey: `page:${pathname}?${serializedSearch}`,
      payload: {
        page_path: pathname,
        page_location: pageHref,
        page_title: typeof document !== "undefined" ? document.title : pathname
      }
    });

    consumeMarketingCookieEvents().forEach((event) => {
      trackMarketingEvent(event);
    });
  }, [pathname, serializedSearch]);

  return null;
}

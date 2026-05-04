"use client";

import { useEffect, useMemo } from "react";
import { trackMarketingEvent } from "@/lib/marketing-client";
import type { MarketingEventEnvelope } from "@/lib/marketing";

type MarketingEventProps = MarketingEventEnvelope;

export function MarketingEvent({
  eventName,
  payload,
  dedupeKey
}: MarketingEventProps) {
  const payloadSignature = useMemo(
    () => JSON.stringify(payload ?? {}),
    [payload]
  );

  useEffect(() => {
    trackMarketingEvent({
      eventName,
      payload,
      dedupeKey
    });
  }, [dedupeKey, eventName, payload, payloadSignature]);

  return null;
}

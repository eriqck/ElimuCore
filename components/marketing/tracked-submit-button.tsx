"use client";

import { trackMarketingEvent } from "@/lib/marketing-client";
import type { MarketingEventEnvelope } from "@/lib/marketing";

type TrackedSubmitButtonProps = {
  className: string;
  children: React.ReactNode;
  eventName: MarketingEventEnvelope["eventName"];
  payload?: MarketingEventEnvelope["payload"];
  dedupeKey?: string;
};

export function TrackedSubmitButton({
  className,
  children,
  eventName,
  payload,
  dedupeKey
}: TrackedSubmitButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={() => {
        trackMarketingEvent({
          eventName,
          payload,
          dedupeKey
        });
      }}
    >
      {children}
    </button>
  );
}

export const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";
export const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

export const marketingEventCookieName = "elimu_marketing_events";

export type MarketingPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type MarketingPayload = Record<string, MarketingPayloadValue>;

export type MarketingEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "Lead"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "Purchase"
  | "OpenSchemeBot"
  | "ViewJuniorClass"
  | "ViewPricing";

export type MarketingEventEnvelope = {
  eventName: MarketingEventName;
  payload?: MarketingPayload;
  dedupeKey?: string;
};

export function getDataLayerEventName(eventName: MarketingEventName) {
  switch (eventName) {
    case "PageView":
      return "page_view";
    case "ViewContent":
      return "view_content";
    case "Search":
      return "search";
    case "Lead":
      return "lead";
    case "CompleteRegistration":
      return "complete_registration";
    case "InitiateCheckout":
      return "initiate_checkout";
    case "Purchase":
      return "purchase";
    case "OpenSchemeBot":
      return "open_scheme_bot";
    case "ViewJuniorClass":
      return "view_junior_class";
    case "ViewPricing":
      return "view_pricing";
    default:
      return eventName;
  }
}

export function serializeMarketingEvents(events: MarketingEventEnvelope[]) {
  return encodeURIComponent(JSON.stringify(events));
}

export function deserializeMarketingEvents(value: string) {
  try {
    const parsed = JSON.parse(decodeURIComponent(value));

    return Array.isArray(parsed)
      ? (parsed as MarketingEventEnvelope[])
      : [];
  } catch {
    return [];
  }
}

export function normalizeMarketingPayload(
  payload: MarketingPayload | undefined
) {
  if (!payload) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Record<string, string | number | boolean | null>;
}

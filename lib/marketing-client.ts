"use client";

import {
  deserializeMarketingEvents,
  getDataLayerEventName,
  marketingEventCookieName,
  metaPixelId,
  normalizeMarketingPayload,
  type MarketingEventEnvelope
} from "@/lib/marketing";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (
      command: "track" | "trackCustom" | "init" | "consent",
      eventNameOrPixelId: string,
      payload?: Record<string, unknown>
    ) => void;
  }
}

const trackedEventPrefix = "elimu-marketing:";
const standardMetaEvents = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "Lead",
  "CompleteRegistration",
  "InitiateCheckout",
  "Purchase"
]);

function isBrowser() {
  return typeof window !== "undefined";
}

function getStoredKey(dedupeKey: string) {
  return `${trackedEventPrefix}${dedupeKey}`;
}

function markEventSeen(dedupeKey?: string) {
  if (!dedupeKey || !isBrowser()) {
    return false;
  }

  const storageKey = getStoredKey(dedupeKey);

  if (window.sessionStorage.getItem(storageKey)) {
    return true;
  }

  window.sessionStorage.setItem(storageKey, "1");
  return false;
}

function pushDataLayerEvent(event: MarketingEventEnvelope) {
  if (!isBrowser()) {
    return;
  }

  const payload = normalizeMarketingPayload(event.payload);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: getDataLayerEventName(event.eventName),
    ...payload
  });
}

function pushMetaEvent(event: MarketingEventEnvelope) {
  if (!isBrowser() || !metaPixelId || typeof window.fbq !== "function") {
    return;
  }

  const payload = normalizeMarketingPayload(event.payload);

  if (standardMetaEvents.has(event.eventName)) {
    window.fbq("track", event.eventName, payload);
    return;
  }

  window.fbq("trackCustom", event.eventName, payload);
}

export function trackMarketingEvent(event: MarketingEventEnvelope) {
  if (!isBrowser()) {
    return;
  }

  if (markEventSeen(event.dedupeKey)) {
    return;
  }

  pushDataLayerEvent(event);
  pushMetaEvent(event);
}

export function consumeMarketingCookieEvents() {
  if (!isBrowser()) {
    return [];
  }

  const cookiePrefix = `${marketingEventCookieName}=`;
  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(cookiePrefix))
    ?.slice(cookiePrefix.length);

  if (!cookieValue) {
    return [];
  }

  document.cookie = `${marketingEventCookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
  return deserializeMarketingEvents(cookieValue);
}

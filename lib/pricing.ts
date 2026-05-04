const MEMBERSHIP_PRICE_OVERRIDES = {
  "1-month": 299,
  "6-months": 499,
  "1-year": 999
} as const;

export function getCanonicalMembershipPrice(
  slug: string,
  fallbackPriceKes: number
) {
  return MEMBERSHIP_PRICE_OVERRIDES[
    slug as keyof typeof MEMBERSHIP_PRICE_OVERRIDES
  ] ?? fallbackPriceKes;
}

export function formatKes(priceKes: number) {
  return `KSh ${priceKes.toLocaleString("en-US")}`;
}

export function getSafeRedirectPath(value: string | null | undefined) {
  const path = String(value ?? "").trim();

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/account";
  }

  return path;
}

export function encodeNotice(message: string) {
  return encodeURIComponent(message);
}

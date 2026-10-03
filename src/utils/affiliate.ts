export function buildAffiliateLink(code: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/ref/${code}`;
  }
  return `https://iexcelo.com/ref/${code}`;
}

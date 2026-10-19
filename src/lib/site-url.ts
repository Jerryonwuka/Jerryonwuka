/**
 * Canonical origin for metadata, Open Graph tags, the sitemap and robots.txt.
 *
 * Set NEXT_PUBLIC_SITE_URL once the real domain is live. Until then Vercel's
 * own environment variables keep preview and production deployments pointing
 * at themselves rather than at a domain that does not resolve yet.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "https://www.azikimedical.com";
}

export const siteUrl = resolveSiteUrl();

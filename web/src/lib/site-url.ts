import { headers } from "next/headers";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Env-only canonical origin (no trailing slash).
 * Use when there is no incoming request (build-time metadata, fallbacks).
 *
 * Precedence: NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_APP_URL → VERCEL_URL → localhost.
 */
export function getConfiguredOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return stripTrailingSlash(`https://${host}`);
  }

  return "http://localhost:3000";
}

/**
 * Public origin for the current HTTP request (custom domain, preview, or local).
 * Prefer proxy headers so auth callbacks and email redirects match the deployment the user hit.
 */
export function resolveAppOriginFromHeaders(headerList: Headers): string {
  const forwardedHost = headerList
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto = headerList
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost) {
    const proto =
      forwardedProto ||
      (forwardedHost.startsWith("localhost") ||
      forwardedHost.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${forwardedHost}`;
  }

  const host = headerList.get("host");
  if (host) {
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.endsWith(".local");
    const proto = isLocal ? "http" : "https";
    return `${proto}://${host}`;
  }

  return getConfiguredOrigin();
}

/** Origin for server actions / RSC when handling the active request. */
export async function getAppOriginAsync(): Promise<string> {
  try {
    const h = await headers();
    return resolveAppOriginFromHeaders(h);
  } catch {
    return getConfiguredOrigin();
  }
}

/** Base URL for Next.js `metadataBase` and absolute OG / canonical resolution. */
export function getMetadataBase(): URL {
  return new URL(`${getConfiguredOrigin()}/`);
}

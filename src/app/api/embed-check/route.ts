import type { NextRequest } from "next/server";
import { checkEmbeddable } from "./check";
import { validateTargetUrl } from "./policy";

// Node.js runtime is the default. Reading request.nextUrl makes this handler
// run per request; Route Handlers are not cached by default in this version,
// so caching is delegated to the CDN via Cache-Control below.

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(request: NextRequest) {
  const check = validateTargetUrl(request.nextUrl.searchParams.get("url"));
  if (!check.ok) {
    return Response.json(
      { embeddable: false, reason: check.reason },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await checkEmbeddable(check.url);
  return Response.json(result, { headers: CACHE_HEADERS });
}

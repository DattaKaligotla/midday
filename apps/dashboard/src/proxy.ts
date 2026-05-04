import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

// ⚠️ FARADAY DEMO MODE — Supabase is bypassed so the dashboard can render
// without real auth / DB. Restore the original updateSession + redirect logic
// before any non-local deployment.
const I18nMiddleware = createI18nMiddleware({
  locales: ["en"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

export async function proxy(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

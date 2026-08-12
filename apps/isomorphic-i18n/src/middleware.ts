import { NextResponse } from "next/server"

import withJwt from "@/middleware/withJwt"
import withLang from "@/middleware/withLang"
import withPermission from "@/middleware/withPermission"

export function defaultMiddleware() {
  return NextResponse.next();
}

export default withPermission(withJwt(withLang(defaultMiddleware)))

/**
 * Next.js requires these to be static literals, so they cannot be derived from
 * activeCountry.languages. Keep them in sync with the locale folders under
 * src/app/i18n/locales.
 */
export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/(en|sw|pt)/:path*',
    '/(en|sw|pt)',
  ],
};
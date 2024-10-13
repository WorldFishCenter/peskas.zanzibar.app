import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { fallbackLng, languages } from "@/app/i18n/settings";
import type { MiddlewareFactory } from "./types";

const withLang: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const res = await next(request, _next)
    const cookieName = "i18next";
	  const lang =
      request.cookies.has(cookieName)
        ? request.cookies.get(cookieName)?.value
      : fallbackLng

    if (!languages.some((local) => request.nextUrl.pathname.startsWith(`/${local}`))) {
      return NextResponse.redirect(new URL(`/${lang}${request.nextUrl.pathname}${request.nextUrl.search}`, request.url));
    }

    return res
  };
};

export default withLang;
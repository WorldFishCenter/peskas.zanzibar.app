import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server"
import { NextResponse } from "next/server"

import type { MiddlewareFactory } from "./types"
import { JWT_COOKIE_NAME } from "./const"

const withJwt: MiddlewareFactory = (next: NextMiddleware) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const res = await next(request, _next)
    const [cookieToken] = request.cookies
      .getAll()
      .filter((o) => o.name.indexOf(JWT_COOKIE_NAME) > -1)

    const loginPageMatches = /.*\/(?<page>(sign-in))$/gim.exec(
      request.nextUrl.pathname,
    )
    if (loginPageMatches?.groups?.page &&
      !cookieToken
    ) {
      return res
    }

    if (loginPageMatches?.groups?.page &&
      cookieToken
    ) {
      return NextResponse.redirect(
        new URL(`/`, request.url),
      )
    }

    if (!cookieToken) {
      return NextResponse.redirect(
        new URL(`/sign-in`, request.url),
      )
    } 

    return res
  }
}

export default withJwt

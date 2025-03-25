import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if the route should be publicly accessible
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/p/") ||
    request.nextUrl.pathname.startsWith("/api/check-profile") ||
    request.nextUrl.pathname.startsWith("/api/debug-profile") ||
    request.nextUrl.pathname.startsWith("/api/fix-profiles") ||
    request.nextUrl.pathname.startsWith("/api/fix-specific-profile") ||
    request.nextUrl.pathname === "/test-public-card" ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)

  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    console.log("Allowing access to public route without authentication:", request.nextUrl.pathname)
    return response
  }

  // For protected routes, check authentication
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: "",
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: "",
              ...options,
            })
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is not authenticated, redirect to login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return response
  } catch (error) {
    console.error("Error in middleware:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}


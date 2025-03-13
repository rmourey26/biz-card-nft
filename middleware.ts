import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith("/login") && !request.nextUrl.pathname.startsWith("/signup")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user exists but we're not on a protected route, continue
  if (user) {
    // Check if profile exists, if not, create it (this helps with existing users)
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create it
        await supabase.from("profiles").insert({
          id: user.id,
          user_id: user.id,
          full_name: user.user_metadata.full_name || "",
          email: user.email,
          company: user.user_metadata.company || "",
          website: user.user_metadata.website || "",
          avatar_url: user.user_metadata.avatar_url || "",
          company_logo_url: user.user_metadata.company_logo_url || "",
          username: (user.user_metadata.full_name || "user").toLowerCase().replace(/\s+/g, "_"),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error checking/creating profile in middleware:", error)
      // Continue even if profile check/creation fails
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}


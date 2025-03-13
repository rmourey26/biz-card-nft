import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default function useSupabaseServer() {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}


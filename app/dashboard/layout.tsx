import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientProviders } from "@/components/client-providers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  return <ClientProviders>{children}</ClientProviders>
}


import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { CrmDashboardClient } from "./crm-dashboard-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/app/actions/profile"

export const metadata: Metadata = {
  title: "CRM Dashboard - CardChain",
  description: "Manage your CRM connections and data",
}

export default async function CrmDashboardPage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  // Get the user's profile
  const profile = await getProfile(user.id)

  // Fetch AI models
  const { data: aiModels } = await supabase.from("ai_models").select("*")

  // Fetch AI agents
  const { data: aiAgents } = await supabase.from("ai_agents").select("*")

  // Fetch AI workflows
  const { data: workflows } = await supabase.from("ai_workflows").select("*")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showAuth={true} isLoggedIn={true} />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">CRM Dashboard</h1>
        <CrmDashboardClient />
      </main>
    </div>
  )
}


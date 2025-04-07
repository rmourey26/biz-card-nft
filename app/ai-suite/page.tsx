import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AISuiteClient } from "./ai-suite-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Business Suite - CardChain",
  description: "Powerful AI tools for your business",
}

export default async function AISuitePage() {
  const supabase = createServerSupabaseClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  // Fetch available AI models
  const { data: aiModels, error: aiModelsError } = await supabase
    .from("ai_models")
    .select("*")
    .order("name", { ascending: true })

  if (aiModelsError) {
    console.error("Error fetching AI models:", aiModelsError)
  }

  // Fetch user's AI agents
  const { data: aiAgents, error: aiAgentsError } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (aiAgentsError) {
    console.error("Error fetching AI agents:", aiAgentsError)
  }

  // Fetch user's workflows
  const { data: workflows, error: workflowsError } = await supabase
    .from("ai_workflows")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (workflowsError) {
    console.error("Error fetching workflows:", workflowsError)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showAuth={true} isLoggedIn={true} />

      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">AI Business Suite</h1>

        <AISuiteClient user={user} aiModels={aiModels || []} aiAgents={aiAgents || []} workflows={workflows || []} />
      </main>
    </div>
  )
}


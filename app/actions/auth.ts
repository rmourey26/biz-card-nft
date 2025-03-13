"use server"

import { createServerClientForSSR } from "@/lib/supabase-server"
import { userSchema } from "@/lib/schemas"
import * as z from "zod"

const signUpSchema = userSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters long"),
})

export async function signUp(formData: z.infer<typeof signUpSchema>) {
  try {
    const validatedData = signUpSchema.parse(formData)

    // Ensure website has http/https prefix if provided
    let website = validatedData.website
    if (website && !website.startsWith("http")) {
      website = `https://${website}`
    }

    // Ensure linkedin_url has http/https prefix if provided
    let linkedinUrl = validatedData.linkedin_url
    if (linkedinUrl && !linkedinUrl.startsWith("http")) {
      linkedinUrl = `https://${linkedinUrl}`
    }

    const supabase = await createServerClientForSSR()

    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name,
          company: validatedData.company,
          job_title: validatedData.job_title || "",
          website: website,
          linkedin_url: linkedinUrl || "",
          avatar_url: validatedData.avatar_url || "",
          company_logo_url: validatedData.company_logo_url || "",
        },
      },
    })

    if (error) throw error

    // Create a profile record immediately after signup
    try {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user?.id,
        user_id: data.user?.id,
        full_name: validatedData.full_name,
        email: validatedData.email,
        company: validatedData.company,
        job_title: validatedData.job_title || "",
        website: website,
        linkedin_url: linkedinUrl || "",
        avatar_url: validatedData.avatar_url || "",
        company_logo_url: validatedData.company_logo_url || "",
        username: validatedData.full_name.toLowerCase().replace(/\s+/g, "_"),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // Continue even if profile creation fails, as it will be created later
      }
    } catch (profileError) {
      console.error("Error creating profile:", profileError)
      // Continue even if profile creation fails
    }

    return { success: true, message: "Account created successfully" }
  } catch (error) {
    console.error("Error signing up:", error)
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message }
    } else if (error instanceof Error) {
      return { success: false, message: error.message }
    } else {
      return { success: false, message: "There was an error creating your account. Please try again." }
    }
  }
}


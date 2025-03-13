"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Get profile function
export async function getProfile(userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Try to get the profile
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching profile:", error)
      throw error
    }

    if (!data) {
      // Get user data from auth
      const { data: userData } = await supabase.auth.getUser()

      // Return default profile
      return {
        id: userId,
        full_name: userData.user?.user_metadata?.full_name || "",
        username: userData.user?.user_metadata?.username || "",
        email: userData.user?.email || "",
        company: userData.user?.user_metadata?.company || "",
        job_title: userData.user?.user_metadata?.job_title || "",
        website: userData.user?.user_metadata?.website || "",
        linkedin_url: userData.user?.user_metadata?.linkedin_url || "",
        avatar_url: userData.user?.user_metadata?.avatar_url || "",
        company_logo_url: userData.user?.user_metadata?.company_logo_url || "",
        waddress: userData.user?.user_metadata?.waddress || "",
        xhandle: userData.user?.user_metadata?.xhandle || "",
      }
    }

    return data
  } catch (error) {
    console.error("Error in getProfile:", error)
    // Return a default profile as fallback
    return {
      id: userId,
      full_name: "",
      username: "",
      email: "",
      company: "",
      job_title: "",
      website: "",
      linkedin_url: "",
      avatar_url: "",
      company_logo_url: "",
      waddress: "",
      xhandle: "",
    }
  }
}

// Update profile function
export async function updateProfile(userId: string, profileData: any) {
  const supabase = createServerSupabaseClient()

  try {
    // Basic validation
    if (!profileData.full_name || !profileData.email) {
      return { success: false, error: "Full name and email are required" }
    }

    // Ensure website has http/https prefix if provided
    let website = profileData.website
    if (website && !website.startsWith("http")) {
      website = `https://${website}`
    }

    // Ensure LinkedIn URL has http/https prefix if provided
    let linkedinUrl = profileData.linkedin_url
    if (linkedinUrl && !linkedinUrl.startsWith("http")) {
      linkedinUrl = `https://${linkedinUrl}`
    }

    // Prepare the profile data
    const updatedProfile = {
      full_name: profileData.full_name,
      username: profileData.username || profileData.full_name.toLowerCase().replace(/\s+/g, "_"),
      email: profileData.email,
      company: profileData.company || "",
      job_title: profileData.job_title || "",
      website: website || "",
      linkedin_url: linkedinUrl || "",
      avatar_url: profileData.avatar_url || "",
      company_logo_url: profileData.company_logo_url || "",
      waddress: profileData.waddress || "",
      xhandle: profileData.xhandle || "",
      updated_at: new Date().toISOString(),
    }

    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking profile:", checkError)
      return { success: false, error: "Error checking if profile exists" }
    }

    if (!existingProfile) {
      // Profile doesn't exist, create it
      console.log("Creating new profile for user:", userId)
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        user_id: userId,
        ...updatedProfile,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return { success: false, error: "Error creating profile" }
      }
    } else {
      // Profile exists, update it
      console.log("Updating profile for user:", userId)
      const { error: updateError } = await supabase.from("profiles").update(updatedProfile).eq("id", userId)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        return { success: false, error: "Error updating profile" }
      }
    }

    // Update user metadata separately
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          username: profileData.username || profileData.full_name.toLowerCase().replace(/\s+/g, "_"),
          company: profileData.company || "",
          job_title: profileData.job_title || "",
          website: website || "",
          linkedin_url: linkedinUrl || "",
          avatar_url: profileData.avatar_url || "",
          company_logo_url: profileData.company_logo_url || "",
          waddress: profileData.waddress || "",
          xhandle: profileData.xhandle || "",
        },
      })
    } catch (metadataError) {
      console.error("Error updating user metadata:", metadataError)
      // Continue even if metadata update fails
    }

    // Update business cards with the new company and website information
    try {
      const { data: cards, error: cardsError } = await supabase
        .from("business_cards")
        .select("id")
        .eq("user_id", userId)

      if (!cardsError && cards && cards.length > 0) {
        // Update all business cards for this user
        await supabase
          .from("business_cards")
          .update({
            company_name: profileData.company || "",
            website: website || "",
          })
          .eq("user_id", userId)
      }
    } catch (cardsError) {
      console.error("Error updating business cards:", cardsError)
      // Continue even if business card updates fail
    }

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProfile:", error)
    return {
      success: false,
      error: "An unexpected error occurred while updating your profile",
    }
  }
}


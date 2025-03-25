"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

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
        public_id: null,
        public_access: true,
        card_style: {
          backgroundColor: "#ffffff",
          textColor: "#333333",
          primaryColor: "#3b82f6",
        },
      }
    }

    // Ensure card_style exists
    if (!data.card_style) {
      data.card_style = {
        backgroundColor: "#ffffff",
        textColor: "#333333",
        primaryColor: "#3b82f6",
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
      public_id: null,
      public_access: true,
      card_style: {
        backgroundColor: "#ffffff",
        textColor: "#333333",
        primaryColor: "#3b82f6",
      },
    }
  }
}

// Update profile function
export async function updateProfile(profileData: any) {
  const supabase = createServerSupabaseClient()
  const userId = profileData.id

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
      public_access: true, // Ensure public access is enabled
    }

    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, public_id, card_style")
      .eq("id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking profile:", checkError)
      return { success: false, error: "Error checking if profile exists" }
    }

    if (!existingProfile) {
      // Profile doesn't exist, create it with a new public_id and default card style
      console.log("Creating new profile for user:", userId)
      const public_id = uuidv4()
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        user_id: userId,
        ...updatedProfile,
        public_id,
        created_at: new Date().toISOString(),
        card_style: {
          backgroundColor: "#ffffff",
          textColor: "#333333",
          primaryColor: "#3b82f6",
        },
      })

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return { success: false, error: "Error creating profile" }
      }
    } else {
      // Profile exists, update it (keep existing public_id and card_style)
      console.log("Updating profile for user:", userId)

      // Preserve existing card_style if it exists
      if (existingProfile.card_style) {
        updatedProfile.card_style = existingProfile.card_style
      } else {
        // Add default card_style if it doesn't exist
        updatedProfile.card_style = {
          backgroundColor: "#ffffff",
          textColor: "#333333",
          primaryColor: "#3b82f6",
        }
      }

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

// Update profile style function
export async function updateProfileStyle(profileId: string, styleData: any) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("card_style")
      .eq("id", profileId)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      throw new Error("Failed to fetch profile")
    }

    // Merge existing style with new style data
    const updatedStyle = {
      ...(profile.card_style || {
        backgroundColor: "#ffffff",
        textColor: "#333333",
        primaryColor: "#3b82f6",
      }),
      ...styleData,
    }

    // Update the profile with the new style
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ card_style: updatedStyle })
      .eq("id", profileId)

    if (updateError) {
      console.error("Error updating profile style:", updateError)
      throw new Error("Failed to update profile style")
    }

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProfileStyle:", error)
    return {
      success: false,
      error: "An unexpected error occurred while updating your profile style",
    }
  }
}


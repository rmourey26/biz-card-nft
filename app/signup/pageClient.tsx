"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { signUp } from "../actions/auth"
import { ImageUpload } from "@/components/image-upload"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

export default function SignupPageClient() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    company: "",
    job_title: "",
    website: "",
    linkedin_url: "",
    avatar_url: "",
    company_logo_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (field: string) => (url: string) => {
    setFormData((prev) => ({ ...prev, [field]: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signUp({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        job_title: formData.job_title,
        website: formData.website,
        linkedin_url: formData.linkedin_url,
        avatar_url: formData.avatar_url,
        company_logo_url: formData.company_logo_url,
      })

      if (result.success) {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        })
        router.push("/login")
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error signing up:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showAuth={false} />

      <div className="flex flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Enter your information to create your digital business card</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <ImageUpload
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleImageChange("avatar_url")}
                  label="Profile Avatar"
                  helpText="Upload or provide a URL to your profile picture"
                  bucketName="avatars"
                />

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Acme Inc."
                    required
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    name="job_title"
                    placeholder="Software Engineer"
                    value={formData.job_title || ""}
                    onChange={handleChange}
                  />
                </div>

                <ImageUpload
                  id="company_logo_url"
                  value={formData.company_logo_url}
                  onChange={handleImageChange("company_logo_url")}
                  label="Company Logo"
                  helpText="Upload or provide a URL to your company logo"
                  bucketName="company-logos"
                />

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    required
                    value={formData.website}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500">Include https:// or we'll add it for you</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin_url || ""}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500">Include https:// or we'll add it for you</p>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-500 hover:underline">
                    Log in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Edit2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { updateBusinessCardInfo } from "@/app/actions/businessCard"

interface BusinessCardEditorProps {
  userId: string
  cardId: string
  initialData: {
    full_name: string
    company: string
    job_title?: string
    email: string
    website: string
    linkedin_url?: string
    avatar_url?: string
    company_logo_url?: string
    xhandle?: string
  }
  onUpdate: () => void
}

export function BusinessCardEditor({ userId, cardId, initialData, onUpdate }: BusinessCardEditorProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || "",
    company: initialData.company || "",
    job_title: initialData.job_title || "",
    email: initialData.email || "",
    website: initialData.website || "",
    linkedin_url: initialData.linkedin_url || "",
    avatar_url: initialData.avatar_url || "",
    company_logo_url: initialData.company_logo_url || "",
    xhandle: initialData.xhandle || "",
  })

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
      const result = await updateBusinessCardInfo(userId, cardId, formData)

      if (result.success) {
        toast({
          title: "Business Card Updated",
          description: "Your business card information has been updated successfully.",
        })
        setOpen(false)
        onUpdate()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating business card:", error)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="absolute top-4 right-4 z-10">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit Business Card</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Business Card</DialogTitle>
          <DialogDescription>Update your business card information. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="company">Company Info</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>

              <ImageUpload
                id="avatar_url"
                value={formData.avatar_url}
                onChange={handleImageChange("avatar_url")}
                label="Profile Avatar"
                helpText="Upload or provide a URL to your profile picture"
                bucketName="avatars"
                folderPath={userId}
              />

              <div className="space-y-2">
                <Label htmlFor="xhandle">X Handle</Label>
                <Input
                  id="xhandle"
                  name="xhandle"
                  value={formData.xhandle}
                  onChange={handleChange}
                  placeholder="@username"
                />
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
              </div>

              <ImageUpload
                id="company_logo_url"
                value={formData.company_logo_url}
                onChange={handleImageChange("company_logo_url")}
                label="Company Logo"
                helpText="Upload or provide a URL to your company logo"
                bucketName="company-logos"
                folderPath={userId}
              />

              <div className="space-y-2">
                <Label htmlFor="website">Company Website</Label>
                <Input id="website" name="website" value={formData.website} onChange={handleChange} required />
                <p className="text-xs text-gray-500">Include https:// or we'll add it for you</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                <p className="text-xs text-gray-500">Include https:// or we'll add it for you</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


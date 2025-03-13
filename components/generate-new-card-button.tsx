"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { generateBusinessCard } from "@/app/actions/businessCard"

export function GenerateNewCardButton({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cardName, setCardName] = useState("")
  const [style, setStyle] = useState("professional")

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateBusinessCard(userId, cardName, style)
      if (result.success) {
        setOpen(false)
        toast({
          title: "Business Card Generated",
          description: "Your new business card has been created successfully.",
        })
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error generating business card:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate business card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Generate New Card</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate New Business Card</DialogTitle>
            <DialogDescription>Create a new AI-generated business card design</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card-name" className="col-span-4">
                Card Name
              </Label>
              <Input
                id="card-name"
                placeholder="My Business Card"
                className="col-span-4"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="style" className="col-span-4">
                Style
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="col-span-4">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


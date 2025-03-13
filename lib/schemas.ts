import { z } from "zod"

export const userSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters long"),
  job_title: z.string().optional(),
  website: z.string().url("Invalid website URL").or(z.string().min(1, "Website is required")),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.string().max(0)),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.string().max(0)),
  company_logo_url: z.string().url("Invalid company logo URL").optional().or(z.string().max(0)),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})

export const businessCardStyleSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  backgroundImage: z.string().url("Invalid background image URL").optional(),
  logo: z.string().url("Invalid logo URL").optional(),
})

export const businessCardSchema = z.object({
  name: z.string().min(2, "Card name must be at least 2 characters long"),
  businesscard_name: z.string().min(2, "Card name must be at least 2 characters long").optional(),
  style: businessCardStyleSchema,
})

export const nftSchema = z.object({
  name: z.string().min(2, "NFT name must be at least 2 characters long"),
  txHash: z.string().min(1, "Transaction hash is required"),
  tokenId: z.string().min(1, "Token ID is required"),
})

export type User = z.infer<typeof userSchema>
export type BusinessCardStyle = z.infer<typeof businessCardStyleSchema>
export type BusinessCard = z.infer<typeof businessCardSchema>
export type NFT = z.infer<typeof nftSchema>


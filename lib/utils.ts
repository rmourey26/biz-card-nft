import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { fromB64 } from "@mysten/sui.js/utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address: string, length = 4): string {
  if (!address) return ""
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function decodeFromBase64(base64String: string): string {
  try {
    return fromB64(base64String)
  } catch (error) {
    console.error("Error decoding base64 string:", error)
    return ""
  }
}


import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100) // Convert from kobo/pesewas
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function generateReference() {
  return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

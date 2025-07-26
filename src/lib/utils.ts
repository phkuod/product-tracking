import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function calculateProgress(stations: any[], currentStationId: string): number {
  const currentIndex = stations.findIndex(s => s.id === currentStationId)
  if (currentIndex === -1) return 0
  return Math.round(((currentIndex + 1) / stations.length) * 100)
}

export function getStatusColor(status: "overdue" | "normal"): string {
  return status === "overdue" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
}

export function getStatusLabel(status: "overdue" | "normal"): string {
  return status === "overdue" ? "Overdue" : "Normal"
}
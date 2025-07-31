import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return 'N/A';
  }
  
  let dateObj: Date;
  
  try {
    if (typeof date === 'string') {
      // Handle various string formats
      if (date.trim() === '') {
        return 'N/A';
      }
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      console.warn('formatDate: Invalid date type:', typeof date, date);
      return 'N/A';
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate: Invalid date value:', date);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('formatDate: Error formatting date:', error, 'Input:', date);
    return 'Format Error';
  }
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
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date from DD-MM-YYYY to a displayable format
export function formatDisplayDate(date: string | null | undefined): string {
  if (!date) return '';
  
  try {
    const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
    return format(parsedDate, 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
}

// Format a date from JS Date to DD-MM-YYYY
export function formatDateForAPI(date: Date): string {
  return format(date, 'dd-MM-yyyy');
}

// Format time duration in minutes to hours and minutes
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Convert hex color to tailwind color class
export function hexToTailwindClass(hex: string): string {
  const colorMap: Record<string, string> = {
    "#EF4444": "bg-red-500",
    "#F97316": "bg-orange-500",
    "#F59E0B": "bg-amber-500",
    "#EAB308": "bg-yellow-500",
    "#84CC16": "bg-lime-500",
    "#22C55E": "bg-green-500",
    "#10B981": "bg-emerald-500",
    "#14B8A6": "bg-teal-500",
    "#06B6D4": "bg-cyan-500",
    "#0EA5E9": "bg-sky-500",
    "#3B82F6": "bg-blue-500",
    "#6366F1": "bg-indigo-500",
    "#8B5CF6": "bg-violet-500",
    "#A855F7": "bg-purple-500",
    "#D946EF": "bg-fuchsia-500",
    "#EC4899": "bg-pink-500"
  };

  return colorMap[hex] || "bg-gray-500";
}

// Convert tailwind color class to hex
export function tailwindClassToHex(className: string): string {
  const colorMap: Record<string, string> = {
    "bg-red-500": "#EF4444",
    "bg-orange-500": "#F97316",
    "bg-amber-500": "#F59E0B",
    "bg-yellow-500": "#EAB308",
    "bg-lime-500": "#84CC16",
    "bg-green-500": "#22C55E",
    "bg-emerald-500": "#10B981",
    "bg-teal-500": "#14B8A6",
    "bg-cyan-500": "#06B6D4",
    "bg-sky-500": "#0EA5E9",
    "bg-blue-500": "#3B82F6",
    "bg-indigo-500": "#6366F1",
    "bg-violet-500": "#8B5CF6",
    "bg-purple-500": "#A855F7",
    "bg-fuchsia-500": "#D946EF",
    "bg-pink-500": "#EC4899"
  };

  return colorMap[className] || "#6B7280"; // Default to gray-500
}

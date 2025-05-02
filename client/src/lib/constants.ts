// Enum values matching the backend
export enum TaskType {
  YES_NO = "YES_NO",
  TIME_BASED = "TIME_BASED"
}

export enum TaskFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY"
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED"
}

export enum SessionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

// Color options for categories
export const COLOR_OPTIONS = [
  { name: "Red", class: "bg-red-500", hex: "#EF4444" },
  { name: "Orange", class: "bg-orange-500", hex: "#F97316" },
  { name: "Amber", class: "bg-amber-500", hex: "#F59E0B" },
  { name: "Yellow", class: "bg-yellow-500", hex: "#EAB308" },
  { name: "Lime", class: "bg-lime-500", hex: "#84CC16" },
  { name: "Green", class: "bg-green-500", hex: "#22C55E" },
  { name: "Emerald", class: "bg-emerald-500", hex: "#10B981" },
  { name: "Teal", class: "bg-teal-500", hex: "#14B8A6" },
  { name: "Cyan", class: "bg-cyan-500", hex: "#06B6D4" },
  { name: "Sky", class: "bg-sky-500", hex: "#0EA5E9" },
  { name: "Blue", class: "bg-blue-500", hex: "#3B82F6" },
  { name: "Indigo", class: "bg-indigo-500", hex: "#6366F1" },
  { name: "Violet", class: "bg-violet-500", hex: "#8B5CF6" },
  { name: "Purple", class: "bg-purple-500", hex: "#A855F7" },
  { name: "Fuchsia", class: "bg-fuchsia-500", hex: "#D946EF" },
  { name: "Pink", class: "bg-pink-500", hex: "#EC4899" }
];

export const DEFAULT_PAGE_SIZE = 10;

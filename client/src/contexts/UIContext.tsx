import React, { createContext, useContext, useState, ReactNode } from "react";
import { format } from "date-fns";

interface UIContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  activeTab: "daily" | "weekly" | "monthly";
  setActiveTab: (tab: "daily" | "weekly" | "monthly") => void;
  formattedDate: string;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  const formattedDate = format(selectedDate, "MMM d, yyyy");

  return (
    <UIContext.Provider
      value={{
        mobileMenuOpen,
        setMobileMenuOpen,
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        formattedDate,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

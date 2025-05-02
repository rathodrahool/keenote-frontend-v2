import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useUI } from "@/contexts/UIContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar - always visible on md and up */}
        <Sidebar />
        
        {/* Mobile sidebar backdrop - show when mobile menu is open */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

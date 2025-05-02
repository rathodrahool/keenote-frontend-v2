import { Link, useLocation } from "wouter";
import {
  Home,
  ClipboardList,
  Tag,
  BarChart2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUI } from "@/contexts/UIContext";

export function Sidebar() {
  const [location] = useLocation();
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();

  // Create the navigation links array
  const navLinks = [
    {
      href: "/",
      icon: <Home className="h-5 w-5 mr-3" />,
      label: "Dashboard",
      active: location === "/"
    },
    {
      href: "/tasks",
      icon: <ClipboardList className="h-5 w-5 mr-3" />,
      label: "Tasks",
      active: location === "/tasks"
    },
    {
      href: "/categories",
      icon: <Tag className="h-5 w-5 mr-3" />,
      label: "Categories",
      active: location === "/categories"
    },
    {
      href: "/reports",
      icon: <BarChart2 className="h-5 w-5 mr-3" />,
      label: "Reports",
      active: location === "/reports"
    }
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
          <nav className="flex-1 pt-5 pb-4 overflow-y-auto" aria-label="Main">
            <div className="space-y-1 px-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  active={link.active}
                  icon={link.icon}
                  label={link.label}
                />
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            {/* Close button */}
            <div className="absolute top-0 right-0 pt-2 pr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Mobile navigation */}
            <div className="flex-1 h-0 pt-12 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    active={link.active}
                    icon={link.icon}
                    label={link.label}
                    onClick={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function NavLink({ href, active, icon, label, onClick }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center px-2 py-2 text-sm font-medium rounded-md",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-700 hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "h-5 w-5 mr-3",
          active ? "text-emerald-500" : "text-gray-500"
        )}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}


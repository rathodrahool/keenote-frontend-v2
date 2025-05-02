import { Link, useLocation } from "wouter";
import {
  Home,
  ClipboardList,
  Tag,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
          <nav className="flex-1 pt-5 pb-4 overflow-y-auto" aria-label="Main">
            <div className="space-y-1 px-2">
              <NavLink
                href="/"
                active={location === "/"}
                icon={<Home className="h-5 w-5 mr-3" />}
                label="Dashboard"
              />
              <NavLink
                href="/tasks"
                active={location === "/tasks"}
                icon={<ClipboardList className="h-5 w-5 mr-3" />}
                label="Tasks"
              />
              <NavLink
                href="/categories"
                active={location === "/categories"}
                icon={<Tag className="h-5 w-5 mr-3" />}
                label="Categories"
              />
              <NavLink
                href="/reports"
                active={location === "/reports"}
                icon={<BarChart2 className="h-5 w-5 mr-3" />}
                label="Reports"
              />
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar button */}
      <div className="md:hidden fixed bottom-4 right-4 z-10">
        <Button
          size="icon"
          className="bg-emerald-500 rounded-full p-3 text-white shadow-lg hover:bg-emerald-600"
          aria-label="Open sidebar"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </div>
    </>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}

function NavLink({ href, active, icon, label }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center px-2 py-2 text-sm font-medium rounded-md",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-700 hover:bg-gray-50"
      )}
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



import { Link, useLocation } from "wouter";
import {
  Home,
  ClipboardList,
  Tag,
  BarChart2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types";
import { useState } from "react";
import CreateCategoryModal from "@/components/modals/CreateCategoryModal";
import CreateTaskModal from "@/components/modals/CreateTaskModal";

export function Sidebar() {
  const [location] = useLocation();
  const { categories, isLoading } = useCategories();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  return (
    <>
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 flex flex-col border-r border-gray-200 bg-white">
          <nav className="flex-1 pt-5 pb-4 overflow-y-auto" aria-label="Main">
            <div className="px-4 mb-6">
              <Button
                className="w-full"
                onClick={() => setShowTaskModal(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Task
              </Button>
            </div>
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

            <div className="pt-6 px-4">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categories
              </h3>
              <div className="mt-2 space-y-1">
                {isLoading ? (
                  // Skeleton loading state for categories
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center px-2 py-2"
                    >
                      <Skeleton className="h-3 w-3 rounded-full mr-3" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))
                ) : (
                  // Map through categories
                  categories.map((category: Category) => (
                    <CategoryLink
                      key={category._id}
                      category={category}
                    />
                  ))
                )}
                <Button
                  variant="ghost"
                  className="flex items-center px-2 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-gray-50 rounded-md w-full text-left"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Add Category
                </Button>
              </div>
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

      {/* Modals */}
      <CreateCategoryModal 
        open={showCategoryModal} 
        onOpenChange={setShowCategoryModal} 
      />
      
      <CreateTaskModal 
        open={showTaskModal} 
        onOpenChange={setShowTaskModal} 
      />
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

interface CategoryLinkProps {
  category: Category;
}

function CategoryLink({ category }: CategoryLinkProps) {
  return (
    <Link 
      href={`/tasks?category=${category._id}`}
      className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
    >
      <span
        className={`h-3 w-3 rounded-full mr-3`}
        style={{ backgroundColor: category.color }}
      ></span>
      <span>{category.name}</span>
    </Link>
  );
}

import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useCategories } from "@/hooks/useCategories";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import CreateCategoryModal from "@/components/modals/CreateCategoryModal";
import { Category } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Categories() {
  const { categories, isLoading, deleteCategory } = useCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setShowCreateModal(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete._id, {
        onSuccess: () => {
          setCategoryToDelete(null);
        }
      });
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Categories</h1>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Add Category
        </Button>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-base sm:text-lg">Manage Categories</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            View and manage your task categories. Categories help you organize tasks by type.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Color</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Tasks</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 sm:h-6 w-5 sm:w-6 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 sm:w-24" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-6 sm:w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 sm:w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 sm:h-8 w-6 sm:w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="px-4 sm:px-6 py-3 sm:py-4">
                        <div 
                          className="h-5 w-5 sm:h-6 sm:w-6 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                      </TableCell>
                      <TableCell className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">
                        {category.name}
                      </TableCell>
                      <TableCell className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell text-xs sm:text-sm">
                        0 {/* This would need to be populated with actual task count */}
                      </TableCell>
                      <TableCell className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {category.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleEdit(category)}
                              className="cursor-pointer text-xs sm:text-sm"
                            >
                              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category)}
                              className="cursor-pointer text-red-600 focus:text-red-600 text-xs sm:text-sm"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-xs sm:text-sm text-gray-500">
                      No categories found. Create your first category to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <CreateCategoryModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) setCategoryToEdit(null);
        }}
        editCategory={categoryToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!categoryToDelete} 
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-md mx-auto p-4 sm:p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg sm:text-xl font-semibold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-gray-500">
              This will permanently delete the category "{categoryToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
            <AlertDialogCancel className="mt-2 sm:mt-0 text-xs sm:text-sm h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 focus:ring-red-600 text-xs sm:text-sm h-9"
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

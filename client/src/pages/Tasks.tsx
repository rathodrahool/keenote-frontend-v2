import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useTasks } from "@/hooks/useTasks";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Plus, Pencil, Trash2, Filter } from "lucide-react";
import { Task, Category } from "@/types";
import { TaskType, TaskFrequency } from "@/lib/constants";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
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
import { formatDisplayDate, formatDuration } from "@/lib/utils";

export default function Tasks() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryParams = new URLSearchParams(search);
  
  const categoryFilter = queryParams.get('category') || 'all_categories';
  const typeFilter = queryParams.get('type') || 'all_types';

  const [filters, setFilters] = useState({
    category: categoryFilter,
    type: typeFilter,
    search: '',
  });

  const { tasks, isLoading, deleteTask } = useTasks(filters);
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    if (newFilters.category && newFilters.category !== 'all_categories') {
      params.set('category', newFilters.category);
    }
    if (newFilters.type && newFilters.type !== 'all_types') {
      params.set('type', newFilters.type);
    }
    
    setLocation(`/tasks${params.toString() ? `?${params.toString()}` : ''}`);
  };
  
  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setShowCreateModal(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask.mutate(taskToDelete._id, {
        onSuccess: () => {
          setTaskToDelete(null);
        }
      });
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category ? category.color : '#CCCCCC';
  };

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tasks</h1>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Add Task
        </Button>
      </div>

      <Card className="mb-4 sm:mb-6 shadow-sm">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Filter tasks by category, type, or search by name
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="w-full sm:w-1/3">
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories" className="text-xs sm:text-sm">All Categories</SelectItem>
                  {!categoriesLoading && categories.map((category) => (
                    <SelectItem key={category._id} value={category._id} className="text-xs sm:text-sm">
                      <div className="flex items-center">
                        <span 
                          className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-1.5 sm:mr-2"
                          style={{ backgroundColor: category.color }}
                        ></span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/3">
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types" className="text-xs sm:text-sm">All Types</SelectItem>
                  <SelectItem value={TaskType.TIME_BASED} className="text-xs sm:text-sm">Time Based</SelectItem>
                  <SelectItem value={TaskType.YES_NO} className="text-xs sm:text-sm">Yes/No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/3">
              <div className="relative">
                <Input
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="h-8 sm:h-10 text-xs sm:text-sm pr-10"
                />
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle className="text-base sm:text-lg">Task List</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            View and manage your tasks. Click on a task to see more details.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Task</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Frequency</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Start Date</TableHead>
                  <TableHead className="text-xs">Progress</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || categoriesLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-20 sm:w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 sm:w-24" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16 sm:w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12 sm:w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 sm:h-8 w-6 sm:w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : tasks.length > 0 ? (
                  tasks.map((task) => {
                    const categoryId = typeof task.category === 'string' 
                      ? task.category 
                      : task.category._id;
                    
                    return (
                      <TableRow key={task._id}>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm">
                          {task.name}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          <div className="flex items-center">
                            <span 
                              className="h-2 w-2 sm:h-3 sm:w-3 rounded-full mr-1.5 sm:mr-2"
                              style={{ backgroundColor: getCategoryColor(categoryId) }}
                            ></span>
                            {getCategoryName(categoryId)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell text-xs sm:text-sm">
                          {task.task_type === TaskType.TIME_BASED ? 'Time Based' : 'Yes/No'}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell text-xs sm:text-sm">
                          {task.task_frequency.charAt(0) + task.task_frequency.slice(1).toLowerCase()}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell text-xs sm:text-sm">
                          {formatDisplayDate(task.start_date)}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          {task.task_type === TaskType.YES_NO ? (
                            `${task.completed_count}/${task.target || 1}`
                          ) : (
                            task.duration ? formatDuration(task.duration) : '–'
                          )}
                        </TableCell>
                        <TableCell className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                                <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleEdit(task)}
                                className="cursor-pointer text-xs sm:text-sm"
                              >
                                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(task)}
                                className="cursor-pointer text-red-600 focus:text-red-600 text-xs sm:text-sm"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-xs sm:text-sm text-gray-500">
                      No tasks found. Create your first task to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) setTaskToEdit(null);
        }}
        editTask={taskToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!taskToDelete} 
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-md mx-auto p-4 sm:p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg sm:text-xl font-semibold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-gray-500">
              This will permanently delete the task "{taskToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
            <AlertDialogCancel className="mt-2 sm:mt-0 text-xs sm:text-sm h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 focus:ring-red-600 text-xs sm:text-sm h-9"
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

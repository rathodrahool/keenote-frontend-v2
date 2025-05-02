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
  
  const categoryFilter = queryParams.get('category') || '';
  const typeFilter = queryParams.get('type') || '';

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
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.type) params.set('type', newFilters.type);
    
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter tasks by category, type, or search by name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {!categoriesLoading && categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      <div className="flex items-center">
                        <span 
                          className="h-3 w-3 rounded-full mr-2"
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
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value={TaskType.TIME_BASED}>Time Based</SelectItem>
                  <SelectItem value={TaskType.YES_NO}>Yes/No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/3">
              <div className="relative">
                <Input
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pr-10"
                />
                <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            View and manage your tasks. Click on a task to see more details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || categoriesLoading ? (
                // Skeleton loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task) => {
                  const categoryId = typeof task.category === 'string' 
                    ? task.category 
                    : task.category._id;
                  
                  return (
                    <TableRow key={task._id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: getCategoryColor(categoryId) }}
                          ></span>
                          {getCategoryName(categoryId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.task_type === TaskType.TIME_BASED ? 'Time Based' : 'Yes/No'}
                      </TableCell>
                      <TableCell>
                        {task.task_frequency.charAt(0) + task.task_frequency.slice(1).toLowerCase()}
                      </TableCell>
                      <TableCell>{formatDisplayDate(task.start_date)}</TableCell>
                      <TableCell>
                        {task.task_type === TaskType.YES_NO ? (
                          `${task.completed_count}/${task.target || 1}`
                        ) : (
                          task.duration ? formatDuration(task.duration) : '–'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleEdit(task)}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(task)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No tasks found. Create your first task to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 focus:ring-red-600"
            >
              {deleteTask.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}

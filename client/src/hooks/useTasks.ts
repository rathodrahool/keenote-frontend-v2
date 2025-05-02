import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Task, ApiResponse, PaginatedResponse, FindAllQuery } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDateForAPI } from "@/lib/utils";

export function useTasks(query: FindAllQuery = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<PaginatedResponse<Task[]>>({
    queryKey: ["/api/tasks", query],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTask = useMutation({
    mutationFn: (taskData: Partial<Task>) => {
      // Format date for API if it's a JS Date object
      if (taskData.start_date && taskData.start_date instanceof Date) {
        taskData.start_date = formatDateForAPI(taskData.start_date);
      }
      if (taskData.end_date && taskData.end_date instanceof Date) {
        taskData.end_date = formatDateForAPI(taskData.end_date);
      }
      
      return API.tasks.create(taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => {
      // Format date for API if it's a JS Date object
      if (data.start_date && data.start_date instanceof Date) {
        data.start_date = formatDateForAPI(data.start_date);
      }
      if (data.end_date && data.end_date instanceof Date) {
        data.end_date = formatDateForAPI(data.end_date);
      }
      
      return API.tasks.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => API.tasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTaskCompletion = useMutation({
    mutationFn: ({ id, completedTarget }: { id: string; completedTarget: number }) =>
      API.tasks.updateCompletion(id, completedTarget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task progress updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update task progress: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    tasks: tasksQuery.data?.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskCompletion,
    pagination: {
      page: tasksQuery.data?.page || 1,
      limit: tasksQuery.data?.limit || 10,
      total: tasksQuery.data?.total || 0,
    },
  };
}

export function useTask(id: string) {
  const { toast } = useToast();

  const taskQuery = useQuery<ApiResponse<Task>>({
    queryKey: [`/api/tasks/${id}`],
    enabled: !!id,
  });

  return {
    task: taskQuery.data?.data,
    isLoading: taskQuery.isLoading,
    isError: taskQuery.isError,
    error: taskQuery.error,
  };
}

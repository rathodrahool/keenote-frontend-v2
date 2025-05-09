import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { TimeSession, ApiResponse, PaginatedResponse, FindAllQuery } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDateForAPI } from "@/lib/utils";

export function useTimeSessions(query: FindAllQuery = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const timeSessionsQuery = useQuery<PaginatedResponse<TimeSession[]>>({
    queryKey: ["/api/time-session", query],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createTimeSession = useMutation({
    mutationFn: (sessionData: Partial<TimeSession>) => {
      // The API helper now handles date formatting
      return API.timeSessions.create(sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/task"] }); // Also refresh tasks as they may be updated
      toast({
        title: "Success",
        description: "Session recorded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to record session: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTimeSession = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeSession> }) => {
      // The API helper now handles date formatting
      return API.timeSessions.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/task"] }); // Also refresh tasks as they may be updated
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update session: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTimeSession = useMutation({
    mutationFn: (id: string) => API.timeSessions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-session"] });
      queryClient.invalidateQueries({ queryKey: ["/api/task"] }); // Also refresh tasks as they may be updated
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete session: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    timeSessions: timeSessionsQuery.data?.data || [],
    isLoading: timeSessionsQuery.isLoading,
    isError: timeSessionsQuery.isError,
    error: timeSessionsQuery.error,
    createTimeSession,
    updateTimeSession,
    deleteTimeSession,
    pagination: {
      page: timeSessionsQuery.data?.page || 1,
      limit: timeSessionsQuery.data?.limit || 10,
      total: timeSessionsQuery.data?.total || 0,
    },
  };
}

export function useTimeSession(id: string) {
  const { toast } = useToast();

  const timeSessionQuery = useQuery<ApiResponse<TimeSession>>({
    queryKey: [`/api/time-session/${id}`],
    enabled: !!id,
  });

  return {
    timeSession: timeSessionQuery.data?.data,
    isLoading: timeSessionQuery.isLoading,
    isError: timeSessionQuery.isError,
    error: timeSessionQuery.error,
  };
}

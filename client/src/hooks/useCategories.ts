import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api";
import { Category, ApiResponse, PaginatedResponse, FindAllQuery } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useCategories(query: FindAllQuery = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<PaginatedResponse<Category[]>>({
    queryKey: ["/api/categories", query],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createCategory = useMutation({
    mutationFn: (categoryData: Partial<Category>) => API.categories.create(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      API.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => API.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    categories: categoriesQuery.data?.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory,
    updateCategory,
    deleteCategory,
    pagination: {
      page: categoriesQuery.data?.page || 1,
      limit: categoriesQuery.data?.limit || 10,
      total: categoriesQuery.data?.total || 0,
    },
  };
}

export function useCategory(id: string) {
  const { toast } = useToast();

  const categoryQuery = useQuery<ApiResponse<Category>>({
    queryKey: [`/api/categories/${id}`],
    enabled: !!id,
  });

  return {
    category: categoryQuery.data?.data,
    isLoading: categoryQuery.isLoading,
    isError: categoryQuery.isError,
    error: categoryQuery.error,
  };
}

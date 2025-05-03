import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API, IFindAllQuery, ApiResponse } from "@/lib/api";
import { Category, PaginatedResponse, FindAllQuery } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useCategories(page = 1, limit = 10) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query: IFindAllQuery = {
    page,
    limit,
    order: { created_at: 'desc' }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', page, limit],
    queryFn: async () => {
      const response = await API.categories.getAll(query);
      return response;
    }
  });

  const createCategory = useMutation({
    mutationFn: (newCategory: Omit<Category, '_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => 
      API.categories.create(newCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
    categories: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
}

export function useCategory(id: string) {
  const { toast } = useToast();

  const categoryQuery = useQuery<ApiResponse<Category>>({
    queryKey: [`/api/category/${id}`],
    enabled: !!id,
  });

  return {
    category: categoryQuery.data?.data,
    isLoading: categoryQuery.isLoading,
    isError: categoryQuery.isError,
    error: categoryQuery.error,
  };
}

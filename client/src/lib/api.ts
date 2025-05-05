import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base URL
const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle errors here (e.g., show toast notifications)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Pagination and Query Interfaces
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IFindAllQuery extends Partial<IPaginationMeta> {
  search?: string;
  order?: { [key: string]: 'asc' | 'desc' | 1 | -1 };
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  meta?: IPaginationMeta;
}

// Types
interface Category {
  _id: string;
  name: string;
  color: string;
  is_archived: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  completedTarget?: number;
  // Add other task fields as needed
}

interface TimeSession {
  id: string;
  date: string;
  duration: number;
  // Add other time session fields as needed
}

export const API = {
  // Category endpoints
  categories: {
    getAll: async (query: IFindAllQuery = {}) => {
      const { data } = await api.get<ApiResponse<Category[]>>('/category', { 
        params: {
          ...query,
          order: query.order ? JSON.stringify(query.order) : undefined
        }
      });
      return data;
    },
    getById: async (id: string) => {
      const { data } = await api.get<ApiResponse<Category>>(`/category/${id}`);
      return data;
    },
    create: async (categoryData: Omit<Category, '_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const { data } = await api.post<ApiResponse<Category>>('/category', categoryData);
      return data;
    },
    update: async (id: string, categoryData: Partial<Category>) => {
      const { data } = await api.patch<ApiResponse<Category>>(`/category/${id}`, categoryData);
      return data;
    },
    delete: async (id: string) => {
      const { data } = await api.delete<ApiResponse<Category>>(`/category/${id}`);
      return data;
    }
  },

  // Task endpoints
  tasks: {
    getAll: async (query: IFindAllQuery = {}) => {
      const { data } = await api.get<ApiResponse<Task[]>>('/task', {
        params: {
          ...query,
          order: query.order ? JSON.stringify(query.order) : undefined
        }
      });
      return data;
    },
    getById: async (id: string) => {
      const { data } = await api.get<Task>(`/task/${id}`);
      return data;
    },
    create: async (taskData: Omit<Task, 'id'>) => {
      const formattedData = {
        ...taskData,
        start_date: formatDateToDDMMYYYY(taskData.start_date),
        end_date: taskData.end_date ? formatDateToDDMMYYYY(taskData.end_date) : undefined
      };
      const { data } = await api.post<Task>('/task', formattedData);
      return data;
    },
    update: async (id: string, taskData: Partial<Task>) => {
      const formattedData = { ...taskData };
      if (taskData.start_date) formattedData.start_date = formatDateToDDMMYYYY(taskData.start_date);
      if (taskData.end_date) formattedData.end_date = formatDateToDDMMYYYY(taskData.end_date);
      
      const { data } = await api.patch<Task>(`/task/${id}`, formattedData);
      return data;
    },
    delete: async (id: string) => {
      const { data } = await api.delete(`/task/${id}`);
      return data;
    },
    updateTaskCompletion: async (id: string, completedTarget: number) => {
      const { data } = await api.patch<Task>(`/task/${id}/complete`, { completedTarget });
      return data;
    }
  },

  // Time Session endpoints
  timeSessions: {
    getAll: async (query = {}) => {
      const { data } = await api.get<TimeSession[]>('/time-session', { params: query });
      return data;
    },
    getById: async (id: string) => {
      const { data } = await api.get<TimeSession>(`/time-session/${id}`);
      return data;
    },
    create: async (sessionData: Omit<TimeSession, 'id'>) => {
      const formattedData = {
        ...sessionData,
        date: formatDateToDDMMYYYY(sessionData.date)
      };
      const { data } = await api.post<TimeSession>('/time-session', formattedData);
      return data;
    },
    update: async (id: string, sessionData: Partial<TimeSession>) => {
      const formattedData = { ...sessionData };
      if (sessionData.date) formattedData.date = formatDateToDDMMYYYY(sessionData.date);
      
      const { data } = await api.patch<TimeSession>(`/time-session/${id}`, formattedData);
      return data;
    },
    delete: async (id: string) => {
      const { data } = await api.delete(`/time-session/${id}`);
      return data;
    }
  }
};

// Helper function to format date to DD-MM-YYYY
function formatDateToDDMMYYYY(date: string | Date): string {
  if (typeof date === 'string') {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year}`;
    }
    return date;
  }
  
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  return '';
}

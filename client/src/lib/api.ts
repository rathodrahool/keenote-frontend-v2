import { apiRequest } from "./queryClient";
import { formatDateForAPI } from "./utils";

// API base URL - pointing to NestJS backend
const API_BASE_URL = "http://localhost:3000/api";

export const API = {
  // Category endpoints
  categories: {
    getAll: async (query = {}) => {
      const queryParams = new URLSearchParams(query as Record<string, string>).toString();
      const url = `${API_BASE_URL}/category${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    getById: async (id: string) => {
      const response = await apiRequest("GET", `${API_BASE_URL}/category/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await apiRequest("POST", `${API_BASE_URL}/category`, data);
      return response.json();
    },
    update: async (id: string, data: any) => {
      const response = await apiRequest("PATCH", `${API_BASE_URL}/category/${id}`, data);
      return response.json();
    },
    delete: async (id: string) => {
      const response = await apiRequest("DELETE", `${API_BASE_URL}/category/${id}`);
      return response.json();
    }
  },

  // Task endpoints
  tasks: {
    getAll: async (query = {}) => {
      const queryParams = new URLSearchParams(query as Record<string, string>).toString();
      const url = `${API_BASE_URL}/task${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    getById: async (id: string) => {
      const response = await apiRequest("GET", `${API_BASE_URL}/task/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      // Format dates to DD-MM-YYYY as required by the backend
      const formattedData = {
        ...data,
        start_date: formatDateToDDMMYYYY(data.start_date),
        end_date: data.end_date ? formatDateToDDMMYYYY(data.end_date) : undefined
      };
      
      const response = await apiRequest("POST", `${API_BASE_URL}/task`, formattedData);
      return response.json();
    },
    update: async (id: string, data: any) => {
      // Format dates to DD-MM-YYYY as required by the backend
      const formattedData = { ...data };
      if (data.start_date) formattedData.start_date = formatDateToDDMMYYYY(data.start_date);
      if (data.end_date) formattedData.end_date = formatDateToDDMMYYYY(data.end_date);
      
      const response = await apiRequest("PATCH", `${API_BASE_URL}/task/${id}`, formattedData);
      return response.json();
    },
    delete: async (id: string) => {
      const response = await apiRequest("DELETE", `${API_BASE_URL}/task/${id}`);
      return response.json();
    },
    updateTaskCompletion: async (id: string, completedTarget: number) => {
      const response = await apiRequest("PATCH", `${API_BASE_URL}/task/${id}/complete`, { completedTarget });
      return response.json();
    }
  },

  // Time Session endpoints
  timeSessions: {
    getAll: async (query = {}) => {
      const queryParams = new URLSearchParams(query as Record<string, string>).toString();
      const url = `${API_BASE_URL}/time-session${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    getById: async (id: string) => {
      const response = await apiRequest("GET", `${API_BASE_URL}/time-session/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      // Format date to DD-MM-YYYY as required by the backend
      const formattedData = {
        ...data,
        date: formatDateToDDMMYYYY(data.date)
      };
      
      const response = await apiRequest("POST", `${API_BASE_URL}/time-session`, formattedData);
      return response.json();
    },
    update: async (id: string, data: any) => {
      // Format date to DD-MM-YYYY if present
      const formattedData = { ...data };
      if (data.date) formattedData.date = formatDateToDDMMYYYY(data.date);
      
      const response = await apiRequest("PATCH", `${API_BASE_URL}/time-session/${id}`, formattedData);
      return response.json();
    },
    delete: async (id: string) => {
      const response = await apiRequest("DELETE", `${API_BASE_URL}/time-session/${id}`);
      return response.json();
    }
  }
};

// Helper function to format date to DD-MM-YYYY as required by the backend
function formatDateToDDMMYYYY(date: string | Date): string {
  if (typeof date === 'string') {
    // If it's already in YYYY-MM-DD format (from input type="date")
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year}`;
    }
    return date; // Assume it's already in correct format
  }
  
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  return ''; // Return empty string as fallback
}

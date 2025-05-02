import { apiRequest } from "./queryClient";

// API base URL
const API_BASE_URL = "/api";

export const API = {
  // Category endpoints
  categories: {
    getAll: async (query = {}) => {
      const queryParams = new URLSearchParams(query as Record<string, string>).toString();
      const url = `${API_BASE_URL}/categories${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    getById: async (id: string) => {
      const response = await apiRequest("GET", `${API_BASE_URL}/categories/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await apiRequest("POST", `${API_BASE_URL}/categories`, data);
      return response.json();
    },
    update: async (id: string, data: any) => {
      const response = await apiRequest("PATCH", `${API_BASE_URL}/categories/${id}`, data);
      return response.json();
    },
    delete: async (id: string) => {
      const response = await apiRequest("DELETE", `${API_BASE_URL}/categories/${id}`);
      return response.json();
    }
  },

  // Task endpoints
  tasks: {
    getAll: async (query = {}) => {
      const queryParams = new URLSearchParams(query as Record<string, string>).toString();
      const url = `${API_BASE_URL}/tasks${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    getById: async (id: string) => {
      const response = await apiRequest("GET", `${API_BASE_URL}/tasks/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await apiRequest("POST", `${API_BASE_URL}/tasks`, data);
      return response.json();
    },
    update: async (id: string, data: any) => {
      const response = await apiRequest("PATCH", `${API_BASE_URL}/tasks/${id}`, data);
      return response.json();
    },
    delete: async (id: string) => {
      const response = await apiRequest("DELETE", `${API_BASE_URL}/tasks/${id}`);
      return response.json();
    },
    updateCompletion: async (id: string, completedTarget: number) => {
      const response = await apiRequest("PATCH", `${API_BASE_URL}/tasks/${id}/completion`, { completed_target: completedTarget });
      return response.json();
    }
  },

  // Time Session endpoints
  timeSessions: {
    getAll: async (query = {}) => {
      const queryParams = new URLSearchParams(query as Record<string, string>).toString();
      const url = `${API_BASE_URL}/time-sessions${queryParams ? `?${queryParams}` : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    getById: async (id: string) => {
      const response = await apiRequest("GET", `${API_BASE_URL}/time-sessions/${id}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await apiRequest("POST", `${API_BASE_URL}/time-sessions`, data);
      return response.json();
    },
    update: async (id: string, data: any) => {
      const response = await apiRequest("PATCH", `${API_BASE_URL}/time-sessions/${id}`, data);
      return response.json();
    },
    delete: async (id: string) => {
      const response = await apiRequest("DELETE", `${API_BASE_URL}/time-sessions/${id}`);
      return response.json();
    }
  }
};

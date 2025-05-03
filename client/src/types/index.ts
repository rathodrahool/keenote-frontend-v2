import { TaskFrequency, TaskType, Status, SessionStatus } from "@/lib/constants";

export interface Category {
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

export interface Task {
  _id: string;
  name: string;
  task_type: TaskType;
  task_frequency: TaskFrequency;
  duration?: number;
  target?: number;
  start_date: string;
  end_date?: string;
  category: Category | string;
  status: Status;
  parent_task_id?: string;
  is_template: boolean;
  period_start_date?: string;
  period_end_date?: string;
  completed_count: number;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSession {
  _id: string;
  task: Task | string;
  date: string;
  status: SessionStatus;
  duration_minutes?: number;
  completed_target?: number;
  remaining_duration?: number;
  is_period_completed: boolean;
  period_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  page: number;
  limit: number;
  total: number;
}

export interface FindAllQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}

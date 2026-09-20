export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  status: TaskStatus;
}

export interface User {
  id?: number;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
  errors?: Record<string, string>;
}

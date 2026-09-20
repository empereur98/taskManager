import { apiClient } from './client';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../types';

export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    return apiClient<Task[]>('/api/tasks', {
      method: 'GET',
    });
  },

  createTask: async (data: CreateTaskDto): Promise<Task> => {
    return apiClient<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTask: async (id: number, data: UpdateTaskDto): Promise<Task> => {
    return apiClient<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTask: async (id: number): Promise<void> => {
    return apiClient<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

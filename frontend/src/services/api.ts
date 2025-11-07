import axios from 'axios';
import type { CalendarEvent, CalendarConfig, Task, Meal, OverlayStatus } from '../types';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Calendar API
export const calendarAPI = {
  getEvents: async (start?: Date, end?: Date) => {
    const params = new URLSearchParams();
    if (start) params.append('start', start.toISOString());
    if (end) params.append('end', end.toISOString());
    
    const response = await api.get<{ events: CalendarEvent[] }>(`/api/calendar/events?${params}`);
    return response.data.events;
  },
  
  getConfig: async () => {
    const response = await api.get<{ calendars: CalendarConfig[] }>('/api/calendar/config');
    return response.data.calendars;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async () => {
    const response = await api.get<{ tasks: Task[] }>('/api/tasks');
    return response.data.tasks;
  },
  
  createTask: async (content: string, description?: string, dueDate?: string, priority?: number) => {
    const response = await api.post<{ task: Task }>('/api/tasks', {
      content,
      description,
      dueDate,
      priority,
    });
    return response.data.task;
  },
  
  completeTask: async (taskId: string) => {
    await api.post(`/api/tasks/${taskId}/complete`);
  },
  
  deleteTask: async (taskId: string) => {
    await api.delete(`/api/tasks/${taskId}`);
  },
};

// Meals API
export const mealsAPI = {
  getMeals: async () => {
    const response = await api.get<{ meals: Meal[] }>('/api/meals');
    return response.data.meals;
  },
  
  getTodaysMeal: async () => {
    const response = await api.get<{ meal: Meal }>('/api/meals/today');
    return response.data.meal;
  },
  
  updateMeals: async (meals: Meal[]) => {
    await api.put('/api/meals', { meals });
  },
};

// Overlay API
export const overlayAPI = {
  getStatus: async () => {
    const response = await api.get<OverlayStatus>('/api/overlay/status');
    return response.data;
  },
  
  trigger: async (cameraEntityId?: string, duration?: number) => {
    const response = await api.post<{ overlay: OverlayStatus }>('/api/overlay/trigger', {
      cameraEntityId,
      duration,
    });
    return response.data.overlay;
  },
  
  dismiss: async () => {
    const response = await api.post<OverlayStatus>('/api/overlay/dismiss');
    return response.data;
  },
};

// View State API (for syncing navigation between devices)
export const viewStateAPI = {
  getCurrentView: async () => {
    const response = await api.get<{ path: string; timestamp: string }>('/api/view-state');
    return response.data;
  },
  
  setCurrentView: async (path: string) => {
    const response = await api.post<{ success: boolean; viewState: { path: string; timestamp: string } }>('/api/view-state', { path });
    return response.data;
  },
};


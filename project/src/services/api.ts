import axios from 'axios';
import { LoginData, RegisterData, AuthResponse, User, Project, WeeklyUpload } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginData) => api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/login', data),
  register: (data: RegisterData) => api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/register', data),
  verifyToken: () => api.get<{ user: User }>('/auth/verify'),
  getFaculty: (branch: string) => api.get<{ success: boolean; faculty: User[] }>(`/auth/faculty/${branch}`)
};

export const projectAPI = {
  getProjects: () => api.get<{ success: boolean; projects: Project[] }>('/projects'),
  getProjectById: (id: string) => api.get<{ success: boolean; project: Project }>(`/projects/${id}`),
  createProject: (data: any) => api.post<{ success: boolean; project: Project }>('/projects', data),
  updateProject: (id: string, data: Partial<Project>) => api.put<{ success: boolean; project: Project }>(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  getStudentProjects: () => api.get<{ success: boolean; projects: Project[] }>('/projects/student'),
  getFacultyProjects: () => api.get<{ success: boolean; projects: Project[] }>('/projects/faculty')
};

export const uploadAPI = {
  getUploads: (projectId: string) => api.get<{ success: boolean; uploads: WeeklyUpload[] }>(`/uploads/${projectId}`),
  createUpload: (data: FormData) => api.post<{ success: boolean; upload: WeeklyUpload }>('/uploads', data),
  updateUpload: (id: string, data: Partial<WeeklyUpload>) => api.put<{ success: boolean; upload: WeeklyUpload }>(`/uploads/${id}`, data),
  deleteUpload: (id: string) => api.delete(`/uploads/${id}`),
  downloadFile: (filename: string) => api.get(`/uploads/download/${filename}`, { responseType: 'blob' })
};

export default api;
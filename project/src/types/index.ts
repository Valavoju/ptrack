export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  branch: string;
  studentId?: string;
  year?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  abstract: string;
  type: 'RTP' | 'Mini' | 'Major';
  student: User;
  mentor?: User;
  branch: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyUpload {
  _id: string;
  project: string;
  student: string;
  week: number;
  title: string;
  description: string;
  files: UploadedFile[];
  feedback?: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  branch: string;
  studentId?: string;
  year?: number;
}

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  type: 'upload' | 'feedback' | 'assignment';
  read: boolean;
  createdAt: string;
}

export const BRANCHES = [
  'Computer Science Engineering',
  'Artificial Intelligence & Machine Learning',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Chemical Engineering'
] as const;

export const PROJECT_TYPES = [
  { value: 'RTP', label: 'Real-Time Project (2nd Year)' },
  { value: 'Mini', label: 'Mini Project (3rd Year)' },
  { value: 'Major', label: 'Major Project (4th Year)' }
] as const;
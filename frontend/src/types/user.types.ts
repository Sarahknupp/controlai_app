export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
} 
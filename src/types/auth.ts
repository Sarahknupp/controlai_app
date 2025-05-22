import { IUser, UserSettings } from './user';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
  timezone: string;
  dateFormat: string;
}

export type Permission = 
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'audit.view'
  | 'audit.export'
  | 'settings.view'
  | 'settings.edit';

export interface AuthContextType {
  user: IUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<IUser>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export type { IUser, UserSettings }; 
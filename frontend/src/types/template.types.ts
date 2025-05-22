export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  categoryId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  changeReason: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  categoryId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  changeReason?: string;
  currentVersion: number;
  versions: TemplateVersion[];
}

export interface CreateTemplateData {
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  categoryId: string;
  changeReason?: string;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  subject?: string;
  body?: string;
  variables?: string[];
  categoryId?: string;
  active?: boolean;
  changeReason?: string;
}

export interface TemplateSearchParams {
  search?: string;
  categoryId?: string;
  active?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface VersionHistoryParams {
  templateId: string;
  page?: number;
  limit?: number;
  sortBy?: 'version' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
} 
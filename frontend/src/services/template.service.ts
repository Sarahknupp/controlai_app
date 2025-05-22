import { NotificationTemplate, CreateTemplateData, UpdateTemplateData, TemplateCategory, TemplateSearchParams, TemplateVersion, VersionHistoryParams, PaginatedResponse } from '../types/template.types';

class TemplateService {
  private readonly API_URL = '/api/templates';
  private readonly CATEGORIES_URL = '/api/template-categories';

  async getTemplates(params: TemplateSearchParams): Promise<PaginatedResponse<NotificationTemplate>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.active !== undefined) queryParams.append('active', params.active.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${this.API_URL}?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return response.json();
  }

  async getTemplate(id: string): Promise<NotificationTemplate> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    return response.json();
  }

  async createTemplate(templateData: CreateTemplateData): Promise<NotificationTemplate> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(templateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create template');
    }

    return response.json();
  }

  async updateTemplate(id: string, templateData: UpdateTemplateData): Promise<NotificationTemplate> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(templateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update template');
    }

    return response.json();
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete template');
    }
  }

  async toggleTemplateActive(id: string, active: boolean): Promise<NotificationTemplate> {
    return this.updateTemplate(id, { active });
  }

  async previewTemplate(id: string, variables: Record<string, string>): Promise<{ subject: string; body: string }> {
    const response = await fetch(`${this.API_URL}/${id}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ variables })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to preview template');
    }

    return response.json();
  }

  // Category management methods
  async getCategories(): Promise<TemplateCategory[]> {
    const response = await fetch(this.CATEGORIES_URL, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async createCategory(name: string, description: string): Promise<TemplateCategory> {
    const response = await fetch(this.CATEGORIES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    return response.json();
  }

  async updateCategory(id: string, name: string, description: string): Promise<TemplateCategory> {
    const response = await fetch(`${this.CATEGORIES_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    return response.json();
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${this.CATEGORIES_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete category');
    }
  }

  async getTemplateVersions(params: VersionHistoryParams): Promise<TemplateVersion[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('templateId', params.templateId);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.API_URL}/versions?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template versions');
    }

    return response.json();
  }

  async getTemplateVersion(templateId: string, version: number): Promise<TemplateVersion> {
    const response = await fetch(`${this.API_URL}/${templateId}/versions/${version}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template version');
    }

    return response.json();
  }

  async restoreTemplateVersion(templateId: string, version: number, changeReason: string): Promise<NotificationTemplate> {
    const response = await fetch(`${this.API_URL}/${templateId}/restore/${version}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ changeReason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to restore template version');
    }

    return response.json();
  }

  async compareVersions(templateId: string, version1: number, version2: number): Promise<{
    version1: TemplateVersion;
    version2: TemplateVersion;
    differences: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
  }> {
    const response = await fetch(`${this.API_URL}/${templateId}/compare?version1=${version1}&version2=${version2}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to compare template versions');
    }

    return response.json();
  }
}

const templateServiceInstance = new TemplateService();

export const templateService = {
  getTemplates: (params: TemplateSearchParams) => templateServiceInstance.getTemplates(params),
  getTemplate: (id: string) => templateServiceInstance.getTemplate(id),
  createTemplate: (templateData: CreateTemplateData) => templateServiceInstance.createTemplate(templateData),
  updateTemplate: (id: string, templateData: UpdateTemplateData) => templateServiceInstance.updateTemplate(id, templateData),
  deleteTemplate: (id: string) => templateServiceInstance.deleteTemplate(id),
  toggleTemplateActive: (id: string, active: boolean) => templateServiceInstance.toggleTemplateActive(id, active),
  previewTemplate: (id: string, variables: Record<string, string>) => templateServiceInstance.previewTemplate(id, variables),
  getCategories: () => templateServiceInstance.getCategories(),
  createCategory: (name: string, description: string) => templateServiceInstance.createCategory(name, description),
  updateCategory: (id: string, name: string, description: string) => templateServiceInstance.updateCategory(id, name, description),
  deleteCategory: (id: string) => templateServiceInstance.deleteCategory(id),
  getTemplateVersions: (params: VersionHistoryParams) => templateServiceInstance.getTemplateVersions(params),
  getTemplateVersion: (templateId: string, version: number) => templateServiceInstance.getTemplateVersion(templateId, version),
  restoreTemplateVersion: (templateId: string, version: number, changeReason: string) => templateServiceInstance.restoreTemplateVersion(templateId, version, changeReason),
  compareVersions: (templateId: string, version1: number, version2: number) => templateServiceInstance.compareVersions(templateId, version1, version2)
}; 
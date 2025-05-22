import templateService from '../../services/template.service';
import { NotificationTemplate, TemplateCategory, TemplateVersion } from '../../types/template.types';

// Mock fetch
global.fetch = jest.fn();

describe('TemplateService', () => {
  const mockToken = 'test-token';
  const mockTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      description: 'Welcome email for new users',
      subject: 'Welcome to our service',
      body: 'Hello {{name}}, welcome to our service!',
      variables: ['name', 'email'],
      categoryId: '1',
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z',
      currentVersion: 1,
      versions: []
    }
  ];

  const mockCategories: TemplateCategory[] = [
    {
      id: '1',
      name: 'Welcome Emails',
      description: 'Templates for welcoming new users',
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z'
    }
  ];

  const mockVersions: TemplateVersion[] = [
    {
      id: 'v1',
      templateId: '1',
      version: 1,
      name: 'Welcome Email',
      description: 'Welcome email for new users',
      subject: 'Welcome to our service',
      body: 'Hello {{name}}, welcome to our service!',
      variables: ['name', 'email'],
      categoryId: '1',
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z',
      createdBy: 'user1',
      changeReason: 'Initial version'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', mockToken);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTemplates[0])
    });
  });

  describe('getTemplates', () => {
    it('fetches templates successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTemplates)
      });

      const result = await templateService.getTemplates();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(mockTemplates);
    });

    it('handles search parameters correctly', async () => {
      const searchParams = {
        search: 'welcome',
        categoryId: '1',
        active: true,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const
      };

      await templateService.getTemplates(searchParams);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates?search=welcome&categoryId=1&active=true&sortBy=name&sortOrder=asc',
        expect.any(Object)
      );
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(templateService.getTemplates()).rejects.toThrow('Failed to fetch templates');
    });
  });

  describe('getTemplate', () => {
    it('fetches single template successfully', async () => {
      const result = await templateService.getTemplate('1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/1',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(mockTemplates[0]);
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(templateService.getTemplate('1')).rejects.toThrow('Failed to fetch template');
    });
  });

  describe('createTemplate', () => {
    const newTemplate = {
      name: 'New Template',
      description: 'A new template',
      subject: 'New Subject',
      body: 'Hello {{name}}',
      variables: ['name'],
      categoryId: '1',
      changeReason: 'Creating new template'
    };

    it('creates template successfully', async () => {
      const result = await templateService.createTemplate(newTemplate);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify(newTemplate)
        })
      );
      expect(result).toEqual(mockTemplates[0]);
    });

    it('throws error with message when creation fails', async () => {
      const errorMessage = 'Template name already exists';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(templateService.createTemplate(newTemplate)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateTemplate', () => {
    const updateData = {
      name: 'Updated Template',
      changeReason: 'Updating template'
    };

    it('updates template successfully', async () => {
      const result = await templateService.updateTemplate('1', updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(mockTemplates[0]);
    });

    it('throws error with message when update fails', async () => {
      const errorMessage = 'Template not found';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(templateService.updateTemplate('1', updateData)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteTemplate', () => {
    it('deletes template successfully', async () => {
      await templateService.deleteTemplate('1');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
    });

    it('throws error with message when deletion fails', async () => {
      const errorMessage = 'Cannot delete active template';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(templateService.deleteTemplate('1')).rejects.toThrow(errorMessage);
    });
  });

  describe('toggleTemplateActive', () => {
    it('toggles template active status', async () => {
      const result = await templateService.toggleTemplateActive('1', false);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({ active: false })
        })
      );
      expect(result).toEqual(mockTemplates[0]);
    });
  });

  describe('previewTemplate', () => {
    const variables = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    it('previews template successfully', async () => {
      const previewResult = {
        subject: 'Welcome to our service',
        body: 'Hello John Doe, welcome to our service!'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(previewResult)
      });

      const result = await templateService.previewTemplate('1', variables);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/1/preview',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({ variables })
        })
      );
      expect(result).toEqual(previewResult);
    });

    it('throws error with message when preview fails', async () => {
      const errorMessage = 'Invalid variable values';
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(templateService.previewTemplate('1', variables)).rejects.toThrow(errorMessage);
    });
  });

  describe('getCategories', () => {
    it('fetches categories successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      });

      const result = await templateService.getCategories();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/template-categories',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(mockCategories);
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(templateService.getCategories()).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('getTemplateVersions', () => {
    it('fetches template versions successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVersions)
      });

      const result = await templateService.getTemplateVersions({
        templateId: '1',
        sortBy: 'version',
        sortOrder: 'desc'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/versions?templateId=1&sortBy=version&sortOrder=desc',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(mockVersions);
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(templateService.getTemplateVersions({ templateId: '1' }))
        .rejects.toThrow('Failed to fetch template versions');
    });
  });

  describe('compareVersions', () => {
    const compareResult = {
      version1: mockVersions[0],
      version2: mockVersions[0],
      differences: [
        {
          field: 'body',
          oldValue: 'Hello {{name}}',
          newValue: 'Hello {{name}}, welcome!'
        }
      ]
    };

    it('compares versions successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(compareResult)
      });

      const result = await templateService.compareVersions('1', 1, 2);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/templates/1/compare?version1=1&version2=2',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
      expect(result).toEqual(compareResult);
    });

    it('throws error when comparison fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(templateService.compareVersions('1', 1, 2))
        .rejects.toThrow('Failed to compare template versions');
    });
  });
}); 
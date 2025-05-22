import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import templateService from '../../services/template.service';
import TemplateManagement from '../../components/TemplateManagement';
import '@testing-library/jest-dom';

// Mock templateService
jest.mock('../../services/template.service', () => ({
  __esModule: true,
  default: {
    getTemplates: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
    toggleTemplateActive: jest.fn(),
    previewTemplate: jest.fn(),
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getTemplateVersions: jest.fn(),
    getTemplateVersion: jest.fn(),
    restoreTemplateVersion: jest.fn(),
    compareVersions: jest.fn()
  }
}));

describe('TemplateManagement', () => {
  const mockCategories = [
    {
      id: '1',
      name: 'Welcome Emails',
      description: 'Templates for welcoming new users',
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z'
    },
    {
      id: '2',
      name: 'Password Reset',
      description: 'Templates for password reset emails',
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z'
    }
  ];

  const mockTemplates = [
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
      currentVersion: 2,
      versions: [
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
        },
        {
          id: 'v2',
          templateId: '1',
          version: 2,
          name: 'Welcome Email',
          description: 'Welcome email for new users',
          subject: 'Welcome to our service',
          body: 'Hello {{name}}, welcome to our service!',
          variables: ['name', 'email'],
          categoryId: '1',
          active: true,
          createdAt: '2024-03-20T11:00:00Z',
          updatedAt: '2024-03-20T11:00:00Z',
          createdBy: 'user1',
          changeReason: 'Updated greeting'
        }
      ]
    },
    {
      id: '2',
      name: 'Password Reset',
      description: 'Password reset email template',
      subject: 'Reset your password',
      body: 'Click here to reset your password: {{resetLink}}',
      variables: ['resetLink'],
      categoryId: '2',
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T10:00:00Z',
      currentVersion: 1,
      versions: [
        {
          id: 'v1',
          templateId: '2',
          version: 1,
          name: 'Password Reset',
          description: 'Password reset email template',
          subject: 'Reset your password',
          body: 'Click here to reset your password: {{resetLink}}',
          variables: ['resetLink'],
          categoryId: '2',
          active: true,
          createdAt: '2024-03-20T10:00:00Z',
          updatedAt: '2024-03-20T10:00:00Z',
          createdBy: 'user1',
          changeReason: 'Initial version'
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (templateService.getTemplates as jest.Mock).mockResolvedValue(mockTemplates);
    (templateService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  it('renders loading state initially', () => {
    render(<TemplateManagement />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders templates table after loading', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
      expect(screen.getByText('Password Reset')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome email for new users')).toBeInTheDocument();
    expect(screen.getByText('Password reset email template')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('resetLink')).toBeInTheDocument();
    expect(screen.getByText('Welcome Emails')).toBeInTheDocument();
    expect(screen.getByText('Password Reset')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch templates';
    (templateService.getTemplates as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('opens create template dialog when clicking Add Template', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Add Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Template'));

    expect(screen.getByText('Add New Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Body')).toBeInTheDocument();
    expect(screen.getByLabelText('Variables (comma-separated)')).toBeInTheDocument();
  });

  it('creates new template successfully', async () => {
    const newTemplate = {
      name: 'New Template',
      description: 'A new notification template',
      subject: 'New Subject',
      body: 'Hello {{name}}, this is a new template.',
      variables: ['name', 'email'],
      categoryId: '1'
    };

    (templateService.createTemplate as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newTemplate,
      active: true,
      createdAt: '2024-03-20T16:00:00Z',
      updatedAt: '2024-03-20T16:00:00Z'
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Add Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Template'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: newTemplate.name }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: newTemplate.description }
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: newTemplate.categoryId }
    });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: newTemplate.subject }
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: newTemplate.body }
    });
    fireEvent.change(screen.getByLabelText('Variables (comma-separated)'), {
      target: { value: 'name, email' }
    });

    fireEvent.click(screen.getByText('Create Template'));

    await waitFor(() => {
      expect(templateService.createTemplate).toHaveBeenCalledWith(newTemplate);
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('opens edit template dialog when clicking Edit in menu', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Edit'));

    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Welcome Email');
    expect(screen.getByLabelText('Description')).toHaveValue('Welcome email for new users');
    expect(screen.getByLabelText('Category')).toHaveValue('1');
    expect(screen.getByLabelText('Subject')).toHaveValue('Welcome to our service');
    expect(screen.getByLabelText('Body')).toHaveValue('Hello {{name}}, welcome to our service!');
    expect(screen.getByLabelText('Variables (comma-separated)')).toHaveValue('name, email');
  });

  it('updates template successfully', async () => {
    const updatedData = {
      name: 'Updated Welcome Email',
      description: 'Updated welcome email template',
      categoryId: '2'
    };

    (templateService.updateTemplate as jest.Mock).mockResolvedValueOnce({
      ...mockTemplates[0],
      ...updatedData
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: updatedData.name }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: updatedData.description }
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: updatedData.categoryId }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(templateService.updateTemplate).toHaveBeenCalledWith('1', updatedData);
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes template successfully', async () => {
    (templateService.deleteTemplate as jest.Mock).mockResolvedValueOnce(undefined);

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(templateService.deleteTemplate).toHaveBeenCalledWith('1');
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('toggles template active status', async () => {
    (templateService.toggleTemplateActive as jest.Mock).mockResolvedValueOnce({
      ...mockTemplates[0],
      active: false
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const switchElement = screen.getAllByRole('checkbox')[0];
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(templateService.toggleTemplateActive).toHaveBeenCalledWith('1', false);
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('previews template successfully', async () => {
    const previewResult = {
      subject: 'Welcome to our service',
      body: 'Hello John Doe, welcome to our service!'
    };

    (templateService.previewTemplate as jest.Mock).mockResolvedValueOnce(previewResult);

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Preview'));

    fireEvent.change(screen.getByLabelText('name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByLabelText('email'), {
      target: { value: 'john@example.com' }
    });

    fireEvent.click(screen.getByText('Preview'));

    await waitFor(() => {
      expect(templateService.previewTemplate).toHaveBeenCalledWith('1', {
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(screen.getByText('Subject: Welcome to our service')).toBeInTheDocument();
      expect(screen.getByText('Hello John Doe, welcome to our service!')).toBeInTheDocument();
    });
  });

  it('refreshes template list when clicking Refresh button', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('opens create category dialog when clicking Manage Categories', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Manage Categories'));

    expect(screen.getByText('Add New Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('creates new category successfully', async () => {
    const newCategory = {
      name: 'New Category',
      description: 'A new template category'
    };

    (templateService.createCategory as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newCategory,
      createdAt: '2024-03-20T16:00:00Z',
      updatedAt: '2024-03-20T16:00:00Z'
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Manage Categories'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: newCategory.name }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: newCategory.description }
    });

    fireEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(templateService.createCategory).toHaveBeenCalledWith(
        newCategory.name,
        newCategory.description
      );
      expect(templateService.getCategories).toHaveBeenCalledTimes(2);
    });
  });

  it('filters templates by search term', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search templates...'), {
      target: { value: 'Welcome' }
    });

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Welcome'
        })
      );
    });
  });

  it('filters templates by category', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: '1'
        })
      );
    });
  });

  it('filters templates by active status', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Active Only'));

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          active: true
        })
      );
    });
  });

  it('sorts templates by name', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Sort By'), {
      target: { value: 'name-desc' }
    });

    await waitFor(() => {
      expect(templateService.getTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'name',
          sortOrder: 'desc'
        })
      );
    });
  });

  it('includes change reason when creating template', async () => {
    const newTemplate = {
      name: 'New Template',
      description: 'A new notification template',
      subject: 'New Subject',
      body: 'Hello {{name}}, this is a new template.',
      variables: ['name', 'email'],
      categoryId: '1',
      changeReason: 'Creating new template'
    };

    (templateService.createTemplate as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newTemplate,
      active: true,
      createdAt: '2024-03-20T16:00:00Z',
      updatedAt: '2024-03-20T16:00:00Z',
      currentVersion: 1,
      versions: [
        {
          id: 'v1',
          templateId: '3',
          version: 1,
          ...newTemplate,
          active: true,
          createdAt: '2024-03-20T16:00:00Z',
          updatedAt: '2024-03-20T16:00:00Z',
          createdBy: 'user1'
        }
      ]
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Add Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Template'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: newTemplate.name }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: newTemplate.description }
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: newTemplate.categoryId }
    });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: newTemplate.subject }
    });
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: newTemplate.body }
    });
    fireEvent.change(screen.getByLabelText('Variables (comma-separated)'), {
      target: { value: 'name, email' }
    });
    fireEvent.change(screen.getByLabelText('Change Reason'), {
      target: { value: newTemplate.changeReason }
    });

    fireEvent.click(screen.getByText('Create Template'));

    await waitFor(() => {
      expect(templateService.createTemplate).toHaveBeenCalledWith(newTemplate);
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('includes change reason when updating template', async () => {
    const updatedData = {
      name: 'Updated Welcome Email',
      description: 'Updated welcome email template',
      categoryId: '2',
      changeReason: 'Updating template details'
    };

    (templateService.updateTemplate as jest.Mock).mockResolvedValueOnce({
      ...mockTemplates[0],
      ...updatedData,
      currentVersion: 3,
      versions: [
        ...mockTemplates[0].versions,
        {
          id: 'v3',
          templateId: '1',
          version: 3,
          ...updatedData,
          subject: mockTemplates[0].subject,
          body: mockTemplates[0].body,
          variables: mockTemplates[0].variables,
          active: true,
          createdAt: '2024-03-20T16:00:00Z',
          updatedAt: '2024-03-20T16:00:00Z',
          createdBy: 'user1'
        }
      ]
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: updatedData.name }
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: updatedData.description }
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: updatedData.categoryId }
    });
    fireEvent.change(screen.getByLabelText('Change Reason'), {
      target: { value: updatedData.changeReason }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(templateService.updateTemplate).toHaveBeenCalledWith('1', updatedData);
      expect(templateService.getTemplates).toHaveBeenCalledTimes(2);
    });
  });

  it('shows version history button in template actions', async () => {
    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    expect(screen.getByTestId('HistoryIcon')).toBeInTheDocument();
  });
}); 
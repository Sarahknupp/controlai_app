import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { templateService } from '../../services/template.service';
import TemplateManagement from '../../components/TemplateManagement';
import '@testing-library/jest-dom';

// Mock templateService
jest.mock('../../services/template.service', () => ({
  templateService: {
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

  const mockTemplates = {
    items: [
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
        createdBy: 'user1',
        changeReason: 'Initial version',
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
        createdBy: 'user1',
        changeReason: 'Initial version',
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
    ],
    total: 2,
    page: 1,
    limit: 10
  };

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
      expect(screen.getByText('Adicionar Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Adicionar Template'));

    expect(screen.getByText('Adicionar Novo Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument();
    expect(screen.getByLabelText('Assunto')).toBeInTheDocument();
    expect(screen.getByLabelText('Corpo')).toBeInTheDocument();
    expect(screen.getByLabelText('Variáveis (separadas por vírgula)')).toBeInTheDocument();
  });

  it('creates new template successfully', async () => {
    const newTemplate = {
      name: 'New Template',
      description: 'A new notification template',
      subject: 'New Subject',
      body: 'Hello {{name}}, this is a new template.',
      variables: ['name', 'email'],
      categoryId: '1',
      changeReason: 'Initial version'
    };

    (templateService.createTemplate as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newTemplate,
      active: true,
      createdAt: '2024-03-20T16:00:00Z',
      updatedAt: '2024-03-20T16:00:00Z',
      createdBy: 'user1',
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
      expect(screen.getByText('Adicionar Template')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Adicionar Template'));

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: newTemplate.name } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: newTemplate.description } });
    fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: newTemplate.subject } });
    fireEvent.change(screen.getByLabelText('Corpo'), { target: { value: newTemplate.body } });
    fireEvent.change(screen.getByLabelText('Variáveis (separadas por vírgula)'), { target: { value: 'name,email' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: newTemplate.categoryId } });
    fireEvent.change(screen.getByLabelText('Motivo da Alteração'), { target: { value: newTemplate.changeReason } });

    fireEvent.click(screen.getByText('Criar Template'));

    await waitFor(() => {
      expect(templateService.createTemplate).toHaveBeenCalledWith(newTemplate);
      expect(screen.getByText('Template criado com sucesso')).toBeInTheDocument();
    });
  });

  it('updates template successfully', async () => {
    const updatedTemplate = {
      name: 'Updated Welcome Email',
      description: 'Updated welcome email for new users',
      subject: 'Welcome to our updated service',
      body: 'Hello {{name}}, welcome to our updated service!',
      variables: ['name', 'email'],
      categoryId: '1',
      changeReason: 'Updated content'
    };

    (templateService.updateTemplate as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...updatedTemplate,
      active: true,
      createdAt: '2024-03-20T10:00:00Z',
      updatedAt: '2024-03-20T17:00:00Z',
      createdBy: 'user1',
      currentVersion: 3,
      versions: [
        ...mockTemplates.items[0].versions,
        {
          id: 'v3',
          templateId: '1',
          version: 3,
          ...updatedTemplate,
          active: true,
          createdAt: '2024-03-20T17:00:00Z',
          updatedAt: '2024-03-20T17:00:00Z',
          createdBy: 'user1'
        }
      ]
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Editar'));

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: updatedTemplate.name } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: updatedTemplate.description } });
    fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: updatedTemplate.subject } });
    fireEvent.change(screen.getByLabelText('Corpo'), { target: { value: updatedTemplate.body } });
    fireEvent.change(screen.getByLabelText('Motivo da Alteração'), { target: { value: updatedTemplate.changeReason } });

    fireEvent.click(screen.getByText('Salvar Alterações'));

    await waitFor(() => {
      expect(templateService.updateTemplate).toHaveBeenCalledWith('1', updatedTemplate);
      expect(screen.getByText('Template atualizado com sucesso')).toBeInTheDocument();
    });
  });

  it('deletes template successfully', async () => {
    (templateService.deleteTemplate as jest.Mock).mockResolvedValueOnce(undefined);

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Excluir'));

    fireEvent.click(screen.getByText('Confirmar Exclusão'));

    await waitFor(() => {
      expect(templateService.deleteTemplate).toHaveBeenCalledWith('1');
      expect(screen.getByText('Template excluído com sucesso')).toBeInTheDocument();
    });
  });

  it('toggles template active state', async () => {
    (templateService.toggleTemplateActive as jest.Mock).mockResolvedValueOnce({
      ...mockTemplates.items[0],
      active: false
    });

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    const toggle = screen.getAllByRole('checkbox')[0];
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(templateService.toggleTemplateActive).toHaveBeenCalledWith('1', false);
      expect(screen.getByText('Status do template atualizado com sucesso')).toBeInTheDocument();
    });
  });

  it('previews template with variables', async () => {
    const previewResult = {
      subject: 'Welcome to our service, John',
      body: 'Hello John, welcome to our service!'
    };

    (templateService.previewTemplate as jest.Mock).mockResolvedValueOnce(previewResult);

    render(<TemplateManagement />);

    await waitFor(() => {
      expect(screen.getByText('Welcome Email')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Visualizar'));

    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'john@example.com' } });

    fireEvent.click(screen.getByText('Visualizar'));

    await waitFor(() => {
      expect(templateService.previewTemplate).toHaveBeenCalledWith('1', {
        name: 'John',
        email: 'john@example.com'
      });
      expect(screen.getByText('Assunto: Welcome to our service, John')).toBeInTheDocument();
      expect(screen.getByText('Hello John, welcome to our service!')).toBeInTheDocument();
    });
  });
}); 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateVersionHistory from '../../components/TemplateVersionHistory';
import { templateService } from '../../services/template.service';
import { NotificationTemplate, TemplateVersion } from '../../types/template.types';
import '@testing-library/jest-dom';

// Mock templateService
jest.mock('../../services/template.service', () => ({
  templateService: {
    getTemplateVersions: jest.fn(),
    getTemplateVersion: jest.fn(),
    restoreTemplateVersion: jest.fn(),
    compareVersions: jest.fn()
  }
}));

const mockTemplate: NotificationTemplate = {
  id: 'template-1',
  name: 'Test Template',
  description: 'Test Description',
  subject: 'Test Subject',
  body: 'Test Body',
  variables: ['var1', 'var2'],
  categoryId: 'category-1',
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'user-1',
  currentVersion: 2,
  versions: [
    {
      id: 'version-1',
      templateId: 'template-1',
      version: 1,
      name: 'Test Template',
      description: 'Test Description',
      subject: 'Old Subject',
      body: 'Old Body',
      variables: ['var1', 'var2'],
      categoryId: 'category-1',
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      createdBy: 'user-1',
      changeReason: 'Initial version'
    },
    {
      id: 'version-2',
      templateId: 'template-1',
      version: 2,
      name: 'Test Template',
      description: 'Updated Description',
      subject: 'Test Subject',
      body: 'Test Body',
      variables: ['var1', 'var2'],
      categoryId: 'category-1',
      active: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      createdBy: 'user-1',
      changeReason: 'Updated content'
    }
  ]
};

describe('TemplateVersionHistory', () => {
  const mockOnVersionRestored = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders version history button', () => {
    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    expect(screen.getByTitle('Version History')).toBeInTheDocument();
  });

  it('opens version history dialog when button is clicked', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockResolvedValueOnce(mockTemplate.versions);

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      expect(screen.getByText('Version History')).toBeInTheDocument();
    });
  });

  it('displays version list with current version marked', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockResolvedValueOnce(mockTemplate.versions);

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
      expect(screen.getByText('Initial version')).toBeInTheDocument();
      expect(screen.getByText('Updated content')).toBeInTheDocument();
    });
  });

  it('opens restore dialog when restore button is clicked', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockResolvedValueOnce(mockTemplate.versions);

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Version 1'));
    });

    expect(screen.getByText('Restore This Version')).toBeInTheDocument();
  });

  it('restores version when restore is confirmed', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockResolvedValueOnce(mockTemplate.versions);
    (templateService.restoreTemplateVersion as jest.Mock).mockResolvedValueOnce(mockTemplate);

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Version 1'));
    });

    const restoreReasonInput = screen.getByLabelText('Restore Reason');
    await userEvent.type(restoreReasonInput, 'Restoring to previous version');

    fireEvent.click(screen.getByText('Restore This Version'));

    await waitFor(() => {
      expect(templateService.restoreTemplateVersion).toHaveBeenCalledWith(
        'template-1',
        'version-1',
        'Restoring to previous version'
      );
      expect(mockOnVersionRestored).toHaveBeenCalled();
    });
  });

  it('compares versions when compare button is clicked', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockResolvedValueOnce(mockTemplate.versions);

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      const compareButtons = screen.getAllByTestId('CompareIcon');
      fireEvent.click(compareButtons[0]);
    });

    expect(screen.getByText('Comparing Versions')).toBeInTheDocument();
    expect(screen.getByText('Current Version vs Version 1')).toBeInTheDocument();
  });

  it('displays error message when fetching versions fails', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch versions')
    );

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch versions')).toBeInTheDocument();
    });
  });

  it('displays error message when restoring version fails', async () => {
    (templateService.getTemplateVersions as jest.Mock).mockResolvedValueOnce(mockTemplate.versions);
    (templateService.restoreTemplateVersion as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to restore version')
    );

    render(
      <TemplateVersionHistory
        template={mockTemplate}
        onVersionRestored={mockOnVersionRestored}
      />
    );

    fireEvent.click(screen.getByTitle('Version History'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Version 1'));
    });

    const restoreReasonInput = screen.getByLabelText('Restore Reason');
    await userEvent.type(restoreReasonInput, 'Restoring to previous version');

    fireEvent.click(screen.getByText('Restore This Version'));

    await waitFor(() => {
      expect(screen.getByText('Failed to restore version')).toBeInTheDocument();
    });
  });
}); 
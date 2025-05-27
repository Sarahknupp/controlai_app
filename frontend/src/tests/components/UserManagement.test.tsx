import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userService } from '../../services/user.service';
import GerenciamentoUsuarios from '../../components/UserManagement';
import '@testing-library/jest-dom';

// Mock userService
jest.mock('../../services/user.service', () => ({
  userService: {
    obterUsuarios: jest.fn(),
    criarUsuario: jest.fn(),
    atualizarUsuario: jest.fn(),
    excluirUsuario: jest.fn(),
    redefinirSenha: jest.fn()
  }
}));

describe('GerenciamentoUsuarios', () => {
  const mockUsers = [
    {
      id: '1',
      email: 'admin@example.com',
      nome: 'Admin User',
      papel: 'ADMIN',
      ativo: true,
      criadoEm: '2024-03-20T10:00:00Z',
      atualizadoEm: '2024-03-20T10:00:00Z',
      ultimoLogin: '2024-03-20T15:00:00Z'
    },
    {
      id: '2',
      email: 'user@example.com',
      nome: 'Regular User',
      papel: 'USUARIO',
      ativo: true,
      criadoEm: '2024-03-20T10:00:00Z',
      atualizadoEm: '2024-03-20T10:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.obterUsuarios as jest.Mock).mockResolvedValue(mockUsers);
  });

  it('renders loading state initially', () => {
    render(<GerenciamentoUsuarios />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders users table after loading', async () => {
    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Regular User')).toBeInTheDocument();
    });

    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('USUARIO')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    const errorMessage = 'Falha ao buscar usuários';
    (userService.obterUsuarios as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('opens create user dialog when clicking Add User', async () => {
    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Adicionar Usuário')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Adicionar Usuário'));

    expect(screen.getByText('Adicionar Novo Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Papel')).toBeInTheDocument();
  });

  it('creates new user successfully', async () => {
    const newUser = {
      email: 'new@example.com',
      senha: 'password123',
      nome: 'New User',
      papel: 'USUARIO' as const
    };

    (userService.criarUsuario as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newUser,
      ativo: true,
      criadoEm: '2024-03-20T16:00:00Z',
      atualizadoEm: '2024-03-20T16:00:00Z'
    });

    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Adicionar Usuário')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Adicionar Usuário'));

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: newUser.nome }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: newUser.email }
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: newUser.senha }
    });
    fireEvent.mouseDown(screen.getByLabelText('Papel'));
    fireEvent.click(screen.getByText('Usuário'));

    fireEvent.click(screen.getByText('Criar Usuário'));

    await waitFor(() => {
      expect(userService.criarUsuario).toHaveBeenCalledWith(newUser);
      expect(userService.obterUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  it('opens edit user dialog when clicking Edit in menu', async () => {
    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Editar'));

    expect(screen.getByText('Editar Usuário')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Admin User');
    expect(screen.getByLabelText('Email')).toHaveValue('admin@example.com');
    expect(screen.getByLabelText('Papel')).toHaveValue('ADMIN');
  });

  it('updates user successfully', async () => {
    const updatedData = {
      nome: 'Updated Admin',
      email: 'admin@example.com',
      papel: 'ADMIN' as const
    };

    (userService.atualizarUsuario as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...updatedData,
      ativo: true,
      criadoEm: '2024-03-20T10:00:00Z',
      atualizadoEm: '2024-03-20T16:00:00Z'
    });

    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Editar'));

    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: updatedData.nome }
    });

    fireEvent.click(screen.getByText('Salvar Alterações'));

    await waitFor(() => {
      expect(userService.atualizarUsuario).toHaveBeenCalledWith('1', updatedData);
      expect(userService.obterUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes user successfully', async () => {
    (userService.excluirUsuario as jest.Mock).mockResolvedValueOnce(undefined);

    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Excluir'));

    await waitFor(() => {
      expect(userService.excluirUsuario).toHaveBeenCalledWith('1');
      expect(userService.obterUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  it('resets user password successfully', async () => {
    (userService.redefinirSenha as jest.Mock).mockResolvedValueOnce(undefined);

    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('MoreVertIcon')[0]);
    fireEvent.click(screen.getByText('Redefinir Senha'));

    await waitFor(() => {
      expect(userService.redefinirSenha).toHaveBeenCalledWith('1');
    });
  });

  it('toggles user active status', async () => {
    (userService.atualizarUsuario as jest.Mock).mockResolvedValueOnce({
      ...mockUsers[0],
      ativo: false
    });

    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    const switchElement = screen.getAllByRole('checkbox')[0];
    fireEvent.click(switchElement);

    await waitFor(() => {
      expect(userService.atualizarUsuario).toHaveBeenCalledWith('1', { ativo: false });
      expect(userService.obterUsuarios).toHaveBeenCalledTimes(2);
    });
  });

  it('refreshes user list', async () => {
    render(<GerenciamentoUsuarios />);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Atualizar'));

    await waitFor(() => {
      expect(userService.obterUsuarios).toHaveBeenCalledTimes(2);
    });
  });
}); 
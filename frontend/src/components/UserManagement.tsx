import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { userService } from '../services/user.service';
import type { DadosAtualizacaoUsuario, DadosCriacaoUsuario, Usuario } from '../types/user.types';

const GerenciamentoUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [ancoraMenu, setAncoraMenu] = useState<null | HTMLElement>(null);
  const [idUsuarioMenu, setIdUsuarioMenu] = useState<string | null>(null);
  const [dadosFormulario, setDadosFormulario] = useState<Partial<DadosCriacaoUsuario>>({
    email: '',
    nome: '',
    papel: 'USUARIO',
    senha: ''
  });

  const buscarUsuarios = async () => {
    try {
      setCarregando(true);
      const dados = await userService.obterUsuarios();
      setUsuarios(dados);
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao buscar usuários');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const handleAbrirDialogo = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioSelecionado(usuario);
      setDadosFormulario({
        email: usuario.email,
        nome: usuario.nome,
        papel: usuario.papel
      });
    } else {
      setUsuarioSelecionado(null);
      setDadosFormulario({
        email: '',
        nome: '',
        papel: 'USUARIO',
        senha: ''
      });
    }
    setDialogoAberto(true);
  };

  const handleFecharDialogo = () => {
    setDialogoAberto(false);
    setUsuarioSelecionado(null);
    setDadosFormulario({
      email: '',
      nome: '',
      papel: 'USUARIO',
      senha: ''
    });
  };

  const handleAbrirMenu = (event: React.MouseEvent<HTMLElement>, idUsuario: string) => {
    setAncoraMenu(event.currentTarget);
    setIdUsuarioMenu(idUsuario);
  };

  const handleFecharMenu = () => {
    setAncoraMenu(null);
    setIdUsuarioMenu(null);
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (usuarioSelecionado) {
        const dadosAtualizacao: DadosAtualizacaoUsuario = {
          email: dadosFormulario.email,
          nome: dadosFormulario.nome,
          papel: dadosFormulario.papel
        };
        await userService.atualizarUsuario(usuarioSelecionado.id, dadosAtualizacao);
      } else {
        const dadosCriacao: DadosCriacaoUsuario = {
          email: dadosFormulario.email || '',
          nome: dadosFormulario.nome || '',
          papel: dadosFormulario.papel || 'USUARIO',
          senha: dadosFormulario.senha || ''
        };
        await userService.criarUsuario(dadosCriacao);
      }
      handleFecharDialogo();
      buscarUsuarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao salvar usuário');
    }
  };

  const handleExcluir = async () => {
    if (!idUsuarioMenu) return;
    try {
      await userService.excluirUsuario(idUsuarioMenu);
      handleFecharMenu();
      buscarUsuarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao excluir usuário');
    }
  };

  const handleRedefinirSenha = async () => {
    if (!idUsuarioMenu) return;
    try {
      await userService.redefinirSenha(idUsuarioMenu);
      handleFecharMenu();
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao redefinir senha');
    }
  };

  const handleAlternarAtivo = async (usuario: Usuario) => {
    try {
      await userService.atualizarUsuario(usuario.id, { ativo: !usuario.ativo });
      buscarUsuarios();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao atualizar status do usuário');
    }
  };

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gerenciamento de Usuários</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={buscarUsuarios}
            sx={{ mr: 2 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAbrirDialogo()}
          >
            Adicionar Usuário
          </Button>
        </Box>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Papel</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Último Login</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.papel}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={usuario.ativo}
                        onChange={() => handleAlternarAtivo(usuario)}
                        color="primary"
                      />
                    }
                    label={usuario.ativo ? 'Ativo' : 'Inativo'}
                  />
                </TableCell>
                <TableCell>
                  {usuario.ultimoLogin
                    ? new Date(usuario.ultimoLogin).toLocaleString()
                    : 'Nunca'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleAbrirMenu(e, usuario.id)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={ancoraMenu}
        open={Boolean(ancoraMenu)}
        onClose={handleFecharMenu}
      >
        <MenuItem onClick={() => {
          handleFecharMenu();
          handleAbrirDialogo(usuarios.find(u => u.id === idUsuarioMenu));
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          handleFecharMenu();
          handleRedefinirSenha();
        }}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Redefinir Senha
        </MenuItem>
        <MenuItem onClick={() => {
          handleFecharMenu();
          handleExcluir();
        }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      <Dialog open={dialogoAberto} onClose={handleFecharDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>
          {usuarioSelecionado ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
        </DialogTitle>
        <form onSubmit={handleEnviar}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nome"
              type="text"
              fullWidth
              value={dadosFormulario.nome}
              onChange={(e) => setDadosFormulario({ ...dadosFormulario, nome: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={dadosFormulario.email}
              onChange={(e) => setDadosFormulario({ ...dadosFormulario, email: e.target.value })}
              required
            />
            {!usuarioSelecionado && (
              <TextField
                margin="dense"
                label="Senha"
                type="password"
                fullWidth
                value={dadosFormulario.senha}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, senha: e.target.value })}
                required
              />
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Papel</InputLabel>
              <Select
                value={dadosFormulario.papel}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, papel: e.target.value as 'USUARIO' | 'ADMIN' })}
                label="Papel"
                required
              >
                <MenuItem value="USUARIO">Usuário</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFecharDialogo}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {usuarioSelecionado ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default GerenciamentoUsuarios; 
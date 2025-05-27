import { Usuario, DadosCriacaoUsuario, DadosAtualizacaoUsuario } from '../tipos/usuario.types';
import api from './api';

class ServicoUsuario {
  async obterUsuarios(): Promise<Usuario[]> {
    const response = await api.get('/usuarios');
    return response.data;
  }

  async obterUsuario(id: string): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  }

  async criarUsuario(dados: DadosCriacaoUsuario): Promise<Usuario> {
    const response = await api.post('/usuarios', dados);
    return response.data;
  }

  async atualizarUsuario(id: string, dados: DadosAtualizacaoUsuario): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  }

  async excluirUsuario(id: string): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }

  async redefinirSenha(id: string): Promise<void> {
    await api.post(`/usuarios/${id}/redefinir-senha`);
  }
}

export default new ServicoUsuario(); 
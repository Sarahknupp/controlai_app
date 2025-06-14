import axios from 'axios';
import { Usuario, DadosCriacaoUsuario, DadosAtualizacaoUsuario } from '../types/user.types';

const API_URL = '/api/usuarios';

export const userService = {
  async obterUsuarios(): Promise<Usuario[]> {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async criarUsuario(dados: DadosCriacaoUsuario): Promise<Usuario> {
    const response = await axios.post(API_URL, dados);
    return response.data;
  },

  async atualizarUsuario(id: string, dados: DadosAtualizacaoUsuario): Promise<Usuario> {
    const response = await axios.put(`${API_URL}/${id}`, dados);
    return response.data;
  },

  async excluirUsuario(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },

  async redefinirSenha(id: string): Promise<void> {
    await axios.post(`${API_URL}/${id}/redefinir-senha`);
  }
}; 
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: 'USUARIO' | 'ADMIN';
  ativo: boolean;
  ultimoLogin?: string;
  password?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DadosCriacaoUsuario {
  nome: string;
  email: string;
  papel: 'USUARIO' | 'ADMIN';
  senha: string;
}

export interface DadosAtualizacaoUsuario {
  nome?: string;
  email?: string;
  papel?: 'USUARIO' | 'ADMIN';
  ativo?: boolean;
} 
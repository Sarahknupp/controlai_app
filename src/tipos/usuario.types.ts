export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: 'USUARIO' | 'ADMIN';
  ativo: boolean;
  ultimoLogin?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DadosCriacaoUsuario {
  nome: string;
  email: string;
  senha: string;
  papel: 'USUARIO' | 'ADMIN';
}

export interface DadosAtualizacaoUsuario {
  nome?: string;
  email?: string;
  papel?: 'USUARIO' | 'ADMIN';
  ativo?: boolean;
} 
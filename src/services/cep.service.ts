import axios from 'axios';

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const cepService = {
  async lookupCep(cep: string): Promise<CepResponse> {
    try {
      const response = await axios.get<CepResponse>(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Erro ao consultar CEP');
      }
      throw error;
    }
  }
}; 
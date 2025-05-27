import axios from 'axios';

export interface TemplateNotificacao {
  id: string;
  versaoAtual: number;
  assunto: string;
  corpo: string;
}

export interface VersaoTemplate {
  id: string;
  versao: number;
  dataCriacao: string;
  motivoAlteracao: string;
  assunto: string;
  corpo: string;
}

export const servicoTemplate = {
  async obterVersoesTemplate(params: { idTemplate: string; ordenarPor: string; ordem: string }) {
    const response = await axios.get(`/api/templates/${params.idTemplate}/versoes`, { params });
    return response.data;
  },

  async restaurarVersaoTemplate(idTemplate: string, versao: number, motivo: string) {
    const response = await axios.post(`/api/templates/${idTemplate}/restaurar`, {
      versao,
      motivo
    });
    return response.data;
  }
}; 
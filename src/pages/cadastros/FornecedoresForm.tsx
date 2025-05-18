import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, MapPin, Phone, Mail, CreditCard, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

export const FornecedoresForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  // Estados para o formulário
  const [formData, setFormData] = useState({
    // Dados gerais
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    site: '',
    categoria: '',
    segmento: '',
    
    // Dados bancários
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: '',
    pix: '',
    
    // Contato
    email: '',
    telefone: '',
    celular: '',
    contato: '',
    cargo: '',
    
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    
    // Comercial
    prazoEntrega: '',
    condicoesPagamento: '',
    valorMinimoCompra: '',
    
    status: 'ativo',
    observacoes: '',
  });
  
  // Mock fornecedor data para edição
  const mockFornecedores = {
    '1': { 
      razaoSocial: 'Distribuidora de Alimentos SA', 
      nomeFantasia: 'SuperFood',
      cnpj: '12.345.678/0001-90', 
      inscricaoEstadual: '123.456.789',
      inscricaoMunicipal: '987.654.321',
      site: 'www.superfood.com.br',
      categoria: 'alimentos',
      segmento: 'Produtos alimentícios',
      
      banco: 'Banco do Brasil',
      agencia: '1234',
      conta: '56789-0',
      tipoConta: 'corrente',
      pix: 'financeiro@superfood.com.br',
      
      email: 'contato@superfood.com', 
      telefone: '(11) 3456-7890',
      celular: '(11) 98765-4321',
      contato: 'José Silva',
      cargo: 'Gerente Comercial',
      
      cep: '01234-567',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Andar 10',
      bairro: 'Bela Vista',
      cidade: 'São Paulo', 
      estado: 'SP',
      
      prazoEntrega: '7 dias',
      condicoesPagamento: '28 dias',
      valorMinimoCompra: '500,00',
      
      status: 'ativo',
      observacoes: 'Fornecedor de produtos alimentícios industrializados e commodities.',
    },
    '2': {
      razaoSocial: 'Equipamentos Industriais Ltda', 
      nomeFantasia: 'EquipMax',
      cnpj: '23.456.789/0001-01', 
      inscricaoEstadual: '234.567.890',
      inscricaoMunicipal: '098.765.432',
      site: 'www.equipmax.com.br',
      categoria: 'equipamentos',
      segmento: 'Equipamentos industriais',
      
      banco: 'Itaú',
      agencia: '5678',
      conta: '12345-6',
      tipoConta: 'corrente',
      pix: '23.456.789/0001-01',
      
      email: 'vendas@equipmax.com', 
      telefone: '(41) 3456-7890',
      celular: '(41) 98765-4321',
      contato: 'Ana Costa',
      cargo: 'Diretora Comercial',
      
      cep: '80000-123',
      logradouro: 'Rua das Indústrias',
      numero: '500',
      complemento: 'Bloco B',
      bairro: 'Cidade Industrial',
      cidade: 'Curitiba', 
      estado: 'PR',
      
      prazoEntrega: '20 dias',
      condicoesPagamento: '30/60/90 dias',
      valorMinimoCompra: '1000,00',
      
      status: 'ativo',
      observacoes: 'Fornecedor de equipamentos industriais para linha de produção.',
    }
  };
  
  // Carregar dados para edição
  useEffect(() => {
    if (isEditing && id && mockFornecedores[id]) {
      const fornecedor = mockFornecedores[id];
      setFormData({
        ...formData,
        ...fornecedor
      });
    }
  }, [id, isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/^(\d{2})(\d)/, '$1.$2') // Coloca ponto após os primeiros 2 dígitos
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Coloca ponto após os segundos 3 dígitos
      .replace(/\.(\d{3})(\d)/, '.$1/$2') // Coloca barra após os terceiros 3 dígitos
      .replace(/(\d{4})(\d)/, '$1-$2') // Coloca hífen após 4 dígitos após a barra
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede mais que os 14 dígitos do CNPJ
  };
  
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = maskCNPJ(value);
    
    setFormData(prevData => ({
      ...prevData,
      cnpj: formattedValue
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.razaoSocial) {
      toast.error('Razão Social é obrigatória');
      return;
    }
    
    if (!formData.nomeFantasia) {
      toast.error('Nome Fantasia é obrigatório');
      return;
    }
    
    if (!formData.cnpj) {
      toast.error('CNPJ é obrigatório');
      return;
    }
    
    // Validação simples de CNPJ
    if (!formData.cnpj.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)) {
      toast.error('CNPJ inválido, utilize o formato: 12.345.678/0001-90');
      return;
    }
    
    if (!formData.email) {
      toast.error('Email é obrigatório');
      return;
    }
    
    if (!formData.telefone && !formData.celular) {
      toast.error('Pelo menos um telefone para contato é obrigatório');
      return;
    }
    
    // Em um sistema real, você enviaria os dados para o backend aqui
    console.log('Dados do formulário:', formData);
    
    // Feedback visual e redirecionamento
    toast.success(isEditing ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!');
    navigate('/cadastros/fornecedores');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/cadastros/fornecedores')}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Cabeçalho do formulário */}
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Dados do Fornecedor</h2>
            </div>
            
            <div>
              <Button variant="outline" onClick={() => navigate('/cadastros/fornecedores')} className="mr-2">
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
          
          {/* Dados gerais */}
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="col-span-3">
                <h3 className="text-md font-medium text-gray-900 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  Dados da Empresa
                </h3>
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="cnpj">CNPJ*</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  placeholder="12.345.678/0001-90"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                <Input
                  id="inscricaoEstadual"
                  name="inscricaoEstadual"
                  value={formData.inscricaoEstadual}
                  onChange={handleInputChange}
                  placeholder="Inscrição Estadual"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                <Input
                  id="inscricaoMunicipal"
                  name="inscricaoMunicipal"
                  value={formData.inscricaoMunicipal}
                  onChange={handleInputChange}
                  placeholder="Inscrição Municipal"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-3 md:col-span-2">
                <Label htmlFor="razaoSocial">Razão Social*</Label>
                <Input
                  id="razaoSocial"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleInputChange}
                  placeholder="Razão Social da empresa"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="nomeFantasia">Nome Fantasia*</Label>
                <Input
                  id="nomeFantasia"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleInputChange}
                  placeholder="Nome Fantasia"
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="site">Website</Label>
                <Input
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  placeholder="www.exemplo.com.br"
                  className="mt-1"
                />
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="categoria">Categoria*</Label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="equipamentos">Equipamentos</option>
                  <option value="embalagens">Embalagens</option>
                  <option value="servicos">Serviços</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <Label htmlFor="segmento">Segmento</Label>
                <Input
                  id="segmento"
                  name="segmento"
                  value={formData.segmento}
                  onChange={handleInputChange}
                  placeholder="Segmento de atuação"
                  className="mt-1"
                />
              </div>
            </div>
            
            {/* Informações de contato */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h3 className="text-md font-medium text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    Informações de Contato
                  </h3>
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="email">E-mail*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemplo.com"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="telefone">Telefone*</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 0000-0000"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="contato">Nome do Contato*</Label>
                  <Input
                    id="contato"
                    name="contato"
                    value={formData.contato}
                    onChange={handleInputChange}
                    placeholder="Nome da pessoa de contato"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    placeholder="Cargo do contato"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Dados bancários */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h3 className="text-md font-medium text-gray-900 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                    Dados Bancários
                  </h3>
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    name="banco"
                    value={formData.banco}
                    onChange={handleInputChange}
                    placeholder="Nome do Banco"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    name="agencia"
                    value={formData.agencia}
                    onChange={handleInputChange}
                    placeholder="0000"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    name="conta"
                    value={formData.conta}
                    onChange={handleInputChange}
                    placeholder="00000-0"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="tipoConta">Tipo de Conta</Label>
                  <select
                    id="tipoConta"
                    name="tipoConta"
                    value={formData.tipoConta}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="corrente">Conta Corrente</option>
                    <option value="poupanca">Conta Poupança</option>
                  </select>
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <Label htmlFor="pix">Chave PIX</Label>
                  <Input
                    id="pix"
                    name="pix"
                    value={formData.pix}
                    onChange={handleInputChange}
                    placeholder="CPF, CNPJ, Email, Telefone ou Chave Aleatória"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Endereço */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h3 className="text-md font-medium text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Endereço
                  </h3>
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="cep">CEP*</Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="logradouro">Logradouro*</Label>
                  <Input
                    id="logradouro"
                    name="logradouro"
                    value={formData.logradouro}
                    onChange={handleInputChange}
                    placeholder="Rua, Avenida, etc."
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="numero">Número*</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleInputChange}
                    placeholder="Sala, Andar, etc."
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="bairro">Bairro*</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    placeholder="Bairro"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="cidade">Cidade*</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="estado">Estado*</Label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Informações comerciais */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h3 className="text-md font-medium text-gray-900">Informações Comerciais</h3>
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="prazoEntrega">Prazo de Entrega</Label>
                  <Input
                    id="prazoEntrega"
                    name="prazoEntrega"
                    value={formData.prazoEntrega}
                    onChange={handleInputChange}
                    placeholder="Ex: 7 dias"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="condicoesPagamento">Condições de Pagamento</Label>
                  <Input
                    id="condicoesPagamento"
                    name="condicoesPagamento"
                    value={formData.condicoesPagamento}
                    onChange={handleInputChange}
                    placeholder="Ex: 30/60/90 dias"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-1">
                  <Label htmlFor="valorMinimoCompra">Valor Mínimo de Compra</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <Input
                      id="valorMinimoCompra"
                      name="valorMinimoCompra"
                      value={formData.valorMinimoCompra}
                      onChange={handleInputChange}
                      className="pl-8"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status e Observações */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    rows={3}
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Observações adicionais sobre este fornecedor..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
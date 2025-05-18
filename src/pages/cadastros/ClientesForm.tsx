import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Building2, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import toast from 'react-hot-toast';

export const ClientesForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  // Estados para o formulário
  const [clienteType, setClienteType] = useState<'fisica' | 'juridica'>('fisica');
  const [formData, setFormData] = useState({
    // Dados gerais
    nome: '',
    email: '',
    telefone: '',
    celular: '',
    status: 'ativo',
    observacoes: '',
    
    // Pessoa Física
    cpf: '',
    rg: '',
    dataNascimento: '',
    
    // Pessoa Jurídica
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  
  // Mock cliente data para edição
  const mockClientes = {
    '1': { 
      tipo: 'fisica', 
      nome: 'Maria da Silva', 
      email: 'maria@email.com',
      telefone: '1134567890',
      celular: '11987654321',
      status: 'ativo',
      observacoes: 'Cliente preferencial',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      dataNascimento: '1980-05-15',
      cep: '01234-567',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    '2': { 
      tipo: 'juridica', 
      nome: 'João Comércio Ltda', 
      email: 'contato@joaocomercio.com',
      telefone: '2134567890',
      celular: '21987654321',
      status: 'ativo',
      observacoes: 'Parceiro comercial',
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'João Comércio e Distribuição Ltda',
      nomeFantasia: 'João Comércio',
      inscricaoEstadual: '123456789',
      inscricaoMunicipal: '987654321',
      cep: '20000-123',
      logradouro: 'Avenida Comercial',
      numero: '1500',
      complemento: 'Sala 22',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
    }
  };
  
  // Carregar dados para edição
  useEffect(() => {
    if (isEditing && id && mockClientes[id]) {
      const cliente = mockClientes[id];
      setClienteType(cliente.tipo);
      setFormData({
        ...formData,
        ...cliente
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (clienteType === 'fisica') {
      if (!formData.cpf) {
        toast.error('CPF é obrigatório');
        return;
      }
      
      // Validação simples de CPF (em um sistema real, seria mais robusta)
      if (!formData.cpf.match(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)) {
        toast.error('CPF inválido, utilize o formato: 123.456.789-00');
        return;
      }
    } else {
      if (!formData.cnpj) {
        toast.error('CNPJ é obrigatório');
        return;
      }
      
      // Validação simples de CNPJ
      if (!formData.cnpj.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)) {
        toast.error('CNPJ inválido, utilize o formato: 12.345.678/0001-90');
        return;
      }
    }
    
    if (!formData.nome) {
      toast.error('Nome é obrigatório');
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
    console.log('Dados do formulário:', { tipo: clienteType, ...formData });
    
    // Feedback visual e redirecionamento
    toast.success(isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
    navigate('/cadastros/clientes');
  };
  
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os primeiros 3 dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os segundos 3 dígitos
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen após os terceiros 3 dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede que se digite mais que 11 caracteres
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
  
  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cpf') {
      formattedValue = maskCPF(value);
    } else if (name === 'cnpj') {
      formattedValue = maskCNPJ(value);
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: formattedValue
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/cadastros/clientes')}
            className="mr-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Tabs defaultValue={clienteType} onValueChange={(value) => setClienteType(value as 'fisica' | 'juridica')}>
          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="fisica" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Pessoa Física
                </TabsTrigger>
                <TabsTrigger value="juridica" className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Pessoa Jurídica
                </TabsTrigger>
              </TabsList>
              
              <div>
                <Button variant="outline" onClick={() => navigate('/cadastros/clientes')} className="mr-2">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
          
          <form className="px-4 py-5 sm:p-6">
            <TabsContent value="fisica" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h2 className="text-lg font-medium text-gray-900">Dados Pessoais</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Informações de identificação da pessoa física.
                  </p>
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="cpf">CPF*</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleDocumentoChange}
                    placeholder="123.456.789-00"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    placeholder="12.345.678-9"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor="nome">Nome Completo*</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome completo do cliente"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="juridica" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h2 className="text-lg font-medium text-gray-900">Dados da Empresa</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Informações de identificação da pessoa jurídica.
                  </p>
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="cnpj">CNPJ*</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleDocumentoChange}
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
              </div>
            </TabsContent>
            
            {/* Contato - Comum para ambos os tipos */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-gray-500" />
                    Informações de Contato
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Dados para comunicação com o cliente.
                  </p>
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
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 0000-0000"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="celular">Celular*</Label>
                  <Input
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Endereço - Comum para ambos os tipos */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    Endereço
                  </h2>
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
                    placeholder="Apto, Sala, etc."
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
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            
            {/* Informações adicionais */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="col-span-3">
                  <h2 className="text-lg font-medium text-gray-900">Informações Adicionais</h2>
                </div>
                
                <div className="col-span-3 md:col-span-1">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Observações adicionais sobre este cliente..."
                  />
                </div>
              </div>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { FileBarChart, Download, Calendar, ChevronDown, ArrowUpDown, CheckCircle, AlertTriangle, XCircle, ArrowRight, Loader, Settings, FileUp } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatDate, formatFileSize } from '../../utils/format';
import { Card } from '../../components/ui/card';
import { Alert } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'react-hot-toast';
import type { SpedFile, SpedFileType, SpedFileStatus, SpedValidationMessage } from '../../types/accounting';

interface SpedGenerationParams {
  companyId: string;
  type: SpedFileType;
  reference: string;
}

const SpedGeneration: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SpedFileType | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('202310');
  const [sortField, setSortField] = useState<keyof SpedFile>('reference');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SpedFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Fetch SPED files
  const { data: spedFiles, isLoading: isLoadingFiles } = useQuery<SpedFile[]>(
    ['spedFiles'],
    async () => {
      const response = await api.get('/accounting/sped/files');
      return response.data;
    }
  );

  // Generate SPED file mutation
  const generateMutation = useMutation<SpedFile, Error, SpedGenerationParams>(
    async (params) => {
      const response = await api.post('/accounting/sped/generate', params);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Arquivo SPED gerado com sucesso!');
        setIsGenerating(false);
      },
      onError: (error) => {
        toast.error(`Erro ao gerar arquivo: ${error.message}`);
        setIsGenerating(false);
      }
    }
  );

  // Filter SPED files
  const filteredFiles = spedFiles?.filter(file => {
    const matchesSearch = searchTerm === '' || 
                        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        file.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    
    return matchesSearch && matchesType;
  }) || [];
  
  // Sort SPED files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortField === 'reference') {
      return sortDirection === 'asc'
        ? a.reference.localeCompare(b.reference)
        : b.reference.localeCompare(a.reference);
    } else if (sortField === 'type') {
      return sortDirection === 'asc'
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    } else if (sortField === 'generationDate') {
      return sortDirection === 'asc'
        ? a.generationDate.getTime() - b.generationDate.getTime()
        : b.generationDate.getTime() - a.generationDate.getTime();
    } else if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  });
  
  const handleSort = (field: keyof SpedFile) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleViewValidation = (file: SpedFile) => {
    setSelectedFile(file);
    setShowValidationModal(true);
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      await generateMutation.mutateAsync({
        companyId: '1', // TODO: Get from context
        type: 'fiscal',
        reference: selectedMonth
      });
    } catch (error) {
      // Error is handled by mutation
    }
  };
  
  // Get status badge style
  const getStatusBadge = (status: SpedFileStatus) => {
    switch (status) {
      case 'transmitted':
        return 'bg-green-100 text-green-800';
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'validated':
        return 'bg-indigo-100 text-indigo-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingFiles) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FileBarChart className="h-6 w-6 mr-2 text-gray-700" />
          Geração SPED
        </h1>
        
        <div className="flex space-x-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="202310">Outubro/2023</option>
              <option value="202309">Setembro/2023</option>
              <option value="202308">Agosto/2023</option>
              <option value="202307">Julho/2023</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <Button
            variant="default"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <FileBarChart className="h-4 w-4 mr-1" />
            )}
            Gerar Arquivos SPED
          </Button>
        </div>
      </div>
      
      {isGenerating && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Loader className="h-5 w-5 text-indigo-600 animate-spin mr-2" />
              <span className="text-sm font-medium text-gray-900">
                Gerando arquivos SPED para {selectedMonth.slice(0, 4)}/{selectedMonth.slice(4, 6)}
              </span>
            </div>
            <span className="text-sm text-gray-500">{generationProgress}% concluído</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }}></div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div className={`px-3 py-2 rounded ${generationProgress >= 40 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
              <div className="flex items-center">
                {generationProgress >= 40 ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Loader className={`h-4 w-4 mr-1 ${generationProgress > 0 ? 'animate-spin text-indigo-500' : ''}`} />
                )}
                <span>SPED Fiscal</span>
              </div>
            </div>
            <div className={`px-3 py-2 rounded ${generationProgress >= 80 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
              <div className="flex items-center">
                {generationProgress >= 80 ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Loader className={`h-4 w-4 mr-1 ${generationProgress >= 40 ? 'animate-spin text-indigo-500' : ''}`} />
                )}
                <span>SPED Contribuições</span>
              </div>
            </div>
            <div className={`px-3 py-2 rounded ${generationProgress >= 100 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
              <div className="flex items-center">
                {generationProgress >= 100 ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Loader className={`h-4 w-4 mr-1 ${generationProgress >= 80 ? 'animate-spin text-indigo-500' : ''}`} />
                )}
                <span>ECD Contábil</span>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* SPED Files Table */}
      <Card>
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Arquivos SPED
            </h3>
            
            <div className="mt-3 sm:mt-0 flex flex-wrap space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <input
                  type="text"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Pesquisar arquivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as SpedFileType | 'all')}
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="fiscal">SPED Fiscal</option>
                  <option value="contributions">SPED Contribuições</option>
                  <option value="accounting">ECD Contábil</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('reference')}>
                  <div className="flex items-center">
                    Referência
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('type')}>
                  <div className="flex items-center">
                    Tipo
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('generationDate')}>
                  <div className="flex items-center">
                    Data de Geração
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanho
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedFiles.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {file.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.type === 'fiscal' && 'SPED Fiscal'}
                    {file.type === 'contributions' && 'SPED Contribuições'}
                    {file.type === 'accounting' && 'ECD Contábil'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.generationDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(file.status)}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(file.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewValidation(file)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Validar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.fileName)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Validation Modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validação do Arquivo</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Arquivo:</span>
                  <span className="font-medium">{selectedFile.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Referência:</span>
                  <span className="font-medium">{selectedFile.reference}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedFile.status)}`}>
                    {selectedFile.status}
                  </span>
                </div>
                
                {selectedFile.validationMessages && selectedFile.validationMessages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Mensagens de Validação</h4>
                    <div className="space-y-2">
                      {selectedFile.validationMessages.map((message, index) => (
                        <Alert
                          key={index}
                          variant={message.type === 'error' ? 'destructive' : message.type === 'warning' ? 'warning' : 'default'}
                        >
                          <div className="flex items-start">
                            {message.type === 'error' && <XCircle className="h-4 w-4 mr-2" />}
                            {message.type === 'warning' && <AlertTriangle className="h-4 w-4 mr-2" />}
                            {message.type === 'info' && <CheckCircle className="h-4 w-4 mr-2" />}
                            <div>
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Bloco: {message.block} | Registro: {message.record} | Campo: {message.field}
                              </p>
                            </div>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidationModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpedGeneration;

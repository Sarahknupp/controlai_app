import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, FileText, Database, FileBarChart, FileDigit, Building2, Users, Clock, ChevronRight, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { Card } from '../../components/ui/card';
import { Alert } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import type { CertificateStatus, TaxObligationSummary, DocumentSummary } from '../../types/accounting';

const AccountingModule: React.FC = () => {
  const navigate = useNavigate();
  const companyId = '1'; // Default company for demo
  
  // Fetch certificate status
  const { data: certificateStatus, isLoading: isLoadingCertificates } = useQuery<CertificateStatus>(
    ['certificateStatus', companyId],
    async () => {
      const response = await api.get(`/accounting/certificates/status/${companyId}`);
      return response.data;
    }
  );
  
  // Fetch tax obligations
  const { data: taxObligationSummary, isLoading: isLoadingObligations } = useQuery<TaxObligationSummary>(
    ['taxObligations', companyId],
    async () => {
      const response = await api.get(`/accounting/obligations/summary/${companyId}`);
      return response.data;
    }
  );
  
  // Fetch document summary
  const { data: documentSummary, isLoading: isLoadingDocuments } = useQuery<DocumentSummary>(
    ['documentSummary', companyId],
    async () => {
      const response = await api.get(`/accounting/documents/summary/${companyId}`);
      return response.data;
    }
  );

  const isLoading = isLoadingCertificates || isLoadingObligations || isLoadingDocuments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!certificateStatus || !taxObligationSummary || !documentSummary) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro ao carregar dados do módulo contábil</span>
        </Alert>
      </div>
    );
  }
  
  const modules = [
    {
      name: 'Painel do Contador',
      description: 'Dashboard completo com relatórios e demonstrativos contábeis',
      icon: FileText,
      path: '/accounting/dashboard',
      color: 'bg-blue-600',
    },
    {
      name: 'Integração Fiscal',
      description: 'Importação e validação de documentos fiscais',
      icon: Database,
      path: '/accounting/fiscal',
      color: 'bg-green-600',
    },
    {
      name: 'Geração SPED',
      description: 'Geração de arquivos SPED Fiscal, Contribuições e Contábil',
      icon: FileBarChart,
      path: '/accounting/sped',
      color: 'bg-purple-600',
    },
    {
      name: 'Emissão NFe',
      description: 'Emissão e gerenciamento de documentos fiscais eletrônicos',
      icon: FileDigit,
      path: '/accounting/nfe',
      color: 'bg-amber-600',
    },
    {
      name: 'Cadastro Empresarial',
      description: 'Configurações fiscais e tributárias da empresa',
      icon: Building2,
      path: '/accounting/companies',
      color: 'bg-indigo-600',
    },
    {
      name: 'Módulo de Cadastros',
      description: 'Gerenciamento de clientes, fornecedores e usuários',
      icon: Users,
      path: '/accounting/entities',
      color: 'bg-red-600',
    },
  ] as const;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Calculator className="h-6 w-6 mr-2 text-gray-700" />
          Módulo Contábil-Fiscal
        </h1>
      </div>
      
      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Certificate Alerts */}
        <Card>
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-blue-800">Certificados Digitais</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {certificateStatus.validCertificates} válidos
              </span>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Certificados ativos:</span>
              <span className="font-medium text-green-600">{certificateStatus.validCertificates}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Certificados expirando:</span>
              <span className="font-medium text-amber-600">{certificateStatus.expiringCertificates}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Certificados expirados:</span>
              <span className="font-medium text-red-600">{certificateStatus.expiredCertificates}</span>
            </div>
            
            {certificateStatus.expiringCertificates > 0 && (
              <Alert variant="warning" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <span>Certificados próximos do vencimento. Realize a renovação para evitar interrupções.</span>
              </Alert>
            )}
          </div>
        </Card>
        
        {/* Tax Obligations */}
        <Card>
          <div className="bg-red-50 border-b border-red-100 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-red-800">Obrigações Fiscais</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {taxObligationSummary.pendingObligations} pendentes
              </span>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Obrigações pendentes:</span>
              <span className="font-medium text-amber-600">{taxObligationSummary.pendingObligations}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Obrigações atrasadas:</span>
              <span className="font-medium text-red-600">{taxObligationSummary.lateObligations}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Total a pagar:</span>
              <span className="font-medium text-gray-900">{formatCurrency(taxObligationSummary.totalDue)}</span>
            </div>
            
            {taxObligationSummary.nextDueDates.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                <div className="text-xs font-medium text-blue-800 mb-1">Próximos vencimentos:</div>
                {taxObligationSummary.nextDueDates.map((obligation, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span>{obligation.name}</span>
                    <div className="flex items-center">
                      <span className="mr-1">{formatCurrency(obligation.amount)}</span>
                      <span className="text-gray-500">{formatDate(obligation.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        
        {/* Document Status */}
        <Card>
          <div className="bg-green-50 border-b border-green-100 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-green-800">Documentos Fiscais</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {documentSummary.issuedDocuments} emitidos
              </span>
            </div>
          </div>
          <div className="px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Documentos emitidos:</span>
              <span className="font-medium text-green-600">{documentSummary.issuedDocuments}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Documentos pendentes:</span>
              <span className="font-medium text-amber-600">{documentSummary.pendingDocuments}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Documentos cancelados:</span>
              <span className="font-medium text-red-600">{documentSummary.cancelledDocuments}</span>
            </div>
            
            {documentSummary.lastDocuments.length > 0 && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md border border-gray-100">
                <div className="text-xs font-medium text-gray-700 mb-1">Últimos documentos:</div>
                <div className="max-h-20 overflow-y-auto">
                  {documentSummary.lastDocuments.map((doc, index) => (
                    <div key={index} className="flex justify-between items-center text-xs py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-800">{doc.type} {doc.number}</span>
                      <span className="text-gray-500">{formatDate(doc.issueDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Calendar & Upcoming Activities */}
      <Card>
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-700" />
            Calendário Fiscal e Próximas Atividades
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Upcoming Tax Obligations */}
            <div className="col-span-1 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Próximas Obrigações</h4>
              <div className="space-y-3">
                {taxObligationSummary.nextDueDates.map((obligation, index) => (
                  <div key={index} className="flex items-start p-2 bg-white rounded-md shadow-sm">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600">
                        <Clock className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{obligation.name}</div>
                      <div className="text-xs text-gray-500 flex justify-between mt-1">
                        <span>Vencimento: {formatDate(obligation.dueDate)}</span>
                        <span className="font-medium text-gray-700">{formatCurrency(obligation.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {taxObligationSummary.nextDueDates.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Nenhuma obrigação pendente para os próximos dias.
                  </div>
                )}
                
                <button
                  type="button"
                  className="mt-2 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => navigate('/accounting/fiscal')}
                >
                  Ver todas obrigações
                </button>
              </div>
            </div>
            
            {/* Calendar for the month */}
            <div className="col-span-2 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Calendário de Obrigações</h4>
              <div className="grid grid-cols-7 gap-1">
                {/* Calendar implementation */}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(module.path)}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`${module.color} rounded-lg p-3`}>
                  <module.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountingModule;

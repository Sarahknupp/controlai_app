import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, ChevronDown, ChevronRight, FileText, Settings, Upload, Shield, Save, Image, AlertTriangle, MapPin, Phone, Briefcase, CheckCircle, XCircle, Package } from 'lucide-react';
import { mockCompanies } from '../../data/mockAccountingData';
import type { Company, TaxParameters } from '../../types/accounting';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import toast from 'react-hot-toast';
import { format, parseISO, isValid, isFuture, formatISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { delay, withTimeout } from '../../utils/promises';
import { validateImage, validateImageDimensions, validateImageWithTimeout, ImageDimensions, ImageValidationOptions, DEFAULT_VALIDATION_OPTIONS } from '../../utils/imageValidation';

// Interfaces
/**
 * Estado do formulário de empresa
 * @interface CompanyFormState
 */
interface CompanyFormState {
  companyName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  address: {
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  taxRegime: 'simples' | 'presumido' | 'real';
  economicActivity: string;
  cnae: string;
  openingDate: string;
  accountingResponsible: string;
  status: 'active' | 'inactive' | 'suspended';
  logo: string | null;
}

/**
 * Erros do formulário
 * @interface FormErrors
 */
interface FormErrors {
  [key: string]: string;
}

/**
 * Estados dos modais
 * @interface ModalStates
 */
interface ModalStates {
  addCompany: boolean;
  settings: boolean;
  logo: boolean;
  confirm: boolean;
}

/**
 * Informações do certificado digital
 * @interface CertificateInfo
 */
interface CertificateInfo {
  fileName: string;
  expirationDate: string;
  type: 'A1' | 'A3';
  status: 'valid' | 'expired' | 'revoked';
}

/**
 * Parâmetros fiscais
 * @interface TaxParameter
 */
interface TaxParameter {
  id: string;
  companyId?: string;
  name: string;
  value: number;
  description: string;
  lastUpdated: string;
  updatedBy: string;
}

/**
 * Resultado da validação do certificado
 * @interface CertificateValidationResult
 */
interface CertificateValidationResult {
  isValid: boolean;
  expirationDate: string;
  type: 'a1' | 'a3';
  error?: string;
}

/**
 * Certificado digital
 * @interface DigitalCertificate
 */
interface DigitalCertificate {
  id: string;
  companyId: string;
  serialNumber: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  filename: string;
  password: string;
  status: 'valid' | 'expired' | 'revoked';
  type: 'a1' | 'a3';
  usedFor: string[];
}

/**
 * Regra de validação de campo
 * @interface ValidationRule
 */
interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

/**
 * Validação de campo do formulário
 * @interface FieldValidation
 */
interface FieldValidation {
  field: string;
  label: string;
  rules?: ValidationRule[];
  optional?: boolean;
  placeholder?: string;
}

/**
 * Status do certificado
 * @interface CertificateStatus
 */
interface CertificateStatus {
  color: string;
  text: string;
  icon: React.ReactNode;
}

/**
 * Erro de parâmetro fiscal
 * @interface TaxParameterError
 */
interface TaxParameterError {
  id: string;
  message: string;
}

/**
 * Seção do formulário
 * @interface FormSection
 */
interface FormSection {
  title: string;
  icon: React.ReactNode;
  fields: FieldValidation[];
}

// Add mock tax parameters data
const mockTaxParameters: TaxParameter[] = [
  {
    id: '1',
    name: 'ICMS',
    value: 18,
    description: 'Imposto sobre Circulação de Mercadorias e Serviços',
    lastUpdated: formatISO(new Date()),
    updatedBy: 'Admin'
  },
  {
    id: '2',
    name: 'PIS',
    value: 0.65,
    description: 'Programa de Integração Social',
    lastUpdated: formatISO(new Date()),
    updatedBy: 'Admin'
  },
  {
    id: '3',
    name: 'COFINS',
    value: 3,
    description: 'Contribuição para o Financiamento da Seguridade Social',
    lastUpdated: formatISO(new Date()),
    updatedBy: 'Admin'
  },
  {
    id: '4',
    name: 'ISS',
    value: 5,
    description: 'Imposto Sobre Serviços',
    lastUpdated: formatISO(new Date()),
    updatedBy: 'Admin'
  }
];

/**
 * Regras de validação para os campos do formulário
 */
const validationRules = {
  cnpj: [
    {
      test: (value: string) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(value),
      message: 'CNPJ inválido. Formato: 99.999.999/9999-99'
    }
  ],
  email: [
    {
      test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'E-mail inválido'
    }
  ],
  phone: [
    {
      test: (value: string) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value),
      message: 'Telefone inválido. Formato: (99) 99999-9999'
    }
  ],
  'address.zipCode': [
    {
      test: (value: string) => /^\d{5}-\d{3}$/.test(value),
      message: 'CEP inválido. Formato: 99999-999'
    }
  ],
  cnae: [
    {
      test: (value: string) => /^\d{4}-\d{1}$/.test(value),
      message: 'CNAE inválido. Formato: 9999-9'
    }
  ],
  openingDate: [
    {
      test: (value: string) => {
        const date = parseISO(value);
        return isValid(date) && !isFuture(date);
      },
      message: 'Data inválida. Não pode ser futura'
    }
  ]
};

/**
 * Seções do formulário de cadastro de empresa
 */
const formSections: FormSection[] = [
  {
    title: 'Informações Básicas',
    icon: <Building2 className="h-5 w-5" />,
    fields: [
      { field: 'companyName', label: 'Razão Social' },
      { field: 'tradeName', label: 'Nome Fantasia' },
      { field: 'cnpj', label: 'CNPJ', rules: validationRules.cnpj },
      { field: 'stateRegistration', label: 'Inscrição Estadual' },
      { field: 'municipalRegistration', label: 'Inscrição Municipal', optional: true }
    ]
  },
  {
    title: 'Endereço',
    icon: <MapPin className="h-5 w-5" />,
    fields: [
      { field: 'address.street', label: 'Logradouro' },
      { field: 'address.number', label: 'Número' },
      { field: 'address.complement', label: 'Complemento', optional: true },
      { field: 'address.district', label: 'Bairro' },
      { field: 'address.city', label: 'Cidade' },
      { field: 'address.state', label: 'Estado' },
      { field: 'address.zipCode', label: 'CEP', rules: validationRules['address.zipCode'] }
    ]
  },
  {
    title: 'Contato',
    icon: <Phone className="h-5 w-5" />,
    fields: [
      { field: 'phone', label: 'Telefone', rules: validationRules.phone },
      { field: 'email', label: 'E-mail', rules: validationRules.email }
    ]
  },
  {
    title: 'Atividade',
    icon: <Briefcase className="h-5 w-5" />,
    fields: [
      { field: 'economicActivity', label: 'Atividade Econômica' },
      { field: 'cnae', label: 'CNAE', rules: validationRules.cnae },
      { field: 'taxRegime', label: 'Regime Tributário' },
      { field: 'openingDate', label: 'Data de Abertura', rules: validationRules.openingDate },
      { field: 'accountingResponsible', label: 'Responsável Contábil' }
    ]
  }
];

/**
 * Dados mockados de certificados digitais
 */
const mockCertificates: DigitalCertificate[] = [
  {
    id: '1',
    companyId: '1',
    serialNumber: '123456789',
    issuer: 'AC Certisign RFB G5',
    validFrom: parseISO('2023-01-01'),
    validTo: parseISO('2024-12-31'),
    filename: 'cert_a1_prod.pfx',
    password: '********',
    status: 'valid',
    type: 'a1',
    usedFor: ['nfe', 'nfce']
  },
  {
    id: '2',
    companyId: '1',
    serialNumber: '987654321',
    issuer: 'AC Certisign RFB G5',
    validFrom: parseISO('2023-01-01'),
    validTo: parseISO('2023-12-31'),
    filename: 'cert_a3_homolog.pfx',
    password: '********',
    status: 'expired',
    type: 'a3',
    usedFor: ['nfe', 'nfce', 'cte']
  }
];

// Logo validation options
const LOGO_VALIDATION_OPTIONS: ImageValidationOptions = {
  maxWidth: 800,
  maxHeight: 600,
  maxSizeInBytes: 2 * 1024 * 1024, // 2MB
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg']
};

// Helper function to cleanup file input
const cleanupFileInput = (input: HTMLInputElement | null) => {
  if (input) {
    input.value = '';
  }
};

// Internationalization constants
const TRANSLATIONS = {
  titles: {
    main: 'Cadastro Empresarial',
    companies: 'Empresas',
    certificates: 'Certificados Digitais',
    parameters: 'Parâmetros Fiscais'
  },
  buttons: {
    newCompany: 'Nova Empresa',
    settings: 'Configurações',
    delete: 'Excluir',
    test: 'Testar',
    revoke: 'Revogar',
    import: 'Importar',
    export: 'Exportar',
    save: 'Salvar'
  },
  status: {
    active: 'Ativo',
    inactive: 'Inativo',
    suspended: 'Suspenso',
    valid: 'Válido',
    expired: 'Expirado',
    revoked: 'Revogado'
  },
  labels: {
    cnpj: 'CNPJ',
    validUntil: 'Válido até',
    lastUpdate: 'Última atualização'
  },
  sections: {
    certificateStatus: 'Status dos Certificados',
    taxParameters: 'Parâmetros Fiscais'
  },
  metrics: {
    valid: 'Válidos',
    expiring: 'Expirando',
    expiredRevoked: 'Expirados/Revogados',
    total: 'Total',
    withErrors: 'Com Erros'
  },
  warnings: {
    noCertificate: 'Esta empresa não possui certificado digital válido',
    parametersWithErrors: 'Existem parâmetros com erros que precisam ser corrigidos',
    certificateExpiring: 'Existem certificados próximos da data de expiração',
    noCertificateValid: 'A empresa não possui certificado digital válido'
  },
  ariaLabels: {
    companyExpand: 'Expandir detalhes da empresa',
    certificateType: 'Tipo de certificado',
    parameterValue: 'Valor do parâmetro',
    deleteCompany: 'Excluir empresa',
    configureCompany: 'Configurar empresa',
    testCertificate: 'Testar certificado',
    revokeCertificate: 'Revogar certificado',
    importParameters: 'Importar parâmetros',
    exportParameters: 'Exportar parâmetros',
    saveParameters: 'Salvar parâmetros'
  }
};

// Accessibility helper components
interface AccessibleIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
  icon,
  label,
  onClick,
  className,
  disabled
}) => (
  <Button
    type="button"
    onClick={onClick}
    className={className}
    disabled={disabled}
    aria-label={label}
  >
    {icon}
    <span className="sr-only">{label}</span>
  </Button>
);

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended' | 'valid' | 'expired' | 'revoked';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
      case 'expired':
      case 'revoked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()} ${className}`}
      role="status"
    >
      {TRANSLATIONS.status[status]}
    </span>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  type: 'success' | 'warning' | 'error' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, type }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 text-green-600';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 text-yellow-600';
      case 'error':
        return 'bg-red-50 text-red-800 text-red-600';
      case 'info':
        return 'bg-blue-50 text-blue-800 text-blue-600';
      default:
        return 'bg-gray-50 text-gray-800 text-gray-600';
    }
  };

  return (
    <div className={`p-3 rounded-lg ${getTypeStyles()}`}>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

interface WarningAlertProps {
  type: 'warning' | 'error';
  message: string;
  icon?: React.ReactNode;
}

const WarningAlert: React.FC<WarningAlertProps> = ({ type, message, icon }) => (
  <div className={`bg-${type === 'warning' ? 'yellow' : 'red'}-50 border-l-4 border-${type === 'warning' ? 'yellow' : 'red'}-400 p-4`}>
    <div className="flex">
      {icon || <AlertTriangle className={`h-5 w-5 text-${type === 'warning' ? 'yellow' : 'red'}-400`} aria-hidden="true" />}
      <div className="ml-3">
        <p className={`text-sm text-${type === 'warning' ? 'yellow' : 'red'}-700`}>
          {message}
        </p>
      </div>
    </div>
  </div>
);

// Componente principal
const CompanyManagement: React.FC = () => {
  // Error handling and user feedback
  const showError = useCallback((message: string, field?: string) => {
    toast.error(message);
    if (field) {
      setFormErrors(prev => ({ ...prev, [field]: message }));
    }
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showLoading = useCallback((message: string) => {
    return toast.loading(message);
  }, []);

  const handleAsyncOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string
  ): Promise<T | null> => {
    const loadingToast = showLoading(loadingMessage);
    try {
      const result = await operation();
      toast.dismiss(loadingToast);
      showSuccess(successMessage);
      return result;
    } catch (error) {
      toast.dismiss(loadingToast);
      showError(error instanceof Error ? error.message : errorMessage);
      return null;
    }
  }, [showLoading, showSuccess, showError]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'companies' | 'certificates' | 'parameters'>('companies');
  
  // Company list states
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // Form states
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [newCompanyForm, setNewCompanyForm] = useState<CompanyFormState>({
    companyName: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    address: {
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
    },
    phone: '',
    email: '',
    taxRegime: 'simples',
    economicActivity: '',
    cnae: '',
    openingDate: new Date().toISOString().split('T')[0],
    accountingResponsible: '',
    status: 'active',
    logo: null,
  });
  
  // Modal states
  const [modalStates, setModalStates] = useState<ModalStates>({
    addCompany: false,
    settings: false,
    logo: false,
    confirm: false
  });
  
  // Logo states
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Certificate states
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  
  // Tax parameter states
  const [taxParameterErrors, setTaxParameterErrors] = useState<TaxParameterError[]>([]);
  
  // Confirmation action state
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const validateTaxParameter = useCallback((value: number, paramName: string): string | null => {
    if (isNaN(value)) {
      return `${paramName}: Valor deve ser um número válido`;
    }
    if (value < 0) {
      return `${paramName}: Valor não pode ser negativo`;
    }
    if (value > 100) {
      return `${paramName}: Valor não pode ser maior que 100%`;
    }
    if (value.toString().split('.')[1]?.length > 2) {
      return `${paramName}: Máximo de 2 casas decimais permitido`;
    }
    return null;
  }, []);

  const handleTaxParameterChange = useCallback((
    paramId: string,
    value: number,
    paramName: string
  ) => {
    const error = validateTaxParameter(value, paramName);
    
    setTaxParameterErrors(prev => {
      const filtered = prev.filter(err => err.id !== paramId);
      return error ? [...filtered, { id: paramId, message: error }] : filtered;
    });

    if (!error) {
      handleAsyncOperation(
        async () => {
          // Simulate API call
          await delay(1000);
          
          // Update tax parameter locally
          const updatedParameter = {
            id: paramId,
            name: paramName,
            value: value,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'Admin'
          };

          return updatedParameter;
        },
        'Atualizando parâmetro...',
        `${paramName} atualizado para ${value}%`,
        `Erro ao atualizar ${paramName}`
      );
    }
  }, [validateTaxParameter, handleAsyncOperation]);

  const handleSaveTaxParameters = useCallback(async () => {
    if (taxParameterErrors.length > 0) {
      showError('Corrija os erros antes de salvar');
      return;
    }

    await handleAsyncOperation(
      async () => {
        // Simulate API call
        await delay(1500);
        
        // Here you would typically save all parameters to the backend
        return true;
      },
      'Salvando parâmetros fiscais...',
      'Parâmetros fiscais salvos com sucesso!',
      'Erro ao salvar parâmetros fiscais'
    );
  }, [taxParameterErrors, handleAsyncOperation]);

  const handleBulkTaxParameterUpdate = useCallback(async (parameters: TaxParameter[]) => {
    if (!selectedCompany) {
      showError('Selecione uma empresa primeiro');
      return;
    }

    // Validate all parameters first
    const errors = parameters.map(param => ({
      id: param.id,
      error: validateTaxParameter(param.value, param.name)
    })).filter(result => result.error !== null);

    if (errors.length > 0) {
      errors.forEach(({ error }) => showError(error || ''));
      return;
    }

    await handleAsyncOperation(
      async () => {
        // Simulate API call
        await delay(2000);
        
        // Here you would typically update all parameters in the backend
        return parameters.map(param => ({
          ...param,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin'
        }));
      },
      'Atualizando parâmetros fiscais...',
      'Parâmetros fiscais atualizados com sucesso!',
      'Erro ao atualizar parâmetros fiscais'
    );
  }, [selectedCompany, validateTaxParameter, handleAsyncOperation, showError]);

  // Tax parameter import is handled by the enhanced version below

  const handleExportTaxParameters = useCallback(async () => {
    if (!selectedCompany) {
      showError('Selecione uma empresa primeiro');
      return;
    }

    await handleAsyncOperation(
      async () => {
        // Simulate CSV generation
        await delay(1000);
        
        // Here you would typically generate and download a CSV file
        const csvContent = 'data:text/csv;charset=utf-8,ID,Nome,Valor,Última Atualização\n' +
          mockTaxParameters.map(param => 
            `${param.id},${param.name},${param.value},${param.lastUpdated}`
          ).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `parametros_fiscais_${selectedCompany.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
      },
      'Exportando parâmetros fiscais...',
      'Parâmetros fiscais exportados com sucesso!',
      'Erro ao exportar parâmetros fiscais'
    );
  }, [selectedCompany, handleAsyncOperation, showError]);

  // Memoized handlers
  const toggleCompanyExpansion = useCallback((id: string) => {
    if (expandedCompany === id) {
      setExpandedCompany(null);
      setSelectedCompany(null);
    } else {
      setExpandedCompany(id);
      const company = mockCompanies.find(c => c.id === id);
      setSelectedCompany(company || null);
      setCompanyLogo(company?.logo || null);
    }
  }, [expandedCompany]);

  // Update the formatDate function
  const formatDate = useCallback((date: string | Date): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  }, []);

  const getCertificateStatus = useCallback((expirationDate: string): CertificateStatus => {
    const now = formatISO(new Date());
    const expDate = parseISO(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - parseISO(now).getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return {
        color: 'bg-red-100 text-red-800',
        text: 'Expirado',
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />
      };
    }

    if (daysUntilExpiration <= 30) {
      return {
        color: 'bg-yellow-100 text-yellow-800',
        text: `Expira em ${daysUntilExpiration} dias`,
        icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
      };
    }

    return {
      color: 'bg-green-100 text-green-800',
      text: 'Válido',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    };
  }, []);

  const getCertificateTypeIcon = useCallback((type: string) => {
    return type === 'a1' 
      ? <FileText className="h-5 w-5 text-blue-600" />
      : <Shield className="h-5 w-5 text-indigo-600" />;
  }, []);

  // Memoized selectors
  const selectedCompanyCertificates = useMemo(() => 
    mockCertificates.filter(cert => cert.companyId === selectedCompany?.id),
    [selectedCompany]
  );

  const selectedCompanyTaxParameters = useMemo(() =>
    mockTaxParameters.filter(param => param.companyId === selectedCompany?.id),
    [selectedCompany]
  );

  const validCertificates = useMemo(() =>
    selectedCompanyCertificates.filter(cert => cert.status === 'valid'),
    [selectedCompanyCertificates]
  );

  const expiredCertificates = useMemo(() =>
    selectedCompanyCertificates.filter(cert => cert.status === 'expired'),
    [selectedCompanyCertificates]
  );

  const revokedCertificates = useMemo(() =>
    selectedCompanyCertificates.filter(cert => cert.status === 'revoked'),
    [selectedCompanyCertificates]
  );

  const hasValidCertificate = useMemo(() =>
    validCertificates.length > 0,
    [validCertificates]
  );

  const nearExpirationCertificates = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return validCertificates.filter(cert => 
      cert.validTo <= thirtyDaysFromNow
    );
  }, [validCertificates]);

  const taxParametersWithErrors = useMemo(() =>
    selectedCompanyTaxParameters.filter(param =>
      taxParameterErrors.some(error => error.id === param.id)
    ),
    [selectedCompanyTaxParameters, taxParameterErrors]
  );

  // Computed values
  const canSaveTaxParameters = useMemo(() =>
    taxParameterErrors.length === 0 && selectedCompanyTaxParameters.length > 0,
    [taxParameterErrors.length, selectedCompanyTaxParameters.length]
  );

  const canAddCertificate = useMemo(() =>
    selectedCompany !== null && !hasValidCertificate,
    [selectedCompany, hasValidCertificate]
  );

  const shouldShowCertificateWarning = useMemo(() =>
    nearExpirationCertificates.length > 0 || !hasValidCertificate,
    [nearExpirationCertificates.length, hasValidCertificate]
  );

  // Side effects
  useEffect(() => {
    if (shouldShowCertificateWarning) {
      if (!hasValidCertificate) {
        showError('A empresa não possui certificado digital válido');
      } else {
        showError('Existem certificados próximos da data de expiração');
      }
    }
  }, [shouldShowCertificateWarning, hasValidCertificate, showError]);

  useEffect(() => {
    if (selectedCompany && taxParametersWithErrors.length > 0) {
      showError('Existem parâmetros fiscais com erros que precisam ser corrigidos');
    }
  }, [selectedCompany, taxParametersWithErrors.length, showError]);

  // Enhanced form validation
  const validateCompanyForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    // Required fields validation with specific messages
    const requiredFields: FieldValidation[] = [
      { field: 'companyName', label: 'Razão Social' },
      { field: 'tradeName', label: 'Nome Fantasia' },
      { field: 'cnpj', label: 'CNPJ', rules: validationRules.cnpj },
      { field: 'stateRegistration', label: 'Inscrição Estadual' },
      { field: 'address.street', label: 'Logradouro' },
      { field: 'address.number', label: 'Número' },
      { field: 'address.district', label: 'Bairro' },
      { field: 'address.city', label: 'Cidade' },
      { field: 'address.state', label: 'Estado' },
      { field: 'address.zipCode', label: 'CEP', rules: validationRules['address.zipCode'] },
      { field: 'phone', label: 'Telefone', rules: validationRules.phone },
      { field: 'email', label: 'E-mail', rules: validationRules.email },
      { field: 'economicActivity', label: 'Atividade Econômica' },
      { field: 'cnae', label: 'CNAE', rules: validationRules.cnae }
    ];

    // Validate required fields and apply rules
    requiredFields.forEach(({ field, label, rules }) => {
      const value = field.includes('.')
        ? field.split('.').reduce((obj, key) => obj[key], newCompanyForm as any)
        : newCompanyForm[field as keyof CompanyFormState];

      // Required field validation
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field] = `${label} é obrigatório`;
        return;
      }

      // Apply additional validation rules if any
      if (rules && typeof value === 'string') {
        const failedRule = rules.find(rule => !rule.test(value));
        if (failedRule) {
          errors[field] = failedRule.message;
        }
      }
    });

    // Update form errors state
    setFormErrors(errors);
    
    // Return validation result
    return Object.keys(errors).length === 0;
  }, [newCompanyForm, validationRules]);

  // Field-specific validation
  const validateField = useCallback((name: string, value: string) => {
    const errors: FormErrors = {};
    const rules = validationRules[name as keyof typeof validationRules];

    if (rules && value) {
      const failedRule = rules.find(rule => !rule.test(value));
      if (failedRule) {
        errors[name] = failedRule.message;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
    }
  }, [validationRules]);

  // Update handleAddCompany to use the new error handling
  const handleAddCompany = useCallback(async () => {
    if (!validateCompanyForm()) {
      showError('Por favor, corrija os erros no formulário antes de continuar');
      return;
    }

    await handleAsyncOperation(
      async () => {
        // Simulate API call
        await delay(1000);
        
        // Reset form after success
        setNewCompanyForm({
          companyName: '',
          tradeName: '',
          cnpj: '',
          stateRegistration: '',
          municipalRegistration: '',
          address: {
            street: '',
            number: '',
            complement: '',
            district: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil',
          },
          phone: '',
          email: '',
          taxRegime: 'simples',
          economicActivity: '',
          cnae: '',
          openingDate: new Date().toISOString().split('T')[0],
          accountingResponsible: '',
          status: 'active',
          logo: null,
        });
        setFormErrors({});
        setModalStates(prev => ({ ...prev, addCompany: false }));
      },
      'Adicionando empresa...',
      'Empresa adicionada com sucesso!',
      'Erro ao adicionar empresa. Tente novamente.'
    );
  }, [validateCompanyForm, handleAsyncOperation]);

  // Handle opening settings modal with type safety
  const handleOpenSettings = useCallback((companyId: string) => {
    const company = mockCompanies.find(c => c.id === companyId);
    if (!company) {
      toast.error('Empresa não encontrada');
      return;
    }
    setSelectedCompany(company);
    setModalStates(prev => ({ ...prev, settings: true }));
  }, []);

  // Handle saving settings with validation
  const handleSaveSettings = useCallback(function() {
    const saveSettings = async () => {
      if (!selectedCompany) {
        toast.error('Nenhuma empresa selecionada');
        return;
      }

      try {
        // Simulate validation
        await delay(500);
        
        toast.success('Configurações salvas com sucesso!');
        setModalStates(prev => ({ ...prev, settings: false }));
      } catch (error) {
        toast.error('Erro ao salvar configurações. Tente novamente.');
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [selectedCompany]);

  // Handle logo management with improved validation
  const handleOpenLogoModal = useCallback(() => {
    if (!selectedCompany) {
      toast.error('Selecione uma empresa primeiro');
      return;
    }
    setModalStates(prev => ({ ...prev, logo: true }));
  }, [selectedCompany]);

  // Enhanced logo removal with confirmation
  const handleRemoveLogo = useCallback(() => {
    if (!companyLogo) {
      toast.error('Nenhuma logo para remover');
      return;
    }

    setConfirmAction(() => async () => {
      try {
        const loadingToast = toast.loading('Removendo logo...');
        
        // Simulate validation
        await delay(500);
        
        setCompanyLogo(null);
        setLogoFile(null);
        localStorage.removeItem('companyLogo');
        
        toast.dismiss(loadingToast);
        toast.success('Logo removido com sucesso!');
        setModalStates(prev => ({ ...prev, logo: false, confirm: false }));
      } catch (error) {
        toast.error('Erro ao remover logo. Tente novamente.');
        console.error('Error removing logo:', error);
      }
    });
    
    setModalStates(prev => ({ ...prev, confirm: true }));
  }, [companyLogo]);

  // File management utilities
  const handleFileUpload = useCallback(async (
    file: File,
    options: {
      allowedTypes: string[],
      maxSizeInBytes: number,
      validateFn?: (file: File) => Promise<boolean>,
      processFileFn: (file: File) => Promise<any>,
      successMessage: string,
      errorMessage: string,
      loadingMessage: string
    }
  ) => {
    const {
      allowedTypes,
      maxSizeInBytes,
      validateFn,
      processFileFn,
      successMessage,
      errorMessage,
      loadingMessage
    } = options;

    // Validate file type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      showError(`Tipo de arquivo inválido. Tipos permitidos: ${allowedTypes.join(', ')}`);
      return null;
    }

    // Validate file size
    if (file.size > maxSizeInBytes) {
      showError(`Arquivo muito grande. Tamanho máximo permitido: ${maxSizeInBytes / 1024 / 1024}MB`);
      return null;
    }

    // Additional validation if provided
    if (validateFn) {
      const isValid = await validateFn(file);
      if (!isValid) {
        return null;
      }
    }

    // Process file
    return handleAsyncOperation(
      async () => processFileFn(file),
      loadingMessage,
      successMessage,
      errorMessage
    );
  }, [handleAsyncOperation, showError]);

  const readFileAsDataURL = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Falha ao ler o arquivo'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo'));
      reader.readAsDataURL(file);
    });
  }, []);

  const readFileAsText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Falha ao ler o arquivo'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo'));
      reader.readAsText(file);
    });
  }, []);

  // Update logo upload to use new file management
  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      showError('Nenhum arquivo selecionado');
      return;
    }

    const result = await handleFileUpload(file, {
      allowedTypes: ['image/png', 'image/jpeg', 'image/jpg'],
      maxSizeInBytes: 2 * 1024 * 1024, // 2MB
      validateFn: async (file) => {
        const validationResult = await validateImage(file, LOGO_VALIDATION_OPTIONS);
        if (!validationResult.isValid) {
          showError(validationResult.error || 'Arquivo de logo inválido. Verifique o formato e tamanho.');
          return false;
        }
        return true;
      },
      processFileFn: async (file) => {
        const dataUrl = await readFileAsDataURL(file);
        setNewCompanyForm(prev => ({
          ...prev,
          logo: dataUrl
        }));
        return dataUrl;
      },
      loadingMessage: 'Carregando logo...',
      successMessage: 'Logo carregada com sucesso!',
      errorMessage: 'Erro ao processar o arquivo da logo'
    });

    // Cleanup input
    cleanupFileInput(event.target);
  }, [handleFileUpload, readFileAsDataURL, showError]);

  // Update certificate import to use new file management
  const handleCertificateImport = useCallback(async (file: File) => {
    if (!selectedCompany) {
      showError('Selecione uma empresa primeiro');
      return;
    }

    return handleFileUpload(file, {
      allowedTypes: ['application/x-pkcs12'],
      maxSizeInBytes: 1024 * 1024, // 1MB
      processFileFn: async (file) => {
        await delay(1500); // Simulate processing
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          companyId: selectedCompany.id,
          serialNumber: Math.random().toString(36).substr(2, 16),
          issuer: 'AC Certisign RFB G5',
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          filename: file.name,
          password: '********',
          status: 'valid',
          type: 'a1',
          usedFor: ['nfe', 'nfce']
        };
      },
      loadingMessage: 'Importando certificado...',
      successMessage: 'Certificado importado com sucesso!',
      errorMessage: 'Erro ao importar certificado'
    });
  }, [selectedCompany, handleFileUpload, showError]);

  // Update tax parameter import to use new file management
  const handleImportTaxParameters = useCallback(async (file: File) => {
    if (!selectedCompany) {
      showError('Selecione uma empresa primeiro');
      return;
    }

    return handleFileUpload(file, {
      allowedTypes: ['text/csv'],
      maxSizeInBytes: 5 * 1024 * 1024, // 5MB
      processFileFn: async (file) => {
        const content = await readFileAsText(file);
        // Here you would typically parse the CSV content
        await delay(1500); // Simulate processing
        return true;
      },
      loadingMessage: 'Importando parâmetros fiscais...',
      successMessage: 'Parâmetros fiscais importados com sucesso!',
      errorMessage: 'Erro ao importar parâmetros fiscais'
    });
  }, [selectedCompany, handleFileUpload, readFileAsText, showError]);

  // Navigation and interaction handlers
  const handleTabChange = useCallback((tab: 'companies' | 'certificates' | 'parameters') => {
    setActiveTab(tab);
  }, []);

  const handleCompanyKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>, companyId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCompanyExpansion(companyId);
    }
  }, [toggleCompanyExpansion]);

  // Company management handlers
  const handleDeleteCompany = useCallback(async (companyId: string) => {
    const company = mockCompanies.find(c => c.id === companyId);
    if (!company) {
      showError('Empresa não encontrada');
      return;
    }

    setSelectedCompany(company);
    setConfirmAction(() => async () => {
      await handleAsyncOperation(
        async () => {
          await delay(1000);
          setModalStates(prev => ({ ...prev, confirm: false }));
        },
        'Excluindo empresa...',
        'Empresa excluída com sucesso!',
        'Erro ao excluir empresa'
      );
    });
    setModalStates(prev => ({ ...prev, confirm: true }));
  }, [showError, handleAsyncOperation]);

  // Input masking functions
  const maskCNPJ = useCallback((value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/\/(\d{4})(\d)/, '/$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }, []);

  const maskPhone = useCallback((value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  }, []);

  const maskCEP = useCallback((value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  }, []);

  const maskCNAE = useCallback((value: string): string => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{4})(\d)/, '$1-$2')
      .slice(0, 7);
  }, []);

  const maskStateRegistration = useCallback((value: string): string => {
    return value.replace(/\D/g, '').slice(0, 12);
  }, []);

  // Enhanced input change handler with validation
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Apply masks based on field type
    if (name === 'cnpj') {
      processedValue = maskCNPJ(value);
    } else if (name === 'phone') {
      processedValue = maskPhone(value);
    } else if (name === 'address.zipCode') {
      processedValue = maskCEP(value);
    } else if (name === 'cnae') {
      processedValue = maskCNAE(value);
    } else if (name === 'stateRegistration') {
      processedValue = maskStateRegistration(value);
    }
    
    // Update form state
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setNewCompanyForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: processedValue
        }
      }));
    } else {
      setNewCompanyForm(prev => ({ ...prev, [name]: processedValue }));
    }
    
    // Clear error for the field being edited
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    // Real-time validation for specific fields
    validateField(name, processedValue);
  }, [maskCNPJ, maskPhone, maskCEP, maskCNAE, maskStateRegistration, validateField]);

  // Logo management
  const handleLogoRemoval = useCallback(() => {
    setNewCompanyForm(prev => ({ ...prev, logo: null }));
    showSuccess('Logo removida com sucesso');
  }, [showSuccess]);

  // Certificate management
  const handleTestCertificate = useCallback(async (certificate: DigitalCertificate) => {
    return handleAsyncOperation(
      async () => {
        // Simulate certificate validation
        await delay(1500);
        
        const result: CertificateValidationResult = {
          isValid: certificate.status === 'valid',
          expirationDate: certificate.validTo.toISOString(),
          type: certificate.type,
          error: certificate.status !== 'valid' ? 'Certificado inválido ou expirado' : undefined
        };

        return result;
      },
      'Testando certificado...',
      'Certificado validado com sucesso!',
      'Erro ao testar certificado'
    );
  }, [handleAsyncOperation]);

  const handleRevokeCertificate = useCallback(async (certificate: DigitalCertificate) => {
    return handleAsyncOperation(
      async () => {
        // Simulate certificate revocation
        await delay(1500);
        
        // Update the certificate status locally
        const updatedCertificate = {
          ...certificate,
          status: 'revoked' as const,
          lastUpdated: new Date().toISOString()
        };

        return updatedCertificate;
      },
      'Revogando certificado...',
      'Certificado revogado com sucesso!',
      'Erro ao revogar certificado'
    );
  }, [handleAsyncOperation]);

  // Company selection handler
  const handleSelectCompany = useCallback((company: Company) => {
    setSelectedCompany(company);
    setCompanyLogo(company.logo || null);
    showSuccess(`Empresa ${company.companyName} selecionada`);
  }, [showSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Building2 className="h-6 w-6 mr-2 text-gray-700" aria-hidden="true" />
          {TRANSLATIONS.titles.main}
        </h1>
        
        <div className="flex space-x-3">
          <AccessibleIconButton
            icon={<Plus className="h-4 w-4 mr-1" />}
            label={TRANSLATIONS.buttons.newCompany}
            onClick={() => setModalStates(prev => ({ ...prev, addCompany: true }))}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden" role="tablist">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Abas de navegação">
            {[
              { id: 'companies', label: TRANSLATIONS.titles.companies },
              { 
                id: 'certificates', 
                label: TRANSLATIONS.titles.certificates,
                alert: shouldShowCertificateWarning
              },
              { 
                id: 'parameters', 
                label: TRANSLATIONS.titles.parameters,
                alert: taxParametersWithErrors.length > 0
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as 'companies' | 'certificates' | 'parameters')}
                className={`relative w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
              >
                {tab.label}
                {tab.alert && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Companies Tab Content */}
        {activeTab === 'companies' && (
          <div 
            className="px-4 py-5 sm:p-6"
            role="tabpanel"
            aria-labelledby="companies-tab"
            id="companies-panel"
          >
            <div className="space-y-4">
              {mockCompanies.map((company) => (
                <div key={company.id} className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <div 
                    className={`px-4 py-3 flex items-center justify-between cursor-pointer ${
                      expandedCompany === company.id ? 'bg-blue-50 border-b border-blue-100' : 'bg-white'
                    }`}
                    onClick={() => toggleCompanyExpansion(company.id)}
                    onKeyPress={(e) => handleCompanyKeyPress(e, company.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expandedCompany === company.id}
                    aria-controls={`company-details-${company.id}`}
                  >
                    <div className="flex items-center">
                      <Building2 
                        className={`h-5 w-5 mr-2 ${
                          expandedCompany === company.id ? 'text-blue-600' : 'text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{company.companyName}</div>
                        <div className="text-xs text-gray-500">CNPJ: {company.cnpj}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {shouldShowCertificateWarning && company.id === selectedCompany?.id && (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <StatusBadge status={company.status} />
                      {expandedCompany === company.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                  
                  {expandedCompany === company.id && (
                    <div 
                      id={`company-details-${company.id}`}
                      className="px-4 py-3 bg-white space-y-4"
                    >
                      {/* Certificate Status */}
                      {selectedCompanyCertificates.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900">{TRANSLATIONS.sections.certificateStatus}</h4>
                          <div className="mt-2 grid grid-cols-3 gap-4">
                            <MetricCard title={TRANSLATIONS.metrics.valid} value={validCertificates.length} type="success" />
                            <MetricCard title={TRANSLATIONS.metrics.expiring} value={nearExpirationCertificates.length} type="warning" />
                            <MetricCard title={TRANSLATIONS.metrics.expiredRevoked} value={expiredCertificates.length + revokedCertificates.length} type="error" />
                          </div>
                        </div>
                      )}

                      {/* Tax Parameters Status */}
                      {selectedCompanyTaxParameters.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-900">{TRANSLATIONS.sections.taxParameters}</h4>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <MetricCard title={TRANSLATIONS.metrics.total} value={selectedCompanyTaxParameters.length} type="info" />
                            <MetricCard title={TRANSLATIONS.metrics.withErrors} value={taxParametersWithErrors.length} type="error" />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
                        <AccessibleIconButton
                          icon={<Settings className="h-4 w-4 mr-1" />}
                          label={TRANSLATIONS.buttons.settings}
                          onClick={() => handleOpenSettings(company.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        />
                        <AccessibleIconButton
                          icon={<Trash2 className="h-4 w-4 mr-1" />}
                          label={TRANSLATIONS.buttons.delete}
                          onClick={() => handleDeleteCompany(company.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificates Tab Content */}
        {activeTab === 'certificates' && selectedCompany && (
          <div 
            className="px-4 py-5 sm:p-6"
            role="tabpanel"
            aria-labelledby="certificates-tab"
            id="certificates-panel"
          >
            <div className="space-y-4">
              {canAddCertificate && (
                <WarningAlert type="warning" message={TRANSLATIONS.warnings.noCertificate} />
              )}

              {selectedCompanyCertificates.map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getCertificateTypeIcon(cert.type)}
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">{cert.filename}</h4>
                        <p className="text-sm text-gray-500">
                          {TRANSLATIONS.labels.validUntil} {formatDate(cert.validTo)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={cert.status} />
                      <AccessibleIconButton
                        icon={<FileText className="h-4 w-4 mr-1" />}
                        label={TRANSLATIONS.buttons.test}
                        onClick={() => handleTestCertificate(cert)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getCertificateStatus(cert.validTo.toISOString()).color
                      }`}>
                        {getCertificateStatus(cert.validTo.toISOString()).text}
                      </span>
                      {cert.status === 'valid' && (
                        <AccessibleIconButton
                          icon={<XCircle className="h-4 w-4 mr-1" />}
                          label={TRANSLATIONS.buttons.revoke}
                          onClick={() => handleRevokeCertificate(cert)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parameters Tab Content */}
        {activeTab === 'parameters' && selectedCompany && (
          <div 
            className="px-4 py-5 sm:p-6"
            role="tabpanel"
            aria-labelledby="parameters-tab"
            id="parameters-panel"
          >
            <div className="space-y-4">
              {taxParametersWithErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Existem parâmetros com erros que precisam ser corrigidos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <AccessibleIconButton
                  icon={<Upload className="h-4 w-4 mr-1" />}
                  label={TRANSLATIONS.buttons.import}
                  onClick={() => document.getElementById('import-tax-params')?.click()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                />
                <input
                  id="import-tax-params"
                  type="file"
                  className="sr-only"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportTaxParameters(file);
                    e.target.value = '';
                  }}
                />
                <AccessibleIconButton
                  icon={<FileText className="h-4 w-4 mr-1" />}
                  label={TRANSLATIONS.buttons.export}
                  onClick={handleExportTaxParameters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                />
                <AccessibleIconButton
                  icon={<Save className="h-4 w-4 mr-1" />}
                  label={TRANSLATIONS.buttons.save}
                  onClick={handleSaveTaxParameters}
                  disabled={!canSaveTaxParameters}
                  className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    canSaveTaxParameters
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                />
              </div>

              {selectedCompanyTaxParameters.map((param) => {
                const error = taxParameterErrors.find(err => err.id === param.id);
                return (
                  <div 
                    key={param.id} 
                    className={`border rounded-md p-4 ${
                      error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{param.name}</h4>
                        <p className="text-sm text-gray-500">{param.description}</p>
                        {error && (
                          <p className="mt-1 text-sm text-red-600">{error.message}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32">
                          <input
                            type="number"
                            value={param.value}
                            onChange={(e) => handleTaxParameterChange(
                              param.id,
                              parseFloat(e.target.value),
                              param.name
                            )}
                            className={`block w-full shadow-sm sm:text-sm rounded-md ${
                              error
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            step="0.01"
                            min="0"
                            max="100"
                          />
                        </div>
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Última atualização: {formatDate(param.lastUpdated)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
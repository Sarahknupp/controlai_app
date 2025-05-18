/**
 * Accounting-related types and interfaces
 * @module types/accounting
 * @description Types for managing fiscal documents, certificates, and tax obligations
 */

/**
 * Company interface representing a business entity
 * @interface Company
 * @property {string} id - Unique identifier for the company
 * @property {string} cnpj - Brazilian company registration number (CNPJ)
 * @property {string} companyName - Legal company name (Razão Social)
 * @property {string} tradeName - Trade name (Nome Fantasia)
 * @property {string} stateRegistration - State registration number
 * @property {string} municipalRegistration - Municipal registration number
 * @property {string | null} logo - Company logo as base64 or URL
 * @property {Object} address - Company address details
 * @property {string} phone - Contact phone number
 * @property {string} email - Contact email address
 * @property {'simples' | 'presumido' | 'real'} taxRegime - Tax regime type
 * @property {string} economicActivity - Main economic activity
 * @property {string} cnae - Economic activity classification code
 * @property {string} openingDate - Company foundation date
 * @property {string} accountingResponsible - Responsible accountant name
 * @property {'active' | 'inactive' | 'suspended'} status - Current company status
 * @property {Branch[]} [branches] - List of company branches
 */
export interface Company {
  id: string;
  cnpj: string;
  companyName: string;
  tradeName: string;
  stateRegistration: string;
  municipalRegistration: string;
  logo: string | null;
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
  branches?: Branch[];
}

/**
 * Branch interface representing a company branch
 * @interface Branch
 * @property {string} id - Unique identifier for the branch
 * @property {string} cnpj - Branch CNPJ number
 * @property {string} tradeName - Branch trade name
 * @property {string} stateRegistration - Branch state registration
 * @property {string} [municipalRegistration] - Branch municipal registration
 * @property {Object} address - Branch address details
 * @property {boolean} isHeadquarters - Whether this is the main branch
 */
export interface Branch {
  id: string;
  cnpj: string;
  tradeName: string;
  stateRegistration: string;
  municipalRegistration?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isHeadquarters: boolean;
}

/**
 * Digital certificate for fiscal operations
 * @interface DigitalCertificate
 * @property {string} id - Unique identifier for the certificate
 * @property {string} companyId - ID of the company this certificate belongs to
 * @property {string} serialNumber - Certificate serial number
 * @property {string} issuer - Certificate issuing authority
 * @property {Date} validFrom - Certificate validity start date
 * @property {Date} validTo - Certificate validity end date
 * @property {string} filename - Name of the certificate file
 * @property {string} password - Certificate password (encrypted)
 * @property {'valid' | 'expired' | 'revoked'} status - Current certificate status
 * @property {'a1' | 'a3'} type - Certificate type
 * @property {string[]} usedFor - List of fiscal operations this certificate is used for
 */
export interface DigitalCertificate {
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
  usedFor: ('nfe' | 'nfce' | 'cte' | 'mdfe' | 'efd')[];
}

/**
 * Tax parameter interface for managing tax rates and configurations
 * @interface TaxParameter
 * @property {string} id - Unique identifier for the parameter
 * @property {string} [companyId] - ID of the company this parameter belongs to
 * @property {string} name - Parameter name (e.g., ICMS, PIS, COFINS)
 * @property {number} value - Tax rate value
 * @property {string} description - Parameter description
 * @property {string} lastUpdated - Last update timestamp
 * @property {string} updatedBy - ID or name of the user who last updated
 */
export interface TaxParameter {
  id: string;
  companyId?: string;
  name: string;
  value: number;
  description: string;
  lastUpdated: string;
  updatedBy: string;
}

/**
 * Extended tax parameters interface with detailed fiscal information
 * @interface TaxParametersFull
 * @property {string} id - Unique identifier
 * @property {string} companyId - Company ID
 * @property {number} year - Fiscal year
 * @property {number} icmsTaxRate - ICMS tax rate
 * @property {number} pisRate - PIS tax rate
 * @property {number} cofinsRate - COFINS tax rate
 * @property {number} issRate - ISS tax rate
 * @property {number} irrfRate - IRRF tax rate
 * @property {number} csllRate - CSLL tax rate
 * @property {number} inssRate - INSS tax rate
 * @property {number} [icmsSTRate] - ICMS ST rate
 * @property {number} [icmsDeferredRate] - Deferred ICMS rate
 * @property {Array<{ncm: string; rate: number}>} ipiRates - IPI rates by NCM
 * @property {Date} effectiveDate - Date when rates become effective
 * @property {Date} [expirationDate] - Date when rates expire
 * @property {string} createdBy - User who created the record
 * @property {string} [updatedBy] - User who last updated
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} [updatedAt] - Last update timestamp
 */
export interface TaxParametersFull {
  id: string;
  companyId: string;
  year: number;
  icmsTaxRate: number;
  pisRate: number;
  cofinsRate: number;
  issRate: number;
  irrfRate: number;
  csllRate: number;
  inssRate: number;
  icmsSTRate?: number;
  icmsDeferredRate?: number;
  ipiRates: { ncm: string; rate: number }[];
  effectiveDate: Date;
  expirationDate?: Date;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AccountingCode {
  id: string;
  code: string;
  description: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  companyId: string;
  isActive: boolean;
}

/**
 * Fiscal document types
 * @type {string}
 */
export type FiscalDocumentType = 'nfe' | 'nfce' | 'cte' | 'mdfe' | 'nfse';

/**
 * Fiscal document status
 * @type {string}
 */
export type FiscalDocumentStatus = 'draft' | 'issued' | 'cancelled' | 'denied' | 'pending';

/**
 * Payment methods for fiscal documents
 * @type {string}
 */
export type FiscalPaymentMethod = 'cash' | 'credit' | 'debit' | 'pix' | 'bank_transfer' | 'check';

/**
 * Fiscal document interface
 * @interface FiscalDocument
 * @property {string} id - Unique identifier for the document
 * @property {string} companyId - ID of the issuing company
 * @property {string} number - Document number
 * @property {string} serie - Document series
 * @property {FiscalDocumentType} type - Type of fiscal document
 * @property {Date} issueDate - Document issue date
 * @property {FiscalDocumentStatus} status - Current document status
 * @property {string} customerDocument - Customer's document number (CNPJ/CPF)
 * @property {string} customerName - Customer's name
 * @property {number} totalAmount - Total document amount
 * @property {number} taxAmount - Total tax amount
 * @property {FiscalDocumentItem[]} items - Document items
 * @property {FiscalPaymentMethod} paymentMethod - Payment method used
 * @property {string} [accessKey] - Document access key
 * @property {string} [protocol] - Authorization protocol
 * @property {Date} [cancelledAt] - Cancellation date
 * @property {string} [cancelProtocol] - Cancellation protocol
 * @property {string} [xmlContent] - XML content of the document
 * @property {string} createdBy - ID of user who created the document
 * @property {string} [observations] - Additional notes
 * @property {Date} [authorizedAt] - Authorization date
 * @property {string} [deniedReason] - Reason for denial if denied
 */
export interface FiscalDocument {
  id: string;
  companyId: string;
  number: string;
  serie: string;
  type: FiscalDocumentType;
  issueDate: Date;
  status: FiscalDocumentStatus;
  customerDocument: string;
  customerName: string;
  totalAmount: number;
  taxAmount: number;
  items: FiscalDocumentItem[];
  paymentMethod: FiscalPaymentMethod;
  accessKey?: string;
  protocol?: string;
  cancelledAt?: Date;
  cancelProtocol?: string;
  xmlContent?: string;
  createdBy: string;
  observations?: string;
  authorizedAt?: Date;
  deniedReason?: string;
}

/**
 * Fiscal document item interface
 * @interface FiscalDocumentItem
 * @property {string} id - Unique identifier for the item
 * @property {string} documentId - ID of the parent document
 * @property {string} productId - ID of the product
 * @property {string} productCode - Product code
 * @property {string} description - Product description
 * @property {number} quantity - Item quantity
 * @property {number} unitPrice - Unit price
 * @property {number} totalPrice - Total price
 * @property {string} ncm - NCM code (Mercosur Common Nomenclature)
 * @property {string} cfop - CFOP code (Fiscal Operation Code)
 * @property {number} [icmsBaseValue] - ICMS tax base value
 * @property {number} [icmsValue] - ICMS tax value
 * @property {number} [icmsRate] - ICMS tax rate
 * @property {number} [pisBaseValue] - PIS tax base value
 * @property {number} [pisValue] - PIS tax value
 * @property {number} [pisRate] - PIS tax rate
 * @property {number} [cofinsBaseValue] - COFINS tax base value
 * @property {number} [cofinsValue] - COFINS tax value
 * @property {number} [cofinsRate] - COFINS tax rate
 * @property {number} [ipiBaseValue] - IPI tax base value
 * @property {number} [ipiValue] - IPI tax value
 * @property {number} [ipiRate] - IPI tax rate
 * @property {string} [origin] - Product origin code
 */
export interface FiscalDocumentItem {
  id: string;
  documentId: string;
  productId: string;
  productCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ncm: string;
  cfop: string;
  icmsBaseValue?: number;
  icmsValue?: number;
  icmsRate?: number;
  pisBaseValue?: number;
  pisValue?: number;
  pisRate?: number;
  cofinsBaseValue?: number;
  cofinsValue?: number;
  cofinsRate?: number;
  ipiBaseValue?: number;
  ipiValue?: number;
  ipiRate?: number;
  origin?: string;
}

/**
 * SPED file types
 * @type {string}
 */
export type SpedFileType = 'fiscal' | 'contributions' | 'accounting';

/**
 * SPED file status
 * @type {string}
 */
export type SpedFileStatus = 'generating' | 'generated' | 'validated' | 'transmitted' | 'error';

/**
 * SPED validation message types
 * @type {string}
 */
export type SpedMessageType = 'error' | 'warning' | 'info';

/**
 * SPED file interface
 * @interface SpedFile
 * @property {string} id - Unique identifier for the file
 * @property {string} companyId - ID of the company
 * @property {SpedFileType} type - Type of SPED file
 * @property {string} reference - Reference period (YYYY-MM for monthly, YYYY for yearly)
 * @property {Date} generationDate - File generation date
 * @property {SpedFileStatus} status - Current file status
 * @property {Date} [transmissionDate] - File transmission date
 * @property {string} [protocol] - Transmission protocol
 * @property {string} [errorMessage] - Error message if status is error
 * @property {string} fileName - Name of the generated file
 * @property {number} fileSize - Size of the file in bytes
 * @property {string} createdBy - ID of user who created the file
 * @property {SpedValidationMessage[]} [validationMessages] - Validation messages
 */
export interface SpedFile {
  id: string;
  companyId: string;
  type: SpedFileType;
  reference: string;
  generationDate: Date;
  status: SpedFileStatus;
  transmissionDate?: Date;
  protocol?: string;
  errorMessage?: string;
  fileName: string;
  fileSize: number;
  createdBy: string;
  validationMessages?: SpedValidationMessage[];
}

/**
 * SPED validation message interface
 * @interface SpedValidationMessage
 * @property {string} id - Unique identifier for the message
 * @property {string} spedFileId - ID of the SPED file
 * @property {string} block - SPED block where the issue was found
 * @property {string} record - Record type where the issue was found
 * @property {string} field - Field where the issue was found
 * @property {string} message - Validation message
 * @property {SpedMessageType} type - Message type
 */
export interface SpedValidationMessage {
  id: string;
  spedFileId: string;
  block: string;
  record: string;
  field: string;
  message: string;
  type: SpedMessageType;
}

/**
 * Tax obligation types
 * @type {string}
 */
export type TaxObligationType = 'federal' | 'state' | 'municipal';

/**
 * Tax obligation status
 * @type {string}
 */
export type TaxObligationStatus = 'pending' | 'paid' | 'late';

/**
 * Tax obligation interface
 * @interface TaxObligation
 * @property {string} id - Unique identifier for the obligation
 * @property {string} companyId - ID of the company
 * @property {string} name - Name of the tax obligation
 * @property {TaxObligationType} type - Type of tax
 * @property {Date} dueDate - Due date
 * @property {number} amount - Tax amount
 * @property {TaxObligationStatus} status - Current status
 * @property {string} description - Detailed description
 * @property {string} reference - Reference period (YYYY-MM)
 * @property {Date} [paymentDate] - Date of payment
 * @property {string} [document] - Path to related document
 * @property {Date} reminderDate - Date to send reminder
 * @property {string} createdBy - ID of user who created the record
 */
export interface TaxObligation {
  id: string;
  companyId: string;
  name: string;
  type: TaxObligationType;
  dueDate: Date;
  amount: number;
  status: TaxObligationStatus;
  description: string;
  reference: string;
  paymentDate?: Date;
  document?: string;
  reminderDate: Date;
  createdBy: string;
}

export interface AccountingReport {
  id: string;
  companyId: string;
  type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'ledger' | 'custom';
  name: string;
  periodStart: Date;
  periodEnd: Date;
  generationDate: Date;
  status: 'generated' | 'generating' | 'error';
  filePath?: string;
  parameters?: Record<string, any>;
  createdBy: string;
}

export interface CertificateStatus {
  companyId: string;
  totalCertificates: number;
  validCertificates: number;
  expiringCertificates: number; // Expiring in the next 30 days
  expiredCertificates: number;
}

export interface TaxObligationSummary {
  companyId: string;
  pendingObligations: number;
  paidObligations: number;
  lateObligations: number;
  nextDueDates: { name: string; dueDate: Date; amount: number }[];
  totalDue: number;
}

/**
 * Document summary interface
 * @interface DocumentSummary
 * @property {string} companyId - ID of the company
 * @property {number} totalDocuments - Total number of documents
 * @property {number} issuedDocuments - Number of issued documents
 * @property {number} cancelledDocuments - Number of cancelled documents
 * @property {number} pendingDocuments - Number of pending documents
 * @property {number} errorDocuments - Number of documents with errors
 * @property {Object[]} lastDocuments - List of recent documents
 */
export interface DocumentSummary {
  companyId: string;
  totalDocuments: number;
  issuedDocuments: number;
  cancelledDocuments: number;
  pendingDocuments: number;
  errorDocuments: number;
  lastDocuments: {
    number: string;
    type: string;
    customerName: string;
    totalAmount: number;
    issueDate: Date;
  }[];
}

export interface TaxParameterError {
  id: string;
  message: string;
}

/**
 * Form validation rule interface
 * @interface ValidationRule
 * @property {(value: string) => boolean} test - Validation function
 * @property {string} message - Error message when validation fails
 */
export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

/**
 * Form field validation configuration
 * @interface FieldValidation
 * @property {string} field - Field name/identifier
 * @property {string} label - Field display label
 * @property {ValidationRule[]} [rules] - Validation rules
 * @property {boolean} [optional] - Whether field is optional
 * @property {string} [placeholder] - Field placeholder text
 */
export interface FieldValidation {
  field: string;
  label: string;
  rules?: ValidationRule[];
  optional?: boolean;
  placeholder?: string;
}

/**
 * Form section configuration for grouping fields
 * @interface FormSection
 * @property {string} title - Section title
 * @property {React.ReactNode} icon - Section icon
 * @property {FieldValidation[]} fields - Fields in this section
 */
export interface FormSection {
  title: string;
  icon: React.ReactNode;
  fields: FieldValidation[];
}

/**
 * Digital certificate validation result
 * @interface CertificateValidationResult
 * @property {boolean} isValid - Whether certificate is valid
 * @property {string} expirationDate - Certificate expiration date
 * @property {'a1' | 'a3'} type - Certificate type
 * @property {string} [error] - Error message if validation failed
 */
export interface CertificateValidationResult {
  isValid: boolean;
  expirationDate: string;
  type: 'a1' | 'a3';
  error?: string;
}

/**
 * Digital certificate information
 * @interface CertificateInfo
 * @property {string} fileName - Certificate file name
 * @property {string} expirationDate - Expiration date
 * @property {'A1' | 'A3'} type - Certificate type
 * @property {'valid' | 'expired' | 'revoked'} status - Current status
 */
export interface CertificateInfo {
  fileName: string;
  expirationDate: string;
  type: 'A1' | 'A3';
  status: 'valid' | 'expired' | 'revoked';
}
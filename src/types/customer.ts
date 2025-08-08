export type CustomerType = 'individual' | 'company';
export type CustomerStatus = 'active' | 'inactive';

export interface IAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  document: string;  // CPF/CNPJ
  type: CustomerType;
  status: CustomerStatus;
  addresses: IAddress[];
  totalPurchases: number;
  lastPurchase?: Date;
  notes?: string;
  creditLimit?: number;
  paymentTerms?: number;  // in days
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  document: string;
  type: CustomerType;
  status: CustomerStatus;
  addresses: IAddress[];
  notes?: string;
  creditLimit?: number;
  paymentTerms?: number;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface ICustomer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  type: 'individual' | 'company';
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomerFilters {
  search?: string;
  type?: 'individual' | 'company';
  active?: boolean;
  page?: number;
  limit?: number;
} 
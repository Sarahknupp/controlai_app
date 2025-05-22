import { IAddress } from '../types/customer';

export const formatZipCode = (zipCode: string): string => {
  // Remove all non-digit characters
  const cleaned = zipCode.replace(/\D/g, '');
  
  // Format as XXXXX-XXX
  if (cleaned.length >= 5) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  }
  return cleaned;
};

export const formatState = (state: string): string => {
  return state.toUpperCase().slice(0, 2);
};

export const formatAddress = (address: IAddress): string => {
  const parts = [
    `${address.street}, ${address.number}`,
    address.complement,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    address.zipCode,
  ].filter(Boolean);

  return parts.join(', ');
};

export const validateState = (state: string): boolean => {
  const validStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  return validStates.includes(state.toUpperCase());
};

export const getAddressByType = (addresses: IAddress[], type: 'default' | 'all'): IAddress[] => {
  if (type === 'default') {
    return addresses.filter(addr => addr.isDefault);
  }
  return addresses;
}; 
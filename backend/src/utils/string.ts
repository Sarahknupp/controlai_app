export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const truncate = (text: string, length: number): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

export const removeAccents = (str: string): string => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const removeSpecialChars = (str: string): string => {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

export const removeExtraSpaces = (str: string): string => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const numbers = phone.replace(/\D/g, '');
  
  // Format based on length
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  
  return numbers;
};

export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  
  // Remove non-numeric characters
  const numbers = cpf.replace(/\D/g, '');
  
  // Format as XXX.XXX.XXX-XX
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  
  return numbers;
};

export const formatCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';
  
  // Remove non-numeric characters
  const numbers = cnpj.replace(/\D/g, '');
  
  // Format as XX.XXX.XXX/XXXX-XX
  if (numbers.length === 14) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  }
  
  return numbers;
};

export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{5})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return cep;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

export const maskEmail = (email: string): string => {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  // Mask local part
  const maskedLocal = localPart
    .split('.')
    .map(part => {
      if (part.length <= 2) return part;
      return `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`;
    })
    .join('.');
  
  return `${maskedLocal}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) *****-${cleaned.slice(7)}`;
  }
  return `(${cleaned.slice(0, 2)}) ****-${cleaned.slice(6)}`;
};

export const maskCPF = (cpf: string): string => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return `***.***.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
};

export const maskCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return `**.***.${cleaned.slice(6, 9)}/****-${cleaned.slice(12)}`;
};

export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateRandomNumber = (length: number): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}; 
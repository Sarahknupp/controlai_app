import { format, parseISO, isToday as dateFnsIsToday, isYesterday as dateFnsIsYesterday, isThisMonth as dateFnsIsThisMonth, isThisYear as dateFnsIsThisYear, differenceInYears, startOfDay, endOfDay, subDays, isSameDay, isSameWeek, isSameMonth, isSameYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { isToday as _isToday, isYesterday as _isYesterday, isThisMonth as _isThisMonth, isThisYear as _isThisYear } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDateTime = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};

export const formatTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'HH:mm:ss');
};

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'mês' : 'meses'} atrás`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'ano' : 'anos'} atrás`;
};

export const isToday = (date: Date): boolean => {
  return _isToday(date);
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = subDays(new Date(), 1);
  return isSameDay(date, yesterday);
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  return isSameWeek(date, today, { weekStartsOn: 0 }); // 0 = Sunday
};

export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return isSameMonth(date, today);
};

export const isThisYear = (date: Date): boolean => {
  const today = new Date();
  return isSameYear(date, today);
};

export const addDays = (date: Date | string, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const addMonths = (date: Date | string, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

export const addYears = (date: Date | string, years: number): Date => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

export const getStartOfWeek = (date: Date): Date => {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfWeek = (date: Date): Date => {
  const end = endOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfMonth = (date: Date): Date => {
  const start = startOfMonth(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfMonth = (date: Date): Date => {
  const end = endOfMonth(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfYear = (date: Date): Date => {
  const start = startOfYear(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfYear = (date: Date): Date => {
  const end = endOfYear(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
}; 
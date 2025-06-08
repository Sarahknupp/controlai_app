import { format, parseISO, isToday as dateFnsIsToday, isYesterday as dateFnsIsYesterday, isThisMonth as dateFnsIsThisMonth, isThisYear as dateFnsIsThisYear, differenceInYears } from 'date-fns';
import { isToday as _isToday, isYesterday as _isYesterday, isThisMonth as _isThisMonth, isThisYear as _isThisYear } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm:ss');
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
  return _isYesterday(date);
};

export const isThisWeek = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  return d >= startOfWeek && d <= endOfWeek;
};

export const isThisMonth = (date: Date): boolean => {
  return _isThisMonth(date);
};

export const isThisYear = (date: Date): boolean => {
  return _isThisYear(date);
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

export const getStartOfDay = (date: Date | string): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (date: Date | string): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getStartOfWeek = (date: Date | string): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return getStartOfDay(d);
};

export const getEndOfWeek = (date: Date | string): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  d.setDate(diff);
  return getEndOfDay(d);
};

export const getStartOfMonth = (date: Date | string): Date => {
  const d = new Date(date);
  d.setDate(1);
  return getStartOfDay(d);
};

export const getEndOfMonth = (date: Date | string): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return getEndOfDay(d);
};

export const getStartOfYear = (date: Date | string): Date => {
  const d = new Date(date);
  d.setMonth(0, 1);
  return getStartOfDay(d);
};

export const getEndOfYear = (date: Date | string): Date => {
  const d = new Date(date);
  d.setMonth(11, 31);
  return getEndOfDay(d);
};

export const getAge = (birthDate: string | Date): number => {
  const parsedDate = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
  return differenceInYears(new Date(), parsedDate);
}; 
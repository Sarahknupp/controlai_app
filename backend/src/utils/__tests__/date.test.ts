import {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  addDays,
  addMonths,
  addYears,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  getAge,
} from '../date';

describe('Date Manipulation Utilities', () => {
  const mockDate = new Date('2024-03-20T10:30:00');

  describe('formatDate', () => {
    it('should format date in Brazilian format', () => {
      expect(formatDate(mockDate)).toBe('20/03/2024');
    });

    it('should handle string date input', () => {
      expect(formatDate('2024-03-20')).toBe('20/03/2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time in Brazilian format', () => {
      expect(formatDateTime(mockDate)).toBe('20/03/2024 10:30:00');
    });

    it('should handle string date input', () => {
      expect(formatDateTime('2024-03-20T10:30:00')).toBe('20/03/2024 10:30:00');
    });
  });

  describe('formatTime', () => {
    it('should format time in Brazilian format', () => {
      expect(formatTime(mockDate)).toBe('10:30:00');
    });

    it('should handle string date input', () => {
      expect(formatTime('2024-03-20T10:30:00')).toBe('10:30:00');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "agora mesmo" for current time', () => {
      expect(formatRelativeTime(new Date())).toBe('agora mesmo');
    });

    it('should format minutes ago', () => {
      const date = new Date('2024-03-20T10:25:00');
      expect(formatRelativeTime(date)).toBe('5 minutos atrás');
    });

    it('should format hours ago', () => {
      const date = new Date('2024-03-20T08:30:00');
      expect(formatRelativeTime(date)).toBe('2 horas atrás');
    });

    it('should format days ago', () => {
      const date = new Date('2024-03-18T10:30:00');
      expect(formatRelativeTime(date)).toBe('2 dias atrás');
    });

    it('should format months ago', () => {
      const date = new Date('2024-01-20T10:30:00');
      expect(formatRelativeTime(date)).toBe('2 meses atrás');
    });

    it('should format years ago', () => {
      const date = new Date('2022-03-20T10:30:00');
      expect(formatRelativeTime(date)).toBe('2 anos atrás');
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for other days', () => {
      expect(isToday(new Date('2024-03-19'))).toBe(false);
    });
  });

  describe('isYesterday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for yesterday', () => {
      expect(isYesterday(new Date('2024-03-19'))).toBe(true);
    });

    it('should return false for other days', () => {
      expect(isYesterday(new Date())).toBe(false);
    });
  });

  describe('isThisWeek', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00')); // Wednesday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for dates within this week', () => {
      expect(isThisWeek(new Date('2024-03-18'))).toBe(true); // Monday
      expect(isThisWeek(new Date('2024-03-24'))).toBe(true); // Sunday
    });

    it('should return false for dates outside this week', () => {
      expect(isThisWeek(new Date('2024-03-17'))).toBe(false); // Last week
      expect(isThisWeek(new Date('2024-03-25'))).toBe(false); // Next week
    });
  });

  describe('isThisMonth', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for dates within this month', () => {
      expect(isThisMonth(new Date('2024-03-01'))).toBe(true);
      expect(isThisMonth(new Date('2024-03-31'))).toBe(true);
    });

    it('should return false for dates outside this month', () => {
      expect(isThisMonth(new Date('2024-02-29'))).toBe(false);
      expect(isThisMonth(new Date('2024-04-01'))).toBe(false);
    });
  });

  describe('isThisYear', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return true for dates within this year', () => {
      expect(isThisYear(new Date('2024-01-01'))).toBe(true);
      expect(isThisYear(new Date('2024-12-31'))).toBe(true);
    });

    it('should return false for dates outside this year', () => {
      expect(isThisYear(new Date('2023-12-31'))).toBe(false);
      expect(isThisYear(new Date('2025-01-01'))).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const result = addDays(mockDate, 5);
      expect(result.getDate()).toBe(25);
    });

    it('should handle negative days', () => {
      const result = addDays(mockDate, -5);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('addMonths', () => {
    it('should add months to date', () => {
      const result = addMonths(mockDate, 2);
      expect(result.getMonth()).toBe(4); // May (0-based)
    });

    it('should handle negative months', () => {
      const result = addMonths(mockDate, -2);
      expect(result.getMonth()).toBe(0); // January (0-based)
    });
  });

  describe('addYears', () => {
    it('should add years to date', () => {
      const result = addYears(mockDate, 2);
      expect(result.getFullYear()).toBe(2026);
    });

    it('should handle negative years', () => {
      const result = addYears(mockDate, -2);
      expect(result.getFullYear()).toBe(2022);
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day', () => {
      const result = getStartOfDay(mockDate);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day', () => {
      const result = getEndOfDay(mockDate);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getStartOfWeek', () => {
    it('should return start of week (Sunday)', () => {
      const result = getStartOfWeek(mockDate);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfWeek', () => {
    it('should return end of week (Saturday)', () => {
      const result = getEndOfWeek(mockDate);
      expect(result.getDay()).toBe(6); // Saturday
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getStartOfMonth', () => {
    it('should return start of month', () => {
      const result = getStartOfMonth(mockDate);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfMonth', () => {
    it('should return end of month', () => {
      const result = getEndOfMonth(mockDate);
      expect(result.getDate()).toBe(31); // March has 31 days
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getStartOfYear', () => {
    it('should return start of year', () => {
      const result = getStartOfYear(mockDate);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfYear', () => {
    it('should return end of year', () => {
      const result = getEndOfYear(mockDate);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(31);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getAge', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-03-20T10:30:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate age correctly', () => {
      expect(getAge('2000-03-20')).toBe(24);
      expect(getAge('2000-03-21')).toBe(23);
      expect(getAge('2000-04-20')).toBe(23);
    });
  });
}); 
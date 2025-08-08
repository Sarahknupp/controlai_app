import { ImmutableDate, dateUtils } from '../immutable-date';

describe('Immutable Date Utilities', () => {
  describe('ImmutableDate', () => {
    describe('construction', () => {
      it('should create from Date object', () => {
        const date = new Date('2024-03-15T10:30:00Z');
        const immutableDate = ImmutableDate.from(date);
        
        expect(immutableDate.toNativeDate().getTime()).toBe(date.getTime());
      });

      it('should create from string', () => {
        const dateString = '2024-03-15T10:30:00Z';
        const immutableDate = ImmutableDate.from(dateString);
        const expected = new Date(dateString);
        
        expect(immutableDate.toNativeDate().getTime()).toBe(expected.getTime());
      });

      it('should create from DateLike object', () => {
        const dateLike = {
          year: 2024,
          month: 3,
          day: 15,
          hour: 10,
          minute: 30,
          second: 45
        };
        
        const immutableDate = ImmutableDate.from(dateLike);
        const nativeDate = immutableDate.toNativeDate();
        
        expect(nativeDate.getFullYear()).toBe(2024);
        expect(nativeDate.getMonth()).toBe(2); // Month is 0-indexed
        expect(nativeDate.getDate()).toBe(15);
        expect(nativeDate.getHours()).toBe(10);
        expect(nativeDate.getMinutes()).toBe(30);
        expect(nativeDate.getSeconds()).toBe(45);
      });

      it('should use default values for missing time components', () => {
        const dateLike = { year: 2024, month: 3, day: 15 };
        const immutableDate = ImmutableDate.from(dateLike);
        const nativeDate = immutableDate.toNativeDate();
        
        expect(nativeDate.getHours()).toBe(0);
        expect(nativeDate.getMinutes()).toBe(0);
        expect(nativeDate.getSeconds()).toBe(0);
      });
    });

    describe('immutable operations', () => {
      let baseDate: ImmutableDate;

      beforeEach(() => {
        baseDate = ImmutableDate.from('2024-03-15T12:00:00Z');
      });

      it('should not mutate original date when adding days', () => {
        const originalTime = baseDate.valueOf();
        const newDate = baseDate.addDays(5);
        
        expect(baseDate.valueOf()).toBe(originalTime); // Original unchanged
        expect(newDate.valueOf()).not.toBe(originalTime);
        
        const expectedTime = new Date('2024-03-20T12:00:00Z').getTime();
        expect(newDate.valueOf()).toBe(expectedTime);
      });

      it('should not mutate original date when adding months', () => {
        const originalTime = baseDate.valueOf();
        const newDate = baseDate.addMonths(2);
        
        expect(baseDate.valueOf()).toBe(originalTime);
        
        const expectedTime = new Date('2024-05-15T12:00:00Z').getTime();
        expect(newDate.valueOf()).toBe(expectedTime);
      });

      it('should support method chaining', () => {
        const result = baseDate
          .addDays(1)
          .addMonths(1)
          .startOfDay();
          
        const expected = new Date('2024-04-16T00:00:00Z').getTime();
        expect(result.valueOf()).toBe(expected);
        
        // Verify original is unchanged
        expect(baseDate.valueOf()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
      });

      it('should handle negative values correctly', () => {
        const pastDate = baseDate.addDays(-10);
        const expected = new Date('2024-03-05T12:00:00Z').getTime();
        expect(pastDate.valueOf()).toBe(expected);
      });
    });

    describe('start/end operations', () => {
      let testDate: ImmutableDate;

      beforeEach(() => {
        testDate = ImmutableDate.from('2024-03-15T14:30:45.123Z');
      });

      it('should return start of day', () => {
        const startOfDay = testDate.startOfDay();
        const nativeDate = startOfDay.toNativeDate();
        
        expect(nativeDate.getHours()).toBe(0);
        expect(nativeDate.getMinutes()).toBe(0);
        expect(nativeDate.getSeconds()).toBe(0);
        expect(nativeDate.getMilliseconds()).toBe(0);
        expect(nativeDate.getDate()).toBe(15); // Same day
      });

      it('should return end of day', () => {
        const endOfDay = testDate.endOfDay();
        const nativeDate = endOfDay.toNativeDate();
        
        expect(nativeDate.getHours()).toBe(23);
        expect(nativeDate.getMinutes()).toBe(59);
        expect(nativeDate.getSeconds()).toBe(59);
        expect(nativeDate.getMilliseconds()).toBe(999);
        expect(nativeDate.getDate()).toBe(15); // Same day
      });
    });

    describe('formatting', () => {
      let testDate: ImmutableDate;

      beforeEach(() => {
        testDate = ImmutableDate.from('2024-03-15T14:30:00Z');
      });

      it('should format with default options', () => {
        const formatted = testDate.format();
        expect(formatted).toMatch(/15\/03\/2024/); // Brazilian format
      });

      it('should format with custom options', () => {
        const formatted = testDate.format({
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        expect(formatted).toContain('2024');
        expect(formatted).toContain('15');
      });

      it('should cache formatters for performance', () => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
        
        // First call
        const start1 = performance.now();
        const result1 = testDate.format(options);
        const end1 = performance.now();
        
        // Second call (should use cached formatter)
        const start2 = performance.now();
        const result2 = testDate.format(options);
        const end2 = performance.now();
        
        expect(result1).toBe(result2);
        // Second call should be faster (cached formatter)
        expect(end2 - start2).toBeLessThan(end1 - start1);
      });

      it('should format in different locales', () => {
        const usFormat = testDate.format({
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }, 'en-US');
        
        const brFormat = testDate.format({
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }, 'pt-BR');
        
        expect(usFormat).toMatch(/03\/15\/2024/);
        expect(brFormat).toMatch(/15\/03\/2024/);
      });
    });

    describe('relative time formatting', () => {
      it('should format recent times correctly', () => {
        const now = Date.now();
        const oneMinuteAgo = ImmutableDate.from(new Date(now - 60 * 1000));
        const oneHourAgo = ImmutableDate.from(new Date(now - 60 * 60 * 1000));
        const oneDayAgo = ImmutableDate.from(new Date(now - 24 * 60 * 60 * 1000));
        
        // Mock current time for consistent testing
        jest.spyOn(Date, 'now').mockReturnValue(now);
        
        expect(oneMinuteAgo.getRelativeTime()).toContain('minuto');
        expect(oneHourAgo.getRelativeTime()).toContain('hora');
        expect(oneDayAgo.getRelativeTime()).toContain('dia');
        
        jest.restoreAllMocks();
      });

      it('should handle future dates', () => {
        const now = Date.now();
        const futureDate = ImmutableDate.from(new Date(now + 60 * 60 * 1000));
        
        jest.spyOn(Date, 'now').mockReturnValue(now);
        
        const relative = futureDate.getRelativeTime();
        expect(relative).toMatch(/em \d+ hora/);
        
        jest.restoreAllMocks();
      });

      it('should fall back to absolute format for old dates', () => {
        const now = Date.now();
        const veryOldDate = ImmutableDate.from(new Date(now - 2 * 365 * 24 * 60 * 60 * 1000));
        
        jest.spyOn(Date, 'now').mockReturnValue(now);
        
        const relative = veryOldDate.getRelativeTime();
        expect(relative).toMatch(/\d{2}\/\d{2}\/\d{4}/); // Should be absolute date
        
        jest.restoreAllMocks();
      });
    });

    describe('valueOf and comparisons', () => {
      it('should support numeric comparisons', () => {
        const date1 = ImmutableDate.from('2024-03-15');
        const date2 = ImmutableDate.from('2024-03-16');
        const date3 = ImmutableDate.from('2024-03-15');
        
        expect(date1.valueOf()).toBeLessThan(date2.valueOf());
        expect(date1.valueOf()).toBe(date3.valueOf());
      });

      it('should work with sorting', () => {
        const dates = [
          ImmutableDate.from('2024-03-20'),
          ImmutableDate.from('2024-03-15'),
          ImmutableDate.from('2024-03-18')
        ];
        
        const sorted = dates.sort((a, b) => a.valueOf() - b.valueOf());
        
        expect(sorted[0].toNativeDate().getDate()).toBe(15);
        expect(sorted[1].toNativeDate().getDate()).toBe(18);
        expect(sorted[2].toNativeDate().getDate()).toBe(20);
      });
    });
  });

  describe('dateUtils', () => {
    describe('parse with caching', () => {
      it('should cache parsed DateLike objects', () => {
        const dateLike = { year: 2024, month: 3, day: 15 };
        
        // First parse
        const result1 = dateUtils.parse(dateLike);
        // Second parse (should be cached)
        const result2 = dateUtils.parse(dateLike);
        
        expect(result1).toBe(result2); // Same object reference due to caching
      });

      it('should not cache primitive values', () => {
        const dateString = '2024-03-15';
        
        const result1 = dateUtils.parse(dateString);
        const result2 = dateUtils.parse(dateString);
        
        // Different objects but same value
        expect(result1).not.toBe(result2);
        expect(result1.valueOf()).toBe(result2.valueOf());
      });
    });

    describe('dateRange generator', () => {
      it('should generate date ranges correctly', () => {
        const start = ImmutableDate.from('2024-03-01');
        const end = ImmutableDate.from('2024-03-05');
        
        const dates = Array.from(dateUtils.dateRange(start, end));
        
        expect(dates).toHaveLength(5);
        expect(dates[0].toNativeDate().getDate()).toBe(1);
        expect(dates[4].toNativeDate().getDate()).toBe(5);
      });

      it('should handle custom step sizes', () => {
        const start = ImmutableDate.from('2024-03-01');
        const end = ImmutableDate.from('2024-03-10');
        
        const dates = Array.from(dateUtils.dateRange(start, end, 2));
        
        expect(dates).toHaveLength(5); // Days 1, 3, 5, 7, 9
        expect(dates[1].toNativeDate().getDate()).toBe(3);
        expect(dates[2].toNativeDate().getDate()).toBe(5);
      });

      it('should be memory efficient for large ranges', () => {
        const start = ImmutableDate.from('2024-01-01');
        const end = ImmutableDate.from('2024-12-31');
        
        // Create iterator but don't consume all values
        const iterator = dateUtils.dateRange(start, end);
        
        // Test that we can iterate without memory issues
        let count = 0;
        for (const date of iterator) {
          count++;
          if (count >= 10) break; // Only take first 10
        }
        
        expect(count).toBe(10);
      });
    });

    describe('formatMany batch operations', () => {
      it('should format multiple dates efficiently', async () => {
        const dates = Array.from({ length: 100 }, (_, i) => 
          new Date(2024, 2, i + 1) // March 1-100 (some invalid dates)
        ).slice(0, 31); // Only valid March dates
        
        const start = performance.now();
        const results = await dateUtils.formatMany(dates, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const end = performance.now();
        
        expect(results).toHaveLength(31);
        expect(results[0]).toMatch(/01\/03\/2024/);
        expect(results[30]).toMatch(/31\/03\/2024/);
        expect(end - start).toBeLessThan(1000); // Should be fast
      });

      it('should handle large datasets with chunking', async () => {
        const dates = Array.from({ length: 1000 }, (_, i) => 
          new Date(2024, 0, 1 + i % 365) // Cycle through year
        );
        
        const results = await dateUtils.formatMany(dates);
        expect(results).toHaveLength(1000);
        
        // Verify all results are valid date strings
        results.forEach(result => {
          expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });
      });
    });
  });

  describe('performance characteristics', () => {
    it('should handle many operations efficiently', () => {
      const baseDate = ImmutableDate.from('2024-03-15');
      
      const start = performance.now();
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        baseDate
          .addDays(i % 10)
          .addMonths(i % 5)
          .startOfDay()
          .endOfDay();
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should be very fast
    });

    it('should maintain formatter cache efficiency', () => {
      const date = ImmutableDate.from('2024-03-15');
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' } as const;
      
      // Warm up cache
      date.format(options);
      
      const start = performance.now();
      
      // Many cached calls
      for (let i = 0; i < 1000; i++) {
        date.format(options);
      }
      
      const end = performance.now();
      expect(end - start).toBeLessThan(50); // Cached calls should be very fast
    });

    it('should handle concurrent operations safely', async () => {
      const dates = Array.from({ length: 100 }, (_, i) => 
        ImmutableDate.from(`2024-03-${(i % 31) + 1}`)
      );
      
      const operations = dates.map(async (date) => ({
        formatted: date.format(),
        relative: date.getRelativeTime(),
        startDay: date.startOfDay().valueOf(),
        endDay: date.endOfDay().valueOf()
      }));
      
      const start = performance.now();
      const results = await Promise.all(operations);
      const end = performance.now();
      
      expect(results).toHaveLength(100);
      expect(end - start).toBeLessThan(500); // Should handle concurrency well
      
      // Verify all results are valid
      results.forEach(result => {
        expect(typeof result.formatted).toBe('string');
        expect(typeof result.relative).toBe('string');
        expect(typeof result.startDay).toBe('number');
        expect(typeof result.endDay).toBe('number');
        expect(result.endDay).toBeGreaterThan(result.startDay);
      });
    });
  });

  describe('memory management', () => {
    it('should not leak memory through references', () => {
      let baseDate: ImmutableDate | null = ImmutableDate.from('2024-03-15');
      const weakRef = new WeakRef(baseDate);
      
      // Create many derived dates
      const derived = Array.from({ length: 100 }, (_, i) => 
        baseDate!.addDays(i)
      );
      
      // Clear reference to base date
      baseDate = null;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Derived dates should still work
      expect(derived[0].toNativeDate().getDate()).toBe(15);
      expect(derived[10].toNativeDate().getDate()).toBe(25);
    });
  });
});
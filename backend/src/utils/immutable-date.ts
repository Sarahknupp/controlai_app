/**
 * Immutable date utilities with Temporal API preparation
 */

interface DateLike {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export class ImmutableDate {
  private constructor(private date: Date) {}

  static from(input: Date | string | DateLike): ImmutableDate {
    if (input instanceof Date) {
      return new ImmutableDate(new Date(input));
    }
    if (typeof input === 'string') {
      return new ImmutableDate(new Date(input));
    }
    // DateLike object
    const { year, month, day, hour = 0, minute = 0, second = 0 } = input;
    return new ImmutableDate(new Date(year, month - 1, day, hour, minute, second));
  }

  // Immutable operations
  addDays(days: number): ImmutableDate {
    const newDate = new Date(this.date);
    newDate.setDate(newDate.getDate() + days);
    return new ImmutableDate(newDate);
  }

  addMonths(months: number): ImmutableDate {
    const newDate = new Date(this.date);
    newDate.setMonth(newDate.getMonth() + months);
    return new ImmutableDate(newDate);
  }

  // Modern formatting with caching
  private static formatCache = new Map<string, Intl.DateTimeFormat>();

  format(options: Intl.DateTimeFormatOptions = {}, locale = 'pt-BR'): string {
    const cacheKey = `${locale}-${JSON.stringify(options)}`;
    
    if (!ImmutableDate.formatCache.has(cacheKey)) {
      ImmutableDate.formatCache.set(cacheKey, new Intl.DateTimeFormat(locale, options));
    }
    
    return ImmutableDate.formatCache.get(cacheKey)!.format(this.date);
  }

  // Fluent API for common operations
  startOfDay(): ImmutableDate {
    const newDate = new Date(this.date);
    newDate.setHours(0, 0, 0, 0);
    return new ImmutableDate(newDate);
  }

  endOfDay(): ImmutableDate {
    const newDate = new Date(this.date);
    newDate.setHours(23, 59, 59, 999);
    return new ImmutableDate(newDate);
  }

  // Modern relative time with Intl.RelativeTimeFormat
  static relativeFormatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  getRelativeTime(): string {
    const now = Date.now();
    const diffMs = this.date.getTime() - now;
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffSeconds) < 60) {
      return ImmutableDate.relativeFormatter.format(diffSeconds, 'second');
    }
    if (Math.abs(diffMinutes) < 60) {
      return ImmutableDate.relativeFormatter.format(diffMinutes, 'minute');
    }
    if (Math.abs(diffHours) < 24) {
      return ImmutableDate.relativeFormatter.format(diffHours, 'hour');
    }
    if (Math.abs(diffDays) < 30) {
      return ImmutableDate.relativeFormatter.format(diffDays, 'day');
    }

    return this.format({ day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  toNativeDate(): Date {
    return new Date(this.date);
  }

  valueOf(): number {
    return this.date.getTime();
  }
}

// Modern utility functions with better performance
export const dateUtils = {
  // Use WeakMap for better memory management
  parseCache: new WeakMap<object, ImmutableDate>(),

  parse(input: Date | string | DateLike): ImmutableDate {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      if (this.parseCache.has(input as object)) {
        return this.parseCache.get(input as object)!;
      }
      const result = ImmutableDate.from(input);
      this.parseCache.set(input as object, result);
      return result;
    }
    return ImmutableDate.from(input);
  },

  // Modern range operations with generators
  *dateRange(start: ImmutableDate, end: ImmutableDate, step = 1): Generator<ImmutableDate> {
    let current = start;
    while (current.valueOf() <= end.valueOf()) {
      yield current;
      current = current.addDays(step);
    }
  },

  // Batch operations with async support
  async formatMany(
    dates: (Date | string)[], 
    options: Intl.DateTimeFormatOptions = {}
  ): Promise<string[]> {
    // Use requestIdleCallback for better performance
    return new Promise((resolve) => {
      const results: string[] = [];
      let index = 0;

      const processChunk = () => {
        const chunkSize = 100;
        const endIndex = Math.min(index + chunkSize, dates.length);

        for (let i = index; i < endIndex; i++) {
          results[i] = ImmutableDate.from(dates[i]).format(options);
        }

        index = endIndex;

        if (index < dates.length) {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(processChunk);
          } else {
            setTimeout(processChunk, 0);
          }
        } else {
          resolve(results);
        }
      };

      processChunk();
    });
  }
};
import { readFileSync } from 'fs';
import { join } from 'path';
import { AuditService } from './audit.service';

export interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  locales: string[];
}

export class I18nService {
  private translations: Map<string, any> = new Map();
  private config: I18nConfig;

  constructor(
    private readonly auditService: AuditService,
    config: Partial<I18nConfig> = {}
  ) {
    this.config = {
      defaultLocale: config.defaultLocale || 'en',
      fallbackLocale: config.fallbackLocale || 'en',
      locales: config.locales || ['en', 'pt-BR', 'es']
    };

    this.loadTranslations();
  }

  private loadTranslations(): void {
    for (const locale of this.config.locales) {
      try {
        const filePath = join(__dirname, '..', 'locales', locale, 'notifications.json');
        const content = readFileSync(filePath, 'utf-8');
        this.translations.set(locale, JSON.parse(content));
      } catch (error) {
        this.auditService.logAction({
          action: 'i18n_load_error',
          entityType: 'i18n',
          entityId: locale,
          details: `Failed to load translations for locale: ${locale}`,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  public translate(
    key: string,
    locale: string = this.config.defaultLocale,
    params: Record<string, string | number> = {}
  ): string {
    try {
      // Split the key by dots to navigate the translation object
      const keys = key.split('.');
      let translation = this.getTranslation(locale, keys);

      // If translation not found, try fallback locale
      if (!translation && locale !== this.config.fallbackLocale) {
        translation = this.getTranslation(this.config.fallbackLocale, keys);
      }

      // If still no translation found, return the key
      if (!translation) {
        this.auditService.logAction({
          action: 'i18n_missing_translation',
          entityType: 'i18n',
          entityId: key,
          details: `Missing translation for key: ${key} in locale: ${locale}`,
          status: 'warning'
        });
        return key;
      }

      // Replace parameters in the translation
      return this.replaceParams(translation, params);
    } catch (error) {
      this.auditService.logAction({
        action: 'i18n_translation_error',
        entityType: 'i18n',
        entityId: key,
        details: `Error translating key: ${key} for locale: ${locale}`,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return key;
    }
  }

  private getTranslation(locale: string, keys: string[]): string | undefined {
    const translations = this.translations.get(locale);
    if (!translations) return undefined;

    let current = translations;
    for (const key of keys) {
      if (!current[key]) return undefined;
      current = current[key];
    }

    return typeof current === 'string' ? current : undefined;
  }

  private replaceParams(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  public getAvailableLocales(): string[] {
    return this.config.locales;
  }

  public getDefaultLocale(): string {
    return this.config.defaultLocale;
  }

  public getFallbackLocale(): string {
    return this.config.fallbackLocale;
  }

  public reloadTranslations(): void {
    this.translations.clear();
    this.loadTranslations();
  }
} 
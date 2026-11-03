import type { AppLocale } from '../i18n';

export const EMAIL_LOCALE_STORAGE_KEY = 'mcy-email-locale';
export function normalizeEmailLocale(value: unknown): AppLocale | null {
  if (value === 'en-US' || value === 'en') return 'en-US';
  if (value === 'vi-VN' || value === 'vi') return 'vi-VN';
  return null;
}
export function readEmailLocale(appLocale?: AppLocale): AppLocale {
  try { const saved = normalizeEmailLocale(window.localStorage.getItem(EMAIL_LOCALE_STORAGE_KEY)); if (saved) return saved; } catch { /* Storage is optional. */ }
  if (appLocale === 'en-US') return appLocale;
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en') ? 'en-US' : 'vi-VN';
}
export function rememberEmailLocale(locale: AppLocale): void {
  try { window.localStorage.setItem(EMAIL_LOCALE_STORAGE_KEY, locale); } catch { /* The request still carries the selected locale. */ }
}
export function emailLocaleRedirect(base: string, locale: AppLocale): string {
  const url = new URL(base);
  if (url.protocol === 'https:' || url.protocol === 'http:') url.searchParams.set('email_locale', locale);
  return url.toString();
}

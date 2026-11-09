import { locales, type Locale } from './i18n';
export const STORAGE_KEY = 'crona-atelier:onboarding:v1';
export type Preferences = {locale:Locale; completed:boolean};
export function readPreferences(): Preferences | null {
  try { const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return raw && locales.includes(raw.locale) && typeof raw.completed === 'boolean' ? {locale:raw.locale,completed:raw.completed} : null;
  } catch { return null; }
}
export function savePreferences(value:Preferences): boolean {
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(value));return true;} catch {return false;}
}


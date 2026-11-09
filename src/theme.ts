export type Theme = 'light' | 'dark';
export const THEME_KEY = 'crona-atelier:theme:v1';
export function readTheme():Theme {
  try {return localStorage.getItem(THEME_KEY)==='dark'?'dark':'light';} catch {return 'light';}
}
export function saveTheme(theme:Theme):boolean {
  try {localStorage.setItem(THEME_KEY,theme);return true;} catch {return false;}
}
export function applyTheme(theme:Theme) {
  document.documentElement.dataset.theme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#1c1b19':'#f5f1e8');
}


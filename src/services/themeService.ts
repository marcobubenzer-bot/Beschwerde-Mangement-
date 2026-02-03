export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'kb_theme_mode';

export const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  return stored || 'system';
};

export const setStoredTheme = (mode: ThemeMode) => {
  localStorage.setItem(THEME_KEY, mode);
};

export const applyTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  root.dataset.theme = mode;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effective = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  root.classList.toggle('theme-dark', effective === 'dark');
};

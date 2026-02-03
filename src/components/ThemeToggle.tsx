import { useEffect, useState } from 'react';
import { ThemeMode, applyTheme, getStoredTheme, setStoredTheme } from '../services/themeService';

const ThemeToggle = () => {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(mode);
    setStoredTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [mode]);

  return (
    <label className="theme-toggle">
      <span>Theme</span>
      <select value={mode} onChange={(event) => setMode(event.target.value as ThemeMode)}>
        <option value="light">Hell</option>
        <option value="dark">Dunkel</option>
        <option value="system">System</option>
      </select>
    </label>
  );
};

export default ThemeToggle;

import { BrandingData, defaultBranding } from '../types/branding';
import { normalizeBranding } from '../utils/branding';

const BRANDING_KEY = 'klinikbeschwerde_branding';

export const getBranding = (): BrandingData => {
  const raw = localStorage.getItem(BRANDING_KEY);
  if (!raw) return defaultBranding;
  try {
    const parsed = JSON.parse(raw) as BrandingData;
    return normalizeBranding(parsed, defaultBranding);
  } catch {
    return defaultBranding;
  }
};

export const saveBranding = (branding: BrandingData) => {
  localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
};

export const resetBranding = () => {
  saveBranding(defaultBranding);
};

export { defaultBranding };

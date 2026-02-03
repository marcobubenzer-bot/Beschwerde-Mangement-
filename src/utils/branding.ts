import { BrandingData } from '../types/branding';

export const isValidHexColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

export const isValidSvgString = (value: string) => {
  if (!value.trim()) return false;
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  return !parserError && doc.documentElement?.nodeName.toLowerCase() === 'svg';
};

export const normalizeBranding = (branding: BrandingData, fallback: BrandingData): BrandingData => ({
  organizationName: branding.organizationName ?? fallback.organizationName,
  logoSvg: branding.logoSvg ?? fallback.logoSvg,
  primaryColor: isValidHexColor(branding.primaryColor) ? branding.primaryColor : fallback.primaryColor,
  accentColor: isValidHexColor(branding.accentColor) ? branding.accentColor : fallback.accentColor,
  showBranding: Boolean(branding.showBranding),
});

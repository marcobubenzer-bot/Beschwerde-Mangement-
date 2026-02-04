import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { defaultBranding, getBranding, resetBranding, saveBranding } from '../storage/brandingRepository';
import { BrandingData } from '../types/branding';
import { isValidHexColor } from '../utils/branding';

type BrandingContextValue = {
  branding: BrandingData;
  saveBranding: (next: BrandingData) => void;
  resetBranding: () => void;
};

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

const applyBrandingToDocument = (branding: BrandingData) => {
  const root = document.documentElement;
  if (!branding.showBranding) {
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-soft');
    root.style.removeProperty('--accent');
    return;
  }

  const primary = isValidHexColor(branding.primaryColor) ? branding.primaryColor : defaultBranding.primaryColor;
  const accent = isValidHexColor(branding.accentColor) ? branding.accentColor : defaultBranding.accentColor;
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-soft', hexToRgba(primary, 0.15));
  root.style.setProperty('--accent', accent);
};

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const BrandingProvider = ({ children }: PropsWithChildren) => {
  const [branding, setBranding] = useState<BrandingData>(() => getBranding());

  useEffect(() => {
    applyBrandingToDocument(branding);
  }, [branding]);

  const value = useMemo<BrandingContextValue>(
    () => ({
      branding,
      saveBranding: (next) => {
        saveBranding(next);
        setBranding(next);
      },
      resetBranding: () => {
        resetBranding();
        setBranding(defaultBranding);
      },
    }),
    [branding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};

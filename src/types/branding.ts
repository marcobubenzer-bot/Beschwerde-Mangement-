export interface BrandingData {
  organizationName: string;
  logoSvg: string;
  primaryColor: string;
  accentColor: string;
  showBranding: boolean;
}

export const defaultBranding: BrandingData = {
  organizationName: '',
  logoSvg: '',
  primaryColor: '#0069B2',
  accentColor: '#DD0B30',
  showBranding: false,
};

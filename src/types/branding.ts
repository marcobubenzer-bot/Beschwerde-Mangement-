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
  primaryColor: '#6a6af4',
  accentColor: '#1f2a44',
  showBranding: false,
};

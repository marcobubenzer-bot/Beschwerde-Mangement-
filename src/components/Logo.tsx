import { useMemo } from 'react';
import { useBranding } from '../context/BrandingContext';
import { isValidSvgString } from '../utils/branding';

type LogoProps = {
  className?: string;
};

const Logo = ({ className }: LogoProps) => {
  const { branding } = useBranding();
  const showBranding = branding.showBranding;
  const logoIsValid = useMemo(
    () => showBranding && Boolean(branding.logoSvg) && isValidSvgString(branding.logoSvg),
    [branding.logoSvg, showBranding]
  );
  const fallbackLogoSrc = '/brand/evkln-logo.svg';
  const logoClassName = className ? `logo ${className}` : 'logo';

  if (showBranding && logoIsValid) {
    return (
      <div
        className={logoClassName}
        role="img"
        aria-label="Logo"
        dangerouslySetInnerHTML={{ __html: branding.logoSvg }}
      />
    );
  }

  return (
    <img className={logoClassName} src={fallbackLogoSrc} alt="Logo" role="img" aria-label="Logo" />
  );
};

export default Logo;

import { useMemo } from 'react';
import { useBranding } from '../context/BrandingContext';
import { isValidSvgString } from '../utils/branding';

type BrandingMarkProps = {
  subtitle?: string;
};

const BrandingMark = ({ subtitle }: BrandingMarkProps) => {
  const { branding } = useBranding();
  const showBranding = branding.showBranding;
  const logoIsValid = useMemo(
    () => showBranding && Boolean(branding.logoSvg) && isValidSvgString(branding.logoSvg),
    [branding.logoSvg, showBranding]
  );
  const fallbackLogoSrc = '/brand/evkln-logo.svg';

  return (
    <div className="brand">
      <div className="brand-logo">
        {showBranding && logoIsValid ? (
          <div className="brand-logo-svg" aria-hidden="true" dangerouslySetInnerHTML={{ __html: branding.logoSvg }} />
        ) : (
          <img src={fallbackLogoSrc} alt="EVKLN – Evangelisches Klinikum Niederrhein" />
        )}
      </div>
      <div className="brand-text">
        {showBranding && branding.organizationName ? (
          <span className="brand-org">{branding.organizationName}</span>
        ) : null}
        <h1 className="brand-title">Beschwerde-Management</h1>
        {showBranding && subtitle ? <p className="brand-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
};

export default BrandingMark;

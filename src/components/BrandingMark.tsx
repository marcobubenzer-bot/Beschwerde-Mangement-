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

  return (
    <div className="brand">
      {showBranding && logoIsValid ? (
        <div className="brand-logo" aria-hidden="true" dangerouslySetInnerHTML={{ __html: branding.logoSvg }} />
      ) : null}
      <div className="brand-text">
        {showBranding && branding.organizationName ? (
          <span className="brand-org">{branding.organizationName}</span>
        ) : null}
        <h1 className="brand-title">KlinikBeschwerde</h1>
        {showBranding && subtitle ? <p className="brand-subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
};

export default BrandingMark;

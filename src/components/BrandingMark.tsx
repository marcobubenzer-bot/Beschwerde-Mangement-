import { useBranding } from '../context/BrandingContext';
import Logo from './Logo';

type BrandingMarkProps = {
  subtitle?: string;
};

const BrandingMark = ({ subtitle }: BrandingMarkProps) => {
  const { branding } = useBranding();
  const showBranding = branding.showBranding;

  return (
    <div className="brand">
      <div className="brand-logo">
        <Logo />
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

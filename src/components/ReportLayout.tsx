import { Link, Outlet } from 'react-router-dom';
import BrandingMark from './BrandingMark';
import ThemeToggle from './ThemeToggle';

const ReportLayout = () => {
  return (
    <div className="report-shell">
      <header className="report-header">
        <Link to="/" className="brand-link">
          <BrandingMark subtitle="Beschwerde einreichen" />
        </Link>
        <div className="header-actions">
          <Link to="/admin" className="button ghost">
            Admin-Bereich
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="report-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ReportLayout;

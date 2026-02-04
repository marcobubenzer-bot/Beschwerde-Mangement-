import { Link, Outlet } from 'react-router-dom';
import BrandingMark from './BrandingMark';
import ThemeToggle from './ThemeToggle';

const ReportLayout = () => {
  return (
    <div className="report-shell">
      <header className="report-header">
        <BrandingMark subtitle="Beschwerde einreichen" />
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

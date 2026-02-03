import { Link, Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const ReportLayout = () => {
  return (
    <div className="report-shell">
      <header className="report-header">
        <div className="brand">
          <div className="brand-icon">KB</div>
          <div>
            <h1>KlinikBeschwerde</h1>
            <p>Beschwerde einreichen</p>
          </div>
        </div>
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

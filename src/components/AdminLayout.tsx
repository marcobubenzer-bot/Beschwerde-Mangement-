import { Link, NavLink, Outlet } from 'react-router-dom';
import BrandingMark from './BrandingMark';
import ThemeToggle from './ThemeToggle';

const AdminLayout = () => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand-link">
          <BrandingMark subtitle="Admin-Bereich" />
        </Link>
        <nav className="nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/responses">Einreichungen</NavLink>
          <NavLink to="/admin/complaints">Beschwerden & Lob</NavLink>
          <NavLink to="/admin/settings">Einstellungen</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>Offline bereit · LocalStorage</span>
        </div>
      </aside>
      <main className="content">
        <div className="content-header">
          <ThemeToggle />
        </div>
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

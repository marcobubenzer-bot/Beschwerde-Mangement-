import { NavLink, Outlet } from 'react-router-dom';
import BrandingMark from './BrandingMark';
import ThemeToggle from './ThemeToggle';

const AdminLayout = () => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandingMark subtitle="Admin-Bereich" />
        <nav className="nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/new">Neue Beschwerde</NavLink>
          <NavLink to="/admin/complaints">Vorgänge</NavLink>
          <NavLink to="/admin/settings">Einstellungen</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>Offline bereit · IndexedDB</span>
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

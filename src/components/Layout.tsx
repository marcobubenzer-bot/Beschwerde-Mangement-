import { NavLink } from 'react-router-dom';
import { PropsWithChildren } from 'react';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">KB</div>
          <div>
            <h1>KlinikBeschwerde</h1>
            <p>MVP Beschwerdemanagement</p>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/new">Neue Beschwerde</NavLink>
          <NavLink to="/complaints">Vorgänge</NavLink>
          <NavLink to="/settings">Einstellungen</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span>Offline bereit · LocalStorage</span>
        </div>
      </aside>
      <main className="content">
        <div className="content-inner">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

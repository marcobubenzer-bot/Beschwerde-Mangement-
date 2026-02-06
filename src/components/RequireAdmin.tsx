import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingMark from './BrandingMark';
import { authenticateAdmin, isAdminAuthenticated, requireAdminPin } from '../services/authService';

const RequireAdmin = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(!requireAdminPin || isAdminAuthenticated());

  useEffect(() => {
    if (!requireAdminPin) {
      setReady(true);
      return;
    }
    setReady(isAdminAuthenticated());
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (authenticateAdmin(pin)) {
      setReady(true);
      setError('');
      return;
    }
    setError('PIN ist nicht korrekt.');
  };

  if (ready) return <>{children}</>;

  return (
    <section>
      <div className="auth-header">
        <BrandingMark subtitle="Admin-Bereich" />
      </div>
      <div className="card auth-card">
        <h2>Admin-Bereich</h2>
        <p>Bitte PIN eingeben, um fortzufahren.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            PIN
            <input
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="z. B. 1234"
              autoComplete="new-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="button primary">
              Freischalten
            </button>
            <button type="button" className="button ghost" onClick={() => navigate('/')}>
              Zurück zur Startseite
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default RequireAdmin;

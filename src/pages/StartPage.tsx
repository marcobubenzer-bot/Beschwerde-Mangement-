import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingMark from '../components/BrandingMark';
import { authenticateAdmin } from '../services/authService';

type ReporterEntry = 'partien' | 'mitarbeit' | 'sonstige';

const StartPage = () => {
  const navigate = useNavigate();
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleReporterSelect = (type: ReporterEntry) => {
    navigate(`/report?type=${type}`);
  };

  const handleAdminSelect = () => {
    // Security: niemals vorausfüllen – beim Öffnen immer leeren
    setAdminPin('');
    setAdminError('');
    setShowAdminLogin(true);
  };

  const handleAdminSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (authenticateAdmin(adminPin)) {
      setAdminError('');
      setAdminPin('');
      setShowAdminLogin(false);
      navigate('/admin/dashboard');
      return;
    }

    setAdminError('Passwort ist nicht korrekt.');
  };

  return (
    <section className="start-shell">
      <div className="start-header">
        <BrandingMark subtitle="Beschwerdeprotokoll starten" />
        <p className="muted">Bitte wählen Sie zuerst Ihren Meldetyp.</p>
      </div>

      <div className="start-grid">
        <button type="button" className="card start-card" onClick={() => handleReporterSelect('partien')}>
          <h3>Partien</h3>
          <p>Für Patient:innen und Angehörige.</p>
        </button>

        <button type="button" className="card start-card" onClick={() => handleReporterSelect('mitarbeit')}>
          <h3>Mitarbeit</h3>
          <p>Für Mitarbeitende im Klinikbetrieb.</p>
        </button>

        <button type="button" className="card start-card" onClick={() => handleReporterSelect('sonstige')}>
          <h3>Sonstige</h3>
          <p>Weitere meldeberechtigte Personen.</p>
        </button>

        <button type="button" className="card start-card" onClick={handleAdminSelect}>
          <h3>Verwaltung</h3>
          <p>Nur für autorisierte Admins.</p>
        </button>
      </div>

      {showAdminLogin && (
        <div className="card start-admin">
          <h3>Admin-Login</h3>
          <form className="form" onSubmit={handleAdminSubmit}>
            <label>
              Passwort
              <input
                type="password"
                name="admin-pin"
                value={adminPin}
                onChange={(event) => setAdminPin(event.target.value)}
                placeholder="Admin-PIN"
                autoComplete="new-password"
              />
            </label>

            {adminError && <p className="form-error">{adminError}</p>}

            <div className="form-actions">
              <button type="submit" className="button primary">
                Anmelden
              </button>

              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  // Security: beim Schließen auch leeren
                  setAdminPin('');
                  setAdminError('');
                  setShowAdminLogin(false);
                }}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default StartPage;

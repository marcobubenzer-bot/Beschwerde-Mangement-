import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingMark from '../components/BrandingMark';
import { authenticateAdmin } from '../services/authService';

type ReporterEntry = 'partien' | 'mitarbeit' | 'sonstige';

type Feature = {
  title: string;
  description: string;
  icon: JSX.Element;
};

const StartPage = () => {
  const navigate = useNavigate();
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const features = useMemo<Feature[]>(
    () => [
      {
        title: 'Schneller Start',
        description: 'Beschwerden in wenigen Minuten erfassen – ohne unnötige Schritte.',
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3l3.5 7H22l-5.5 4.1L18 21l-6-3.8L6 21l1.5-6.9L2 10h6.5L12 3z"
              fill="currentColor"
            />
          </svg>
        ),
      },
      {
        title: 'Klare Struktur',
        description: 'Ein logisch geführter Prozess, der alle relevanten Details sicher abfragt.',
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M4 6h16M4 12h10M4 18h7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        title: 'Sicher & nachvollziehbar',
        description: 'Audit-sichere Dokumentation mit sauberer Historie und klaren Zuständigkeiten.',
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2l7 4v6c0 5-3.5 8.7-7 10-3.5-1.3-7-5-7-10V6l7-4z"
              fill="currentColor"
            />
          </svg>
        ),
      },
      {
        title: 'Echtzeit-Übersicht',
        description: 'Transparente Einblicke für das Team – ohne aufwändiges Nachfassen.',
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M5 12l4 4L19 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
    ],
    []
  );

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
    <main className="start-page">
      <header className="start-nav">
        <BrandingMark subtitle="Beschwerde-Management, das Vertrauen schafft." />
        <div className="start-nav-actions">
          <button type="button" className="ghost-button" onClick={() => navigate('/report')}>
            Zur Beschwerde
          </button>
          <button type="button" className="ghost-button" onClick={handleAdminSelect}>
            Admin-Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="start-hero">
        <div className="hero-content fade-in">
          <p className="eyebrow">Sicheres Beschwerdemanagement</p>
          <h2>
            Beschwerden werden nicht nur erfasst –<span> sie werden gelöst.</span>
          </h2>
          <p className="hero-subtitle">
            KlinikBeschwerde bringt Struktur in kritische Rückmeldungen, beschleunigt die Bearbeitung und schafft
            nachvollziehbare Prozesse für Teams, die Verantwortung tragen.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => document.getElementById('start-now')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Beschwerde starten
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Mehr erfahren
            </button>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>48h</strong>
              <span>Durchschnittliche Klärung</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>Bewertung durch Teams</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Nachvollziehbarkeit</span>
            </div>
          </div>
        </div>

        <div className="hero-panel fade-in" aria-hidden="true">
          <div className="panel-card">
            <div className="panel-header">
              <span>Live Status</span>
              <span className="status-pill">Aktiv</span>
            </div>
            <div className="panel-body">
              <div className="panel-row">
                <span>Neue Meldungen</span>
                <strong>12</strong>
              </div>
              <div className="panel-row">
                <span>In Prüfung</span>
                <strong>5</strong>
              </div>
              <div className="panel-row">
                <span>Gelöst</span>
                <strong>34</strong>
              </div>
              <div className="panel-progress">
                <div className="panel-progress-bar" />
              </div>
              <p>Transparenz für alle Beteiligten – jederzeit.</p>
            </div>
          </div>
          <div className="panel-card secondary">
            <h3>Warum Teams bleiben</h3>
            <p>„Endlich ein Prozess, der Sicherheit schafft und keine zusätzlichen Schleifen erzeugt.“</p>
            <span>Leitung Qualitätsmanagement</span>
          </div>
        </div>
      </section>

      {/* Reporter Selection */}
      <section className="start-selection" id="start-now">
        <div className="section-heading">
          <h3>Meldetyp wählen</h3>
          <p>Ein klarer Einstieg – abgestimmt auf die Rolle der meldenden Person.</p>
        </div>
        <div className="selection-grid">
          <button type="button" className="selection-card" onClick={() => handleReporterSelect('partien')}>
            <h4>Patient:innen & Angehörige</h4>
            <p>Direkter Weg, um Anliegen schnell zu dokumentieren.</p>
          </button>

          <button type="button" className="selection-card" onClick={() => handleReporterSelect('mitarbeit')}>
            <h4>Mitarbeitende</h4>
            <p>Interne Hinweise strukturiert und sicher erfassen.</p>
          </button>

          <button type="button" className="selection-card" onClick={() => handleReporterSelect('sonstige')}>
            <h4>Weitere Meldende</h4>
            <p>Externe Partner:innen oder Services mit Zugriff.</p>
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <section className="start-features" id="features">
        <div className="section-heading">
          <h3>Funktionen, die den Unterschied machen</h3>
          <p>Jeder Schritt ist auf Klarheit, Geschwindigkeit und Vertrauen ausgelegt.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Benefit Section */}
      <section className="start-benefits">
        <div className="benefit-content">
          <div>
            <h3>Mehr Übersicht, weniger Rückfragen.</h3>
            <p>
              KlinikBeschwerde sorgt dafür, dass Beschwerden nicht im Postfach verschwinden. Teams behalten den Status,
              die Verantwortung und die nächsten Schritte immer im Blick.
            </p>
            <ul>
              <li>Intuitive Workflows mit klaren Zuständigkeiten.</li>
              <li>Automatische Zusammenfassungen für Management-Reports.</li>
              <li>Transparente Dokumentation ohne Medienbrüche.</li>
            </ul>
          </div>
          <div className="benefit-card">
            <p>„Wir sparen pro Fall über 30 Minuten Abstimmung, weil alles an einem Ort ist.“</p>
            <span>Operations Team</span>
            <div className="benefit-metric">
              <strong>+32%</strong>
              <span>Schnellere Bearbeitung</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="start-social">
        <div className="section-heading">
          <h3>Vertraut von Teams, die Verantwortung tragen</h3>
          <p>Platzhalter für Logos, Zahlen oder Kundenstimmen.</p>
        </div>
        <div className="social-logos">
          <span>Universitätsklinikum</span>
          <span>Gesundheitszentrum</span>
          <span>Pflegeverbund</span>
          <span>Qualitätsrat</span>
        </div>
        <div className="social-stats">
          <div>
            <strong>1.200+</strong>
            <span>Bearbeitete Fälle</span>
          </div>
          <div>
            <strong>98%</strong>
            <span>Abschlussquote</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Verfügbarkeit</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="start-cta">
        <div>
          <h3>Bereit für einen klaren Beschwerdeprozess?</h3>
          <p>Starten Sie jetzt oder verschaffen Sie sich einen Überblick über die Funktionen.</p>
        </div>
        <div className="cta-actions">
          <button type="button" className="primary-button" onClick={() => navigate('/report')}>
            Jetzt starten
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate('/admin/dashboard')}>
            Admin-Dashboard
          </button>
        </div>
      </section>

      {showAdminLogin && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Admin-Login</h3>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  // Security: beim Schließen auch leeren
                  setAdminPin('');
                  setAdminError('');
                  setShowAdminLogin(false);
                }}
              >
                Schließen
              </button>
            </div>
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
                <button type="submit" className="primary-button">
                  Anmelden
                </button>
                <button
                  type="button"
                  className="ghost-button"
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
        </div>
      )}
    </main>
  );
};

export default StartPage;

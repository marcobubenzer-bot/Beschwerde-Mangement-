import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { EVKLN_PRIVACY_URL } from '../config/externalLinks';

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <main className="start-page">
      <header className="start-header">
        <Link to="/" className="start-brand" aria-label="Zur Startseite">
          <Logo className="start-logo-image" />
          <div className="start-brand-text">
          <span className="start-brand-title">Patientenbefragung</span>
          <span className="start-brand-subtitle">Ihre Meinung zählt</span>
          </div>
        </Link>
        <div className="start-header-actions">
          <span className="start-system">Qualitätsmanagement</span>
          <a className="start-link" href={EVKLN_PRIVACY_URL} target="_blank" rel="noopener noreferrer">
            Datenschutz
          </a>
        </div>
      </header>
      <p className="start-trust">Ihre Rückmeldung wird vertraulich behandelt.</p>

      <section className="start-hero">
        <div className="hero-content">
          <p className="eyebrow">Feedback nach Behandlung</p>
          <h1>Wie zufrieden waren Sie mit Ihrer Behandlung?</h1>
          <p className="hero-subtitle">
            Bitte bewerten Sie Ihre Erfahrung detailliert – das dauert nur 2–3 Minuten. Ihre Rückmeldung hilft uns,
            unsere Qualität kontinuierlich zu verbessern.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => navigate('/survey')}>
              Umfrage starten
            </button>
          </div>
          <div className="trust-badges" aria-label="Hinweise zur Umfrage">
            <span>2–3 Minuten</span>
            <span>Vertraulich</span>
            <span>Hilft uns besser zu werden</span>
          </div>
        </div>
        <div className="hero-panel" aria-hidden="true">
          <div className="info-card">
            <h2>So verwenden wir Ihr Feedback</h2>
            <ul>
              <li>Auswertung durch das Qualitätsmanagement</li>
              <li>Nur aggregierte Auswertung im Team</li>
              <li>Keine Weitergabe an Dritte</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="complaint-section" aria-labelledby="complaint-title">
        <div>
          <h2 id="complaint-title">Datenschutz & Vertraulichkeit</h2>
          <p>
            Ihre Angaben werden ausschließlich für die Qualitätsverbesserung genutzt. Es erfolgt keine Weitergabe an
            Dritte. Bei Rückfragen können Sie sich jederzeit an unser Qualitätsmanagement wenden.
          </p>
        </div>
        <button type="button" className="ghost-button" onClick={() => navigate('/admin')}>
          Zum Admin-Bereich
        </button>
      </section>

      <footer className="start-footer">
        <p>DSGVO: Ihre Daten werden vertraulich behandelt und nur intern ausgewertet.</p>
      </footer>
    </main>
  );
};

export default StartPage;

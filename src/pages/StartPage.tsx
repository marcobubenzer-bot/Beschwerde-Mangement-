import { Link, useNavigate } from 'react-router-dom';
import { EVKLN_GOOGLE_REVIEW_URL, EVKLN_PRIVACY_URL } from '../config/externalLinks';

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <main className="start-page">
      <header className="start-header">
        <Link to="/" className="start-brand" aria-label="Zur Startseite">
          <img
            className="start-logo-image"
            src="/brand/evkln-logo.svg"
            alt="EVKLN – Evangelisches Klinikum Niederrhein"
          />
          <div className="start-brand-text">
            <span className="start-brand-title">EVKLN</span>
            <span className="start-brand-subtitle">Evangelisches Klinikum Niederrhein</span>
          </div>
        </Link>
        <div className="start-header-actions">
          <span className="start-system">Beschwerde-Management</span>
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
            <button type="button" className="primary-button" onClick={() => navigate('/partnerbefragung')}>
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

      <section className="google-review-section" aria-labelledby="google-review-title">
        <div>
          <h2 id="google-review-title">Bewerten Sie uns auf Google</h2>
          <p>
            Ihr Feedback wird direkt bei Google veröffentlicht. Sie verlassen damit das Beschwerde-Management und
            öffnen die Bewertung in einem neuen Tab.
          </p>
        </div>
        <a
          className="google-review-button"
          href={EVKLN_GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bewerte uns bei Google (öffnet in neuem Tab)"
        >
          Bewerte uns bei Google
        </a>
      </section>

      <section className="complaint-section" aria-labelledby="complaint-title">
        <div>
          <h2 id="complaint-title">Beschwerde melden</h2>
          <p>
            Wenn Sie ein akutes Anliegen haben, nutzen Sie bitte den Beschwerdekanal. Wir prüfen jeden Hinweis
            zeitnah.
          </p>
        </div>
        <button type="button" className="ghost-button" onClick={() => navigate('/report')}>
          Zur Beschwerde
        </button>
      </section>
    </main>
  );
};

export default StartPage;

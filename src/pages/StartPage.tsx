import { Link, useNavigate } from 'react-router-dom';

const StartPage = () => {
  const navigate = useNavigate();

  const scrollToSurvey = () => {
    document.getElementById('survey-start')?.scrollIntoView({ behavior: 'smooth' });
  };

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
          <a className="start-link" href="#">
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
            <button type="button" className="primary-button" onClick={scrollToSurvey}>
              Umfrage starten
            </button>
            <button type="button" className="ghost-button" onClick={scrollToSurvey}>
              Später beantworten
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

      <section className="survey-preview" id="survey-start">
        <div className="survey-card">
          <div className="survey-stepper">
            <div>
              <p className="step-label">Schritt 1 von 4</p>
              <p className="step-title">Gesamtbewertung</p>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
              <span className="progress-fill" style={{ width: '25%' }} />
            </div>
          </div>
          <form className="survey-form" onSubmit={(event) => event.preventDefault()}>
            <fieldset className="form-fieldset">
              <legend>
                Gesamtbewertung <span aria-hidden="true">*</span>
              </legend>
              <div className="star-rating" role="radiogroup" aria-label="Gesamtbewertung in Sternen">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div className="star-option" key={value}>
                    <input type="radio" id={`rating-${value}`} name="overall-rating" value={value} required />
                    <label htmlFor={`rating-${value}`} aria-label={`${value} Sterne`}>
                      ★
                    </label>
                  </div>
                ))}
              </div>
              <p className="field-hint">Bitte wählen Sie eine Bewertung, damit wir Ihre Gesamteinschätzung verstehen.</p>
            </fieldset>

            <fieldset className="form-fieldset">
              <legend>
                Wie wahrscheinlich ist es, dass Sie uns weiterempfehlen? <span aria-hidden="true">*</span>
              </legend>
              <div className="nps-scale" role="radiogroup" aria-label="Weiterempfehlungsskala von 0 bis 10">
                {Array.from({ length: 11 }, (_, index) => (
                  <div className="nps-option" key={index}>
                    <input type="radio" id={`nps-${index}`} name="nps-score" value={index} required />
                    <label htmlFor={`nps-${index}`}>{index}</label>
                  </div>
                ))}
              </div>
              <div className="nps-legend">
                <span>Unwahrscheinlich</span>
                <span>Sehr wahrscheinlich</span>
              </div>
            </fieldset>

            <label className="form-label" htmlFor="feedback-detail">
              Was lief besonders gut – und wo können wir besser werden? (optional)
            </label>
            <textarea
              id="feedback-detail"
              name="feedback-detail"
              rows={4}
              placeholder="Teilen Sie konkrete Situationen oder Eindrücke, die uns helfen, gezielt zu verbessern."
            />

            <div className="form-footer">
              <p className="field-hint">
                Pflichtfelder sind mit * markiert. Sie können Ihre Antworten jederzeit ändern, bevor Sie absenden.
              </p>
              <button type="button" className="primary-button" onClick={scrollToSurvey}>
                Weiter zu Schritt 2
              </button>
            </div>
          </form>
        </div>

        <aside className="survey-outline" aria-label="Übersicht der Umfrage">
          <h2>Was folgt in den nächsten Schritten?</h2>
          <ol>
            <li>Schritt 2: Kommunikation & Betreuung</li>
            <li>Schritt 3: Organisation & Wartezeiten</li>
            <li>Schritt 4: Offene Hinweise & Abschluss</li>
          </ol>
          <div className="info-box">
            <h3>Warum wir nach Details fragen</h3>
            <p>
              Ihre konkreten Beispiele helfen uns, Prozesse zu verbessern. Negative Rückmeldungen sind genauso wichtig wie
              Lob.
            </p>
          </div>
        </aside>
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

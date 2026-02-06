import { Link } from 'react-router-dom';

const SurveyThankYouPage = () => {
  return (
    <main className="survey-page">
      <section className="card thank-you-card">
        <h1>Vielen Dank für Ihre Teilnahme!</h1>
        <p>
          Ihre Angaben werden vertraulich behandelt und anonym ausgewertet. Wenn Sie eine Kontaktaufnahme wünschen,
          melden wir uns zeitnah bei Ihnen.
        </p>
        <p className="small-text">DSGVO-Hinweis: Die Verarbeitung erfolgt ausschließlich zur Qualitätsverbesserung.</p>
        <Link to="/" className="button primary">
          Zur Startseite
        </Link>
      </section>
    </main>
  );
};

export default SurveyThankYouPage;

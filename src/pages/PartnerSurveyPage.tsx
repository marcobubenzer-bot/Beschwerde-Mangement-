import { Link } from 'react-router-dom';

const PartnerSurveyPage = () => (
  <section>
    <div className="card">
      <h2>Partnerbefragung</h2>
      <p>Das Formular kommt bald.</p>
      <Link to="/" className="button ghost">
        Zurück zur Startseite
      </Link>
    </div>
  </section>
);

export default PartnerSurveyPage;

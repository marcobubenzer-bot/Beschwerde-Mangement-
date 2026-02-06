import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { surveyQuestions } from '../data/surveyQuestions';
import { surveyRepository } from '../storage/surveyRepository';
import { SurveyResponse } from '../types/survey';

const SurveyResponseDetailPage = () => {
  const { id } = useParams();
  const [response, setResponse] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    if (!id) return;
    surveyRepository.getResponseById(id).then((item) => setResponse(item || null));
  }, [id]);

  if (!response) {
    return (
      <section className="card">
        <p>Eintrag nicht gefunden.</p>
        <Link to="/admin/responses" className="link">
          Zurück
        </Link>
      </section>
    );
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Antwort vom {new Date(response.createdAt).toLocaleString('de-DE')}</h2>
          <p>
            Station: {response.station || '-'} · Zimmer: {response.zimmer || '-'} · Aufnahmeart:{' '}
            {response.aufnahmeart.length ? response.aufnahmeart.join(', ') : '-'}
          </p>
        </div>
        <Link to="/admin/responses" className="button ghost">
          Zurück
        </Link>
      </header>

      <div className="card">
        <h3>Bewertungen</h3>
        <div className="survey-answer-list">
          {surveyQuestions.map((question) => (
            <div key={question.id} className="survey-answer">
              <span>
                {question.id.replace('q', '')}. {question.label}
              </span>
              <strong>{response.answers[question.id] || 'Keine Angabe'}</strong>
            </div>
          ))}
        </div>

        <div className="survey-answer">
          <span>31. Würden Sie sich wieder für unser Haus entscheiden?</span>
          <strong>{response.q31 || 'Keine Angabe'}</strong>
        </div>
        <div className="survey-answer">
          <span>32. Würden Sie unser Haus weiter empfehlen?</span>
          <strong>{response.q32 || 'Keine Angabe'}</strong>
        </div>
        <div className="survey-answer">
          <span>33. Gesamtnote</span>
          <strong>{response.q33 ?? 'Keine Angabe'}</strong>
        </div>
      </div>

      <div className="card">
        <h3>Freitext</h3>
        <p>{response.freitext || 'Keine Angaben.'}</p>
      </div>

      {response.contactRequested && (
        <div className="card">
          <h3>Kontaktangaben (nur Admin)</h3>
          <p>
            <strong>Name:</strong> {response.contactName || '-'}
          </p>
          <p>
            <strong>Telefon:</strong> {response.contactPhone || '-'}
          </p>
          <p>
            <strong>Anschrift:</strong> {response.contactAddress || '-'}
          </p>
        </div>
      )}
    </section>
  );
};

export default SurveyResponseDetailPage;

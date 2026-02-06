import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import {
  admissionOptions,
  likertOptions,
  overallGradeOptions,
  surveyQuestions,
  yesNoOptions,
} from '../data/surveyQuestions';
import { surveyRepository } from '../storage/surveyRepository';
import { LikertOption, SurveyComplaint, SurveyResponse } from '../types/survey';
import { logEvent } from '../utils/logger';
import { canSubmitSurvey, markSurveySubmitted } from '../utils/rateLimit';
import { isContactInfoValid, sanitizeValue } from '../utils/surveyUtils';

const STEP_COUNT = 3;

const SurveyPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [station, setStation] = useState('');
  const [zimmer, setZimmer] = useState('');
  const [aufnahmeart, setAufnahmeart] = useState<string[]>([]);
  const [answers, setAnswers] = useState<SurveyResponse['answers']>({});
  const [q31, setQ31] = useState('');
  const [q32, setQ32] = useState('');
  const [q33, setQ33] = useState<number | null>(null);
  const [freitext, setFreitext] = useState('');
  const [contactRequested, setContactRequested] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');

  const progressLabel = useMemo(() => `Seite ${step}/${STEP_COUNT}`, [step]);

  const handleToggleAdmission = (value: string) => {
    setAufnahmeart((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handleAnswerChange = (id: string, value: LikertOption) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const validateStep = () => {
    if (step !== STEP_COUNT) return true;
    if (!isContactInfoValid(contactRequested, contactName, contactPhone, contactAddress)) {
      setError('Bitte geben Sie Name, Telefon und Anschrift an, damit wir Sie kontaktieren können.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, STEP_COUNT));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!canSubmitSurvey()) {
      setError('Bitte warten Sie mindestens eine Minute, bevor Sie erneut teilnehmen.');
      return;
    }

    if (honeypot.trim()) {
      setError('Ihre Eingabe konnte nicht verarbeitet werden.');
      return;
    }

    if (!validateStep()) return;

    const response: SurveyResponse = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      station: sanitizeValue(station) || undefined,
      zimmer: sanitizeValue(zimmer) || undefined,
      aufnahmeart: aufnahmeart as SurveyResponse['aufnahmeart'],
      answers,
      q31: (q31 as SurveyResponse['q31']) || undefined,
      q32: (q32 as SurveyResponse['q32']) || undefined,
      q33,
      freitext: sanitizeValue(freitext) || undefined,
      contactRequested,
      contactName: contactRequested ? sanitizeValue(contactName) : null,
      contactPhone: contactRequested ? sanitizeValue(contactPhone) : null,
      contactAddress: contactRequested ? sanitizeValue(contactAddress) : null,
    };

    setSubmitting(true);
    try {
      await surveyRepository.createResponse(response);

      if (response.freitext) {
        const complaint: SurveyComplaint = {
          id: uuid(),
          surveyResponseId: response.id,
          createdAt: response.createdAt,
          category: 'UNKLAR',
          status: 'OFFEN',
          assignedTo: null,
          notes: null,
        };
        await surveyRepository.createComplaint(complaint);
      }

      markSurveySubmitted();
      logEvent('info', `Survey submitted (id=${response.id}, contactRequested=${response.contactRequested}).`);
      navigate('/survey/danke', { replace: true });
    } catch (submitError) {
      console.error(submitError);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="survey-page">
      <header className="survey-header">
        <div>
          <h1>Patientenbefragung</h1>
          <p>
            Vielen Dank, dass Sie sich Zeit nehmen. Ihre Antworten werden vertraulich behandelt und anonym ausgewertet.
          </p>
        </div>
        <span className="survey-progress">{progressLabel}</span>
      </header>

      {error && (
        <div className="alert warning" role="alert">
          {error}
        </div>
      )}

      <form className="survey-form" onSubmit={(event) => event.preventDefault()}>
        <input
          type="text"
          className="honeypot"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />

        {step === 1 && (
          <section className="card">
            <h2>Allgemeine Angaben</h2>
            <p>Diese Angaben helfen uns, die Ergebnisse besser einzuordnen (freiwillig).</p>

            <div className="form-grid">
              <label className="field">
                <span>Station</span>
                <input value={station} onChange={(event) => setStation(event.target.value)} />
              </label>
              <label className="field">
                <span>Zimmer</span>
                <input value={zimmer} onChange={(event) => setZimmer(event.target.value)} />
              </label>
            </div>

            <fieldset className="field-group">
              <legend>Aufnahmeart (Mehrfachauswahl möglich)</legend>
              <div className="checkbox-grid">
                {admissionOptions.map((option) => (
                  <label key={option} className="checkbox">
                    <input
                      type="checkbox"
                      checked={aufnahmeart.includes(option)}
                      onChange={() => handleToggleAdmission(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section className="card">
            <h2>Bewertung (Fragen 1–15)</h2>
            <p>Bitte wählen Sie jeweils die passende Antwort aus.</p>
            <div className="survey-question-list">
              {surveyQuestions.slice(0, 15).map((question) => (
                <div key={question.id} className="survey-question">
                  <p>
                    <strong>{question.id.replace('q', '')}.</strong> {question.label}
                  </p>
                  <div className="radio-grid">
                    {likertOptions.map((option) => (
                      <label key={option} className="radio">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="card">
            <h2>Bewertung (Fragen 16–33)</h2>
            <div className="survey-question-list">
              {surveyQuestions.slice(15).map((question) => (
                <div key={question.id} className="survey-question">
                  <p>
                    <strong>{question.id.replace('q', '')}.</strong> {question.label}
                  </p>
                  <div className="radio-grid">
                    {likertOptions.map((option) => (
                      <label key={option} className="radio">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="survey-question">
              <p>
                <strong>31.</strong> Würden Sie sich wieder für unser Haus entscheiden?
              </p>
              <div className="radio-grid">
                {yesNoOptions.map((option) => (
                  <label key={option} className="radio">
                    <input type="radio" name="q31" value={option} checked={q31 === option} onChange={() => setQ31(option)} />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="survey-question">
              <p>
                <strong>32.</strong> Würden Sie unser Haus weiter empfehlen?
              </p>
              <div className="radio-grid">
                {yesNoOptions.map((option) => (
                  <label key={option} className="radio">
                    <input type="radio" name="q32" value={option} checked={q32 === option} onChange={() => setQ32(option)} />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="survey-question">
              <p>
                <strong>33.</strong> Welche Gesamtnote geben Sie der Klinik?
              </p>
              <div className="radio-grid">
                {overallGradeOptions.map((option) => (
                  <label key={option} className="radio">
                    <input
                      type="radio"
                      name="q33"
                      value={option}
                      checked={q33 === option}
                      onChange={() => setQ33(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <label className="field">
              <span>Ihre Wünsche, Anregungen, Beschwerden oder Lob</span>
              <textarea value={freitext} onChange={(event) => setFreitext(event.target.value)} rows={4} />
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={contactRequested}
                onChange={(event) => setContactRequested(event.target.checked)}
              />
              Ich möchte, dass ein Mitarbeiter des Krankenhauses mit mir Kontakt aufnimmt
            </label>

            {contactRequested && (
              <div className="form-grid">
                <label className="field">
                  <span>Name, Vorname *</span>
                  <input value={contactName} onChange={(event) => setContactName(event.target.value)} required />
                </label>
                <label className="field">
                  <span>Telefon *</span>
                  <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required />
                </label>
                <label className="field full">
                  <span>Anschrift *</span>
                  <input value={contactAddress} onChange={(event) => setContactAddress(event.target.value)} required />
                </label>
              </div>
            )}
          </section>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button type="button" className="button ghost" onClick={handleBack}>
              Zurück
            </button>
          )}
          {step < STEP_COUNT && (
            <button type="button" className="button primary" onClick={handleNext}>
              Weiter
            </button>
          )}
          {step === STEP_COUNT && (
            <button type="button" className="button primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Wird gesendet...' : 'Antwort absenden'}
            </button>
          )}
        </div>
      </form>

      <footer className="small-text">
        DSGVO-Hinweis: Ihre Angaben werden ausschließlich zur Qualitätsverbesserung verarbeitet. Weitere Informationen
        finden Sie in unserer Datenschutzerklärung.
      </footer>
    </main>
  );
};

export default SurveyPage;

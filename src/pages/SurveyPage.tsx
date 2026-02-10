import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

type LikertValue =
  | 'Sehr gut / sehr zufrieden'
  | 'gut / eher zufrieden'
  | 'Ausreichend / weniger zufrieden'
  | 'Mangelhaft / unzufrieden'
  | 'trifft nicht zu / keine Angabe';

type YesNoValue = 'Ja' | 'Nein' | null;

type LikertQuestion = {
  id: `q${number}`;
  number: number;
  text: string;
};

type ResponseState = {
  station: string;
  zimmer: string;
  aufnahmeart: string[];
  q1: LikertValue | null;
  q2: LikertValue | null;
  q3: LikertValue | null;
  q4: LikertValue | null;
  q5: LikertValue | null;
  q6: LikertValue | null;
  q7: LikertValue | null;
  q8: LikertValue | null;
  q9: LikertValue | null;
  q10: LikertValue | null;
  q11: LikertValue | null;
  q12: LikertValue | null;
  q13: LikertValue | null;
  q14: LikertValue | null;
  q15: LikertValue | null;
  q16: LikertValue | null;
  q17: LikertValue | null;
  q18: LikertValue | null;
  q19: LikertValue | null;
  q20: LikertValue | null;
  q21: LikertValue | null;
  q22: LikertValue | null;
  q23: LikertValue | null;
  q24: LikertValue | null;
  q25: LikertValue | null;
  q26: LikertValue | null;
  q27: LikertValue | null;
  q28: LikertValue | null;
  q29: LikertValue | null;
  q30: LikertValue | null;
  q31: YesNoValue;
  q32: YesNoValue;
  q33: 1 | 2 | 3 | 4 | 5 | 6 | null;
  freitext: string;
  contactRequested: boolean;
  contactName: string;
  contactPhone: string;
  contactAddress: string;
};

const INTRO_TEXT = `Sehr geehrte Patientin,\n\nsehr geehrter Patient,\n\nwir nehmen Ihre Meinung ernst und prüfen, was wir verbessern können. Deshalb bitten wir Sie darum, den vorliegenden Fragebogen auszufüllen.\nBitte beantworten Sie die Fragen offen und spontan. Wir behandeln Ihre Angaben streng vertraulich. Nur wenn Sie es wünschen, können Sie uns einen Ansprechpartner für Rückfragen nennen.\nBitte nutzen Sie für den Fragebogen den beigefügten Umschlag und werfen Sie ihn in den Briefkasten auf der Station (Aufschrift: „Ihre Meinung ist uns wichtig“) oder geben Sie ihn beim Pflegepersonal ab.\nWir bedanken uns für Ihre Mitarbeit und wünschen Ihnen eine gute Besserung.`;

const LOCAL_STORAGE_KEY = 'patientenbefragung_v1';
const LAST_FORM_STEP = 12;

const aufnahmearten = [
  'geplante Aufnahme / Einweisung',
  'Verlegung aus anderem Krankenhaus',
  'Notfall',
  'Kooperationspartner eines Zentrums',
] as const;

const likertOptions: LikertValue[] = [
  'Sehr gut / sehr zufrieden',
  'gut / eher zufrieden',
  'Ausreichend / weniger zufrieden',
  'Mangelhaft / unzufrieden',
  'trifft nicht zu / keine Angabe',
];

const likertQuestions: LikertQuestion[] = [
  { id: 'q1', number: 1, text: 'Wie war der Ersteindruck von unserem Haus?' },
  { id: 'q2', number: 2, text: 'Wie zufrieden waren Sie mit dem Aufnahme- und Pfortebereich?' },
  { id: 'q3', number: 3, text: 'Wie zufrieden waren Sie mit der medizinischen Aufnahme?' },
  { id: 'q4', number: 4, text: 'Wurden Sie auf der Station freundlich empfangen?' },
  { id: 'q5', number: 5, text: 'Wie beurteilen Sie den Ablauf auf der Station am Aufnahmetag?' },
  { id: 'q6', number: 6, text: 'Wie war Ihr Eindruck vom fachlichen Können der Ärztinnen und Ärzte?' },
  {
    id: 'q7',
    number: 7,
    text: 'Wurden Sie von den Ärztinnen und Ärzten freundlich und respektvoll behandelt?',
  },
  {
    id: 'q8',
    number: 8,
    text: 'Konnten Sie Ihre Fragen und Ängste vertrauensvoll mit den Ärztinnen und Ärzten besprechen?',
  },
  { id: 'q9', number: 9, text: 'War das, was die Ärztinnen und Ärzte Ihnen sagten, für Sie verständlich?' },
  {
    id: 'q10',
    number: 10,
    text: 'Wurden Sie durch die Ärztinnen und Ärzte über die Behandlungsmöglichkeiten aufgeklärt?',
  },
  {
    id: 'q11',
    number: 11,
    text: 'Wurden Ihnen durch die Ärztinnen und Ärzte Risiken und Komplikationen erklärt?',
  },
  { id: 'q12', number: 12, text: 'Wurden Sie von den Pflegekräften freundlich und respektvoll behandelt?' },
  {
    id: 'q13',
    number: 13,
    text: 'Konnten Sie Ihre Fragen und Ängste vertrauensvoll mit den Pflegekräften besprechen?',
  },
  { id: 'q14', number: 14, text: 'War das, was die Pflegekräfte Ihnen sagten, für Sie verständlich?' },
  { id: 'q15', number: 15, text: 'Wurden Sie durch die Pflegekräfte über die Maßnahmen aufgeklärt?' },
  {
    id: 'q16',
    number: 16,
    text: 'Wurden Sie während der Untersuchungen (EKG, Ultraschall, Spiegelungen, etc.) freundlich und respektvoll behandelt?',
  },
  {
    id: 'q17',
    number: 17,
    text: 'Wurden Sie von den Mitarbeitern der Physiotherapie / Krankengymnastik freundlich und respektvoll behandelt?',
  },
  { id: 'q18', number: 18, text: 'Wurden Sie vom Sozialdienst angemessen beraten?' },
  {
    id: 'q19',
    number: 19,
    text: 'Wurden Sie von den Mitarbeitern des Sozialdienstes freundlich und respektvoll behandelt?',
  },
  {
    id: 'q20',
    number: 20,
    text: 'Wenn sie eine psychoonkologische Beratung erhalten haben, wie zufrieden waren Sie damit?',
  },
  {
    id: 'q21',
    number: 21,
    text: 'Wie beurteilen Sie die zur Verfügung gestellten Informationsblätter und Broschüren?',
  },
  { id: 'q22', number: 22, text: 'Wie zufrieden sind Sie mit dem Ablauf auf der Station?' },
  {
    id: 'q23',
    number: 23,
    text: 'Wie zufrieden sind Sie mit den Wartezeiten während der Behandlung (Untersuchungen, OP, Termine usw.)?',
  },
  { id: 'q24', number: 24, text: 'Wie beurteilen Sie den Ablauf der Entlassung?' },
  { id: 'q25', number: 25, text: 'Konnte Ihnen eine angemessene ambulante Weiterbetreuung vermittelt werden?' },
  { id: 'q26', number: 26, text: 'Wie zufrieden waren Sie mit der Schmerztherapie?' },
  { id: 'q27', number: 27, text: 'Wie zufrieden waren Sie mit dem Essen?' },
  { id: 'q28', number: 28, text: 'Wie zufrieden waren Sie mit der Zimmerausstattung?' },
  { id: 'q29', number: 29, text: 'Wie zufrieden waren Sie mit den Nasszellen?' },
  { id: 'q30', number: 30, text: 'Wie zufrieden waren Sie mit der Sauberkeit / Hygiene?' },
];

const initialState: ResponseState = {
  station: '',
  zimmer: '',
  aufnahmeart: [],
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
  q6: null,
  q7: null,
  q8: null,
  q9: null,
  q10: null,
  q11: null,
  q12: null,
  q13: null,
  q14: null,
  q15: null,
  q16: null,
  q17: null,
  q18: null,
  q19: null,
  q20: null,
  q21: null,
  q22: null,
  q23: null,
  q24: null,
  q25: null,
  q26: null,
  q27: null,
  q28: null,
  q29: null,
  q30: null,
  q31: null,
  q32: null,
  q33: null,
  freitext: '',
  contactRequested: false,
  contactName: '',
  contactPhone: '',
  contactAddress: '',
};

const ProgressHeader = ({ step }: { step: number }) => {
  if (step === 13) return null;
  const current = Math.min(step + 1, 13);
  const progress = (current / 13) * 100;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-8">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600" aria-live="polite">
          <span className="font-medium">Patientenbefragung</span>
          <span>Schritt {current} von 13</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </header>
  );
};

const StepLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 sm:p-8">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
    {subtitle ? <p className="mt-2 text-base leading-relaxed text-slate-600">{subtitle}</p> : null}
    <div className="mt-6 space-y-6">{children}</div>
  </section>
);

const RadioCard = ({
  checked,
  label,
  name,
  value,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  value: string;
  onChange: () => void;
}) => (
  <label
    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-lg transition ${
      checked ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-300 hover:border-slate-400'
    }`}
  >
    <input
      className="h-5 w-5 accent-blue-600"
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      aria-label={label}
    />
    <span>{label}</span>
  </label>
);

const LikertQuestionGroup = ({
  questions,
  responses,
  onChange,
}: {
  questions: LikertQuestion[];
  responses: ResponseState;
  onChange: <K extends keyof ResponseState>(key: K, value: ResponseState[K]) => void;
}) => (
  <div className="space-y-6">
    {questions.map((question) => (
      <fieldset key={question.id} className="space-y-3 rounded-2xl bg-slate-50 p-4 sm:p-5">
        <legend className="text-lg font-medium text-slate-900">
          {question.number}. {question.text}
        </legend>
        <div className="grid gap-3 lg:grid-cols-2">
          {likertOptions.map((option) => (
            <RadioCard
              key={option}
              checked={responses[question.id] === option}
              label={option}
              name={question.id}
              value={option}
              onChange={() => onChange(question.id, option)}
            />
          ))}
        </div>
      </fieldset>
    ))}
  </div>
);

const YesNoQuestion = ({
  question,
  value,
  onChange,
}: {
  question: string;
  value: YesNoValue;
  onChange: (next: YesNoValue) => void;
}) => (
  <fieldset className="space-y-3 rounded-2xl bg-slate-50 p-4 sm:p-5">
    <legend className="text-lg font-medium text-slate-900">{question}</legend>
    <div className="grid gap-3 sm:grid-cols-2">
      {(['Ja', 'Nein'] as const).map((option) => (
        <RadioCard key={option} checked={value === option} label={option} name={question} value={option} onChange={() => onChange(option)} />
      ))}
    </div>
  </fieldset>
);

const GradeQuestion = ({
  value,
  onChange,
}: {
  value: ResponseState['q33'];
  onChange: (next: ResponseState['q33']) => void;
}) => (
  <fieldset className="space-y-3 rounded-2xl bg-slate-50 p-4 sm:p-5">
    <legend className="text-lg font-medium text-slate-900">33. Welche Gesamtnote geben Sie der Klinik</legend>
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((grade) => (
        <RadioCard
          key={grade}
          checked={value === grade}
          label={String(grade)}
          name="q33"
          value={String(grade)}
          onChange={() => onChange(grade as ResponseState['q33'])}
        />
      ))}
    </div>
  </fieldset>
);

const TextAreaField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <label className="block space-y-2">
    <span className="text-lg font-medium text-slate-900">
      Ihre Wünsche, Anregungen, Beschwerden oder Lob (ggf. auf gesondertem Blatt):
    </span>
    <textarea
      className="min-h-36 w-full rounded-xl border border-slate-300 p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Ihre Wünsche, Anregungen, Beschwerden oder Lob"
    />
  </label>
);

const ContactFields = ({
  state,
  onChange,
  errors,
}: {
  state: ResponseState;
  onChange: <K extends keyof ResponseState>(key: K, value: ResponseState[K]) => void;
  errors: Partial<Record<'contactName' | 'contactPhone' | 'contactAddress', string>>;
}) => (
  <div className="space-y-4 rounded-2xl bg-slate-50 p-4 sm:p-5">
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 bg-white p-4">
      <input
        className="mt-1 h-5 w-5 accent-blue-600"
        type="checkbox"
        checked={state.contactRequested}
        onChange={(event) => onChange('contactRequested', event.target.checked)}
        aria-label="Ich möchte, dass ein Mitarbeiter des Krankenhauses mit mir Kontakt aufnimmt:"
      />
      <span className="text-lg text-slate-900">Ich möchte, dass ein Mitarbeiter des Krankenhauses mit mir Kontakt aufnimmt:</span>
    </label>

    {state.contactRequested ? (
      <div className="grid gap-4">
        <label className="space-y-1">
          <span className="font-medium text-slate-900">Name, Vorname</span>
          <input
            className="w-full rounded-xl border border-slate-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={state.contactName}
            onChange={(event) => onChange('contactName', event.target.value)}
            aria-label="Name, Vorname"
          />
          {errors.contactName ? <p className="text-sm text-rose-600">{errors.contactName}</p> : null}
        </label>
        <label className="space-y-1">
          <span className="font-medium text-slate-900">Telefon:</span>
          <input
            className="w-full rounded-xl border border-slate-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={state.contactPhone}
            onChange={(event) => onChange('contactPhone', event.target.value)}
            aria-label="Telefon"
          />
          {errors.contactPhone ? <p className="text-sm text-rose-600">{errors.contactPhone}</p> : null}
        </label>
        <label className="space-y-1">
          <span className="font-medium text-slate-900">Anschrift:</span>
          <input
            className="w-full rounded-xl border border-slate-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={state.contactAddress}
            onChange={(event) => onChange('contactAddress', event.target.value)}
            aria-label="Anschrift"
          />
          {errors.contactAddress ? <p className="text-sm text-rose-600">{errors.contactAddress}</p> : null}
        </label>
      </div>
    ) : null}
  </div>
);

const ReviewScreen = ({ responses }: { responses: ResponseState }) => {
  const answeredLikert = likertQuestions.reduce((count, question) => (responses[question.id] ? count + 1 : count), 0);
  const answeredExtras = [responses.q31, responses.q32, responses.q33, responses.freitext.trim() ? 'text' : null].filter(Boolean)
    .length;

  return (
    <div className="space-y-4 rounded-2xl bg-slate-50 p-5 text-slate-800">
      <p className="text-lg font-medium">Bitte prüfen Sie kurz Ihre Angaben.</p>
      <ul className="list-disc space-y-1 pl-5 text-base">
        <li>Station: {responses.station || '—'} | Zimmer: {responses.zimmer || '—'}</li>
        <li>Aufnahmeart: {responses.aufnahmeart.length ? responses.aufnahmeart.join(', ') : '—'}</li>
        <li>Beantwortete Likert-Fragen: {answeredLikert} von 30</li>
        <li>Weitere Antworten/Freitext: {answeredExtras}</li>
        <li>Kontaktaufnahme: {responses.contactRequested ? 'Ja' : 'Nein'}</li>
      </ul>
    </div>
  );
};

const SurveyApp = () => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<ResponseState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [contactErrors, setContactErrors] = useState<Partial<Record<'contactName' | 'contactPhone' | 'contactAddress', string>>>({});

  useEffect(() => {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawData) return;
    try {
      const parsed = JSON.parse(rawData) as { step: number; responses: ResponseState };
      setStep(Math.min(parsed.step ?? 0, 13));
      setResponses({ ...initialState, ...parsed.responses });
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ step, responses }));
  }, [step, responses]);

  const setField = <K extends keyof ResponseState,>(key: K, value: ResponseState[K]) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const groupedQuestions = useMemo(
    () => [
      likertQuestions.slice(0, 4),
      likertQuestions.slice(4, 8),
      likertQuestions.slice(8, 12),
      likertQuestions.slice(12, 16),
      likertQuestions.slice(16, 20),
      likertQuestions.slice(20, 24),
      likertQuestions.slice(24, 28),
      likertQuestions.slice(28, 30),
    ],
    [],
  );

  const validateContact = () => {
    if (!responses.contactRequested) {
      setContactErrors({});
      return true;
    }

    const errors: Partial<Record<'contactName' | 'contactPhone' | 'contactAddress', string>> = {};
    if (!responses.contactName.trim()) errors.contactName = 'Bitte geben Sie Ihren Namen an.';
    if (!responses.contactPhone.trim()) errors.contactPhone = 'Bitte geben Sie Ihre Telefonnummer an.';
    if (!responses.contactAddress.trim()) errors.contactAddress = 'Bitte geben Sie Ihre Anschrift an.';
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const next = () => {
    if (step === 11 && !validateContact()) return;
    setSubmitError(null);
    setStep((prev) => Math.min(prev + 1, LAST_FORM_STEP));
  };

  const back = () => {
    setSubmitError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateContact()) {
      setStep(11);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responses),
      });

      if (!response.ok) {
        throw new Error('submit failed');
      }

      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setStep(13);
    } catch {
      setSubmitError('Beim Absenden ist ein Fehler aufgetreten. Bitte versuchen Sie es gleich erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <ProgressHeader step={step} />
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 ? (
            <StepLayout title="Patientenbefragung">
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">{INTRO_TEXT}</p>
              <button
                type="button"
                className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
                onClick={next}
              >
                Umfrage starten
              </button>
            </StepLayout>
          ) : null}

          {step === 1 ? (
            <StepLayout
              title="Auf welcher Station / In welchem Zimmer haben Sie gelegen?"
              subtitle="Auf welche Weise kamen Sie in unser Krankenhaus?"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-medium text-slate-900">Station:</span>
                  <input
                    className="w-full rounded-xl border border-slate-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={responses.station}
                    onChange={(event) => setField('station', event.target.value)}
                    aria-label="Station"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-900">Zimmer:</span>
                  <input
                    className="w-full rounded-xl border border-slate-300 p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={responses.zimmer}
                    onChange={(event) => setField('zimmer', event.target.value)}
                    aria-label="Zimmer"
                  />
                </label>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-lg font-medium text-slate-900">Auf welche Weise kamen Sie in unser Krankenhaus?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aufnahmearten.map((option) => {
                    const checked = responses.aufnahmeart.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-base transition ${
                          checked ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          className="h-5 w-5 accent-blue-600"
                          onChange={() =>
                            setField(
                              'aufnahmeart',
                              checked
                                ? responses.aufnahmeart.filter((item) => item !== option)
                                : [...responses.aufnahmeart, option],
                            )
                          }
                          aria-label={option}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </StepLayout>
          ) : null}

          {step >= 2 && step <= 9 ? (
            <StepLayout
              title={`Bewertung (Fragen ${groupedQuestions[step - 2][0].number}–${groupedQuestions[step - 2][groupedQuestions[step - 2].length - 1].number})`}
            >
              <LikertQuestionGroup questions={groupedQuestions[step - 2]} responses={responses} onChange={setField} />
            </StepLayout>
          ) : null}

          {step === 10 ? (
            <StepLayout title="Weitere Bewertung">
              <YesNoQuestion
                question="31. Würden Sie sich wieder für unser Haus entscheiden?"
                value={responses.q31}
                onChange={(nextValue) => setField('q31', nextValue)}
              />
              <YesNoQuestion
                question="32. Würden Sie unser Haus weiter empfehlen?"
                value={responses.q32}
                onChange={(nextValue) => setField('q32', nextValue)}
              />
              <GradeQuestion value={responses.q33} onChange={(nextValue) => setField('q33', nextValue)} />
            </StepLayout>
          ) : null}

          {step === 11 ? (
            <StepLayout title="Abschluss">
              <TextAreaField value={responses.freitext} onChange={(value) => setField('freitext', value)} />
              <ContactFields state={responses} onChange={setField} errors={contactErrors} />
            </StepLayout>
          ) : null}

          {step === 12 ? (
            <StepLayout title="Bitte überprüfen" subtitle="Sie können jetzt absenden oder vorher noch einmal zurückgehen.">
              <ReviewScreen responses={responses} />
              {submitError ? <p className="rounded-xl bg-rose-50 p-4 text-rose-700">{submitError}</p> : null}
            </StepLayout>
          ) : null}

          {step === 13 ? (
            <StepLayout title="Vielen Dank!" subtitle="Ihre Angaben wurden erfolgreich übermittelt.">
              <p className="text-lg text-slate-700">
                Wir bedanken uns für Ihre Mitarbeit und wünschen Ihnen eine gute Besserung.
              </p>
            </StepLayout>
          ) : null}

          {step <= 12 ? (
            <nav className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-50"
                onClick={back}
                disabled={step === 0 || submitting}
              >
                Zurück
              </button>

              {step < 12 ? (
                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
                  onClick={next}
                  disabled={submitting}
                >
                  Weiter
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Wird gesendet...' : 'Absenden'}
                </button>
              )}
            </nav>
          ) : null}
        </form>
      </div>
    </main>
  );
};

export default SurveyApp;

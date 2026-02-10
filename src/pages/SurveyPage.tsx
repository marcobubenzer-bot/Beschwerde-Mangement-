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

type FormErrorMap = Record<string, string>;

type ChoiceCardProps = {
  checked: boolean;
  label: string;
  description?: string;
  name: string;
  value: string;
  onChange: () => void;
  disabled?: boolean;
};

const INTRO_TEXT = `Ihre Rückmeldung hilft uns, die Behandlung spürbar zu verbessern.\nDie Umfrage dauert nur wenige Minuten und ist streng vertraulich.`;
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

const PrimaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="min-h-11 rounded-xl bg-sky-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:opacity-50"
  >
    {children}
  </button>
);

const SurveyCard = ({ children }: { children: ReactNode }) => (
  <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">{children}</section>
);

const ProgressHeader = ({ step }: { step: number }) => {
  if (step > LAST_FORM_STEP) return null;

  const current = step + 1;
  const total = LAST_FORM_STEP + 1;
  const progress = (current / total) * 100;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
        <p className="text-sm font-semibold text-slate-800">Patientenbefragung</p>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600" aria-live="polite">
          <span>Fragefortschritt</span>
          <span>
            Frage {current} von {total}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full rounded-full bg-sky-700 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </header>
  );
};

const SurveyHero = () => (
  <div className="space-y-2 px-1 text-slate-700">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Ihre Meinung zählt</h1>
    <p className="text-base leading-relaxed">{INTRO_TEXT}</p>
    <p className="text-sm text-slate-500">Dauer: ca. 2–4 Minuten.</p>
  </div>
);

const AutosaveState = ({ savedAt }: { savedAt: Date | null }) => {
  if (!savedAt) return null;
  return (
    <p aria-live="polite" className="flex items-center gap-2 text-sm text-emerald-700">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs">✓</span>
      Gespeichert
    </p>
  );
};

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
      {message}
    </p>
  ) : null;

const ChoiceCard = ({ checked, label, description, name, value, onChange, disabled }: ChoiceCardProps) => (
  <label
    className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-base transition duration-200 ${
      checked ? 'border-sky-600 bg-sky-50 text-sky-900' : 'border-slate-200 hover:border-slate-300'
    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
  >
    <input
      className="mt-1 h-5 w-5 accent-sky-700"
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={label}
    />
    <span>
      <span className="font-medium">{label}</span>
      {description ? <span className="mt-1 block text-sm text-slate-600">{description}</span> : null}
    </span>
  </label>
);

const StepLayout = ({
  title,
  subtitle,
  helper,
  children,
}: {
  title: string;
  subtitle?: string;
  helper?: ReactNode;
  children: ReactNode;
}) => (
  <SurveyCard>
    <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h2>
    {subtitle ? <p className="mt-2 text-base text-slate-600">{subtitle}</p> : null}
    {helper ? <div className="mt-3">{helper}</div> : null}
    <div className="mt-6 space-y-5">{children}</div>
  </SurveyCard>
);

const LikertQuestionGroup = ({
  questions,
  responses,
  errors,
  onChange,
}: {
  questions: LikertQuestion[];
  responses: ResponseState;
  errors: FormErrorMap;
  onChange: <K extends keyof ResponseState>(key: K, value: ResponseState[K]) => void;
}) => (
  <div className="space-y-4">
    {questions.map((question) => (
      <fieldset key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
        <legend className="mb-3 text-lg font-medium leading-snug text-slate-900">
          {question.number}. {question.text}
        </legend>
        <div className="grid gap-3">
          {likertOptions.map((option) => (
            <ChoiceCard
              key={option}
              checked={responses[question.id] === option}
              label={option}
              name={question.id}
              value={option}
              onChange={() => onChange(question.id, option)}
            />
          ))}
        </div>
        <FieldError message={errors[question.id]} />
      </fieldset>
    ))}
  </div>
);

const YesNoQuestion = ({
  question,
  fieldName,
  value,
  onChange,
  error,
}: {
  question: string;
  fieldName: 'q31' | 'q32';
  value: YesNoValue;
  onChange: (next: YesNoValue) => void;
  error?: string;
}) => (
  <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
    <legend className="mb-3 text-lg font-medium text-slate-900">{question}</legend>
    <div className="grid gap-3 sm:grid-cols-2">
      {(['Ja', 'Nein'] as const).map((option) => (
        <ChoiceCard
          key={option}
          checked={value === option}
          label={option}
          name={fieldName}
          value={option}
          onChange={() => onChange(option)}
        />
      ))}
    </div>
    <FieldError message={error} />
  </fieldset>
);

const GradeQuestion = ({
  value,
  onChange,
  error,
}: {
  value: ResponseState['q33'];
  onChange: (next: ResponseState['q33']) => void;
  error?: string;
}) => (
  <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
    <legend className="mb-3 text-lg font-medium text-slate-900">33. Welche Gesamtnote geben Sie der Klinik?</legend>
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((grade) => (
        <ChoiceCard
          key={grade}
          checked={value === grade}
          label={String(grade)}
          name="q33"
          value={String(grade)}
          onChange={() => onChange(grade as ResponseState['q33'])}
        />
      ))}
    </div>
    <FieldError message={error} />
  </fieldset>
);

const ReviewScreen = ({ responses }: { responses: ResponseState }) => {
  const answeredLikert = likertQuestions.reduce((count, question) => (responses[question.id] ? count + 1 : count), 0);
  const answeredExtras = [responses.q31, responses.q32, responses.q33, responses.freitext.trim() ? 'text' : null].filter(Boolean)
    .length;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-slate-800">
      <p className="text-lg font-semibold">Fast geschafft – bitte kurz prüfen:</p>
      <ul className="list-disc space-y-1 pl-5 text-base">
        <li>Station: {responses.station || '—'} | Zimmer: {responses.zimmer || '—'}</li>
        <li>Aufnahmeart: {responses.aufnahmeart.length ? responses.aufnahmeart.join(', ') : '—'}</li>
        <li>Beantwortete Likert-Fragen: {answeredLikert} von 30</li>
        <li>Weitere Antworten/Freitext: {answeredExtras}</li>
        <li>Kontaktaufnahme gewünscht: {responses.contactRequested ? 'Ja' : 'Nein'}</li>
      </ul>
    </div>
  );
};

const SurveyApp = () => {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<ResponseState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<FormErrorMap>({});
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Annahme: Die Route /survey bleibt unverändert und das bestehende API-Format von POST /api/survey wird weiterverwendet.
  useEffect(() => {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawData) return;

    try {
      const parsed = JSON.parse(rawData) as { step: number; responses: ResponseState };
      setStep(Math.min(parsed.step ?? 0, LAST_FORM_STEP + 1));
      setResponses({ ...initialState, ...parsed.responses });
      setSavedAt(new Date());
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ step, responses }));
    setSavedAt(new Date());
  }, [step, responses]);

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

  const setField = <K extends keyof ResponseState,>(key: K, value: ResponseState[K]) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    if (stepErrors[key as string]) {
      setStepErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[key as string];
        return nextErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const errors: FormErrorMap = {};

    if (step === 1) {
      if (!responses.station.trim()) errors.station = 'Bitte geben Sie Ihre Station an.';
      if (!responses.zimmer.trim()) errors.zimmer = 'Bitte geben Sie Ihr Zimmer an.';
      if (!responses.aufnahmeart.length) errors.aufnahmeart = 'Bitte wählen Sie mindestens eine Aufnahmeart aus.';
    }

    if (step >= 2 && step <= 9) {
      groupedQuestions[step - 2].forEach((question) => {
        if (!responses[question.id]) {
          errors[question.id] = 'Bitte wählen Sie eine Antwort aus.';
        }
      });
    }

    if (step === 10) {
      if (!responses.q31) errors.q31 = 'Bitte wählen Sie eine Antwort aus.';
      if (!responses.q32) errors.q32 = 'Bitte wählen Sie eine Antwort aus.';
      if (!responses.q33) errors.q33 = 'Bitte vergeben Sie eine Gesamtnote.';
    }

    if (step === 11 && responses.contactRequested) {
      if (!responses.contactName.trim()) errors.contactName = 'Bitte geben Sie Ihren Namen an.';
      if (!responses.contactPhone.trim()) errors.contactPhone = 'Bitte geben Sie Ihre Telefonnummer an.';
      if (!responses.contactAddress.trim()) errors.contactAddress = 'Bitte geben Sie Ihre Anschrift an.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const next = () => {
    if (step > 0 && !validateCurrentStep()) return;
    setSubmitError(null);
    setStep((prev) => Math.min(prev + 1, LAST_FORM_STEP));
  };

  const back = () => {
    setSubmitError(null);
    setStepErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;

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
      setStep(LAST_FORM_STEP + 1);
    } catch {
      setSubmitError('Das Absenden hat leider nicht geklappt. Bitte versuchen Sie es gleich erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100/60 text-slate-900">
      <ProgressHeader step={step} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
        {step <= LAST_FORM_STEP ? <SurveyHero /> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 ? (
            <StepLayout title="Willkommen" subtitle="Ihre Antworten bleiben vertraulich und helfen uns direkt bei Verbesserungen.">
              <p className="text-base leading-relaxed text-slate-700">
                Vielen Dank, dass Sie sich kurz Zeit nehmen. Die Umfrage ist bewusst in kurze Schritte aufgeteilt und schnell erledigt.
              </p>
              <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <summary className="cursor-pointer font-medium text-slate-700">Hinweis zum Datenschutz</summary>
                <p className="mt-2">Ihre Angaben werden ausschließlich zur Qualitätsverbesserung genutzt.</p>
              </details>
            </StepLayout>
          ) : null}

          {step === 1 ? (
            <StepLayout
              title="Aufenthaltsdaten"
              subtitle="Diese Angaben helfen uns, Ihre Rückmeldung besser einzuordnen."
              helper={<AutosaveState savedAt={savedAt} />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1" htmlFor="station">
                  <span className="font-medium text-slate-800">Station</span>
                  <input
                    id="station"
                    className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                    value={responses.station}
                    onChange={(event) => setField('station', event.target.value)}
                  />
                  <FieldError message={stepErrors.station} />
                </label>
                <label className="space-y-1" htmlFor="zimmer">
                  <span className="font-medium text-slate-800">Zimmer</span>
                  <input
                    id="zimmer"
                    className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                    value={responses.zimmer}
                    onChange={(event) => setField('zimmer', event.target.value)}
                  />
                  <FieldError message={stepErrors.zimmer} />
                </label>
              </div>

              <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <legend className="mb-3 text-lg font-medium text-slate-900">Wie kamen Sie in unser Krankenhaus?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {aufnahmearten.map((option) => {
                    const checked = responses.aufnahmeart.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border p-4 text-base transition duration-200 ${
                          checked ? 'border-sky-600 bg-sky-50 text-sky-900' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          className="mt-1 h-5 w-5 accent-sky-700"
                          onChange={() =>
                            setField(
                              'aufnahmeart',
                              checked ? responses.aufnahmeart.filter((item) => item !== option) : [...responses.aufnahmeart, option],
                            )
                          }
                          aria-label={option}
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
                <FieldError message={stepErrors.aufnahmeart} />
              </fieldset>
            </StepLayout>
          ) : null}

          {step >= 2 && step <= 9 ? (
            <StepLayout
              title={`Bewertung der Versorgung (${groupedQuestions[step - 2][0].number}–${groupedQuestions[step - 2][groupedQuestions[step - 2].length - 1].number})`}
              subtitle="Bitte bewerten Sie kurz nach Ihrem persönlichen Eindruck."
              helper={<AutosaveState savedAt={savedAt} />}
            >
              <LikertQuestionGroup questions={groupedQuestions[step - 2]} responses={responses} errors={stepErrors} onChange={setField} />
            </StepLayout>
          ) : null}

          {step === 10 ? (
            <StepLayout title="Gesamteindruck" subtitle="Fast geschafft – nur noch drei kurze Antworten." helper={<AutosaveState savedAt={savedAt} />}>
              <YesNoQuestion
                question="31. Würden Sie sich wieder für unser Haus entscheiden?"
                fieldName="q31"
                value={responses.q31}
                onChange={(nextValue) => setField('q31', nextValue)}
                error={stepErrors.q31}
              />
              <YesNoQuestion
                question="32. Würden Sie unser Haus weiterempfehlen?"
                fieldName="q32"
                value={responses.q32}
                onChange={(nextValue) => setField('q32', nextValue)}
                error={stepErrors.q32}
              />
              <GradeQuestion value={responses.q33} onChange={(nextValue) => setField('q33', nextValue)} error={stepErrors.q33} />
            </StepLayout>
          ) : null}

          {step === 11 ? (
            <StepLayout title="Ihr Feedback" subtitle="Optional: Teilen Sie uns mit, was wir noch besser machen können.">
              <label className="block space-y-2" htmlFor="freitext">
                <span className="text-base font-medium text-slate-900">Wünsche, Anregungen, Beschwerden oder Lob</span>
                <textarea
                  id="freitext"
                  className="min-h-36 w-full rounded-xl border border-slate-300 p-4 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                  value={responses.freitext}
                  onChange={(event) => setField('freitext', event.target.value)}
                />
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-4">
                  <input
                    className="mt-1 h-5 w-5 accent-sky-700"
                    type="checkbox"
                    checked={responses.contactRequested}
                    onChange={(event) => setField('contactRequested', event.target.checked)}
                    aria-label="Kontaktaufnahme gewünscht"
                  />
                  <span className="text-base text-slate-800">Ich wünsche eine Kontaktaufnahme durch das Krankenhaus.</span>
                </label>

                {responses.contactRequested ? (
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-1" htmlFor="contact-name">
                      <span className="font-medium text-slate-800">Name, Vorname</span>
                      <input
                        id="contact-name"
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                        value={responses.contactName}
                        onChange={(event) => setField('contactName', event.target.value)}
                      />
                      <FieldError message={stepErrors.contactName} />
                    </label>
                    <label className="space-y-1" htmlFor="contact-phone">
                      <span className="font-medium text-slate-800">Telefon</span>
                      <input
                        id="contact-phone"
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                        value={responses.contactPhone}
                        onChange={(event) => setField('contactPhone', event.target.value)}
                      />
                      <FieldError message={stepErrors.contactPhone} />
                    </label>
                    <label className="space-y-1" htmlFor="contact-address">
                      <span className="font-medium text-slate-800">Anschrift</span>
                      <input
                        id="contact-address"
                        className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                        value={responses.contactAddress}
                        onChange={(event) => setField('contactAddress', event.target.value)}
                      />
                      <FieldError message={stepErrors.contactAddress} />
                    </label>
                  </div>
                ) : null}
              </div>
            </StepLayout>
          ) : null}

          {step === 12 ? (
            <StepLayout title="Abschluss" subtitle="Ein Klick noch, dann ist alles erledigt.">
              <ReviewScreen responses={responses} />
              {submitError ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700" role="alert">
                  {submitError}
                </p>
              ) : null}
            </StepLayout>
          ) : null}

          {step === 13 ? (
            <StepLayout title="Vielen Dank!" subtitle="Ihre Angaben wurden sicher übermittelt.">
              <p className="text-base leading-relaxed text-slate-700">
                Danke für Ihre Unterstützung. Ihre Rückmeldung fließt direkt in die Verbesserung unserer Behandlung ein.
              </p>
            </StepLayout>
          ) : null}

          {step <= LAST_FORM_STEP ? (
            <nav className="flex flex-wrap items-center justify-between gap-3">
              <SecondaryButton type="button" onClick={back} disabled={step === 0 || submitting}>
                Zurück
              </SecondaryButton>

              {step < LAST_FORM_STEP ? (
                <PrimaryButton type="button" onClick={next} disabled={submitting}>
                  Weiter
                </PrimaryButton>
              ) : (
                <PrimaryButton type="submit" disabled={submitting} aria-busy={submitting}>
                  {submitting ? 'Wird gesendet…' : 'Jetzt abschließen'}
                </PrimaryButton>
              )}
            </nav>
          ) : null}
        </form>
      </div>
    </main>
  );
};

export default SurveyApp;

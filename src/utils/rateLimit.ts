const RATE_LIMIT_KEY = 'patientenbefragung_last_submit';
const RATE_LIMIT_SECONDS = 60;

export const canSubmitSurvey = () => {
  const raw = localStorage.getItem(RATE_LIMIT_KEY);
  if (!raw) return true;
  const last = Number(raw);
  if (!Number.isFinite(last)) return true;
  const diffSeconds = (Date.now() - last) / 1000;
  return diffSeconds >= RATE_LIMIT_SECONDS;
};

export const markSurveySubmitted = () => {
  localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
};

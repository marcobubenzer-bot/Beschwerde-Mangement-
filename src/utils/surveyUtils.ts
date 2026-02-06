import { AdmissionOption, LikertOption, SurveyFilters, SurveyResponse } from '../types/survey';

export const likertScoreMap: Record<LikertOption, number | null> = {
  'Sehr gut / sehr zufrieden': 4,
  'gut / eher zufrieden': 3,
  'Ausreichend / weniger zufrieden': 2,
  'Mangelhaft / unzufrieden': 1,
  'trifft nicht zu / keine Angabe': null,
};

export const sanitizeValue = (value?: string | null) => (value ? value.trim() : '');

export const isContactInfoValid = (contactRequested: boolean, name?: string, phone?: string, address?: string) => {
  if (!contactRequested) return true;
  return Boolean(sanitizeValue(name) && sanitizeValue(phone) && sanitizeValue(address));
};

export const applySurveyFilters = (responses: SurveyResponse[], filters: SurveyFilters) => {
  return responses.filter((response) => {
    if (filters.station && response.station?.trim() !== filters.station.trim()) return false;
    if (filters.aufnahmeart && !response.aufnahmeart.includes(filters.aufnahmeart as AdmissionOption)) return false;
    if (filters.dateFrom && new Date(response.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(response.createdAt) > new Date(filters.dateTo)) return false;
    return true;
  });
};

export const calculateAverageForQuestion = (responses: SurveyResponse[], questionId: `q${number}`) => {
  const scores = responses
    .map((response) => response.answers[questionId])
    .map((option) => (option ? likertScoreMap[option] : null))
    .filter((value): value is number => value !== null && Number.isFinite(value));
  if (!scores.length) return null;
  const total = scores.reduce((sum, value) => sum + value, 0);
  return Number((total / scores.length).toFixed(2));
};

export const calculateDistributionForQuestion = (responses: SurveyResponse[], questionId: `q${number}`) => {
  const distribution: Record<string, number> = {};
  responses.forEach((response) => {
    const option = response.answers[questionId];
    if (!option) return;
    distribution[option] = (distribution[option] || 0) + 1;
  });
  return distribution;
};

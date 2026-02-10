const LIKERT_LABEL_TO_SCORE: Record<string, number> = {
  'Sehr gut / sehr zufrieden': 1,
  'gut / eher zufrieden': 2,
  'Ausreichend / weniger zufrieden': 3,
  'Mangelhaft / unzufrieden': 4,
  'trifft nicht zu / keine Angabe': 5,
};

export function likertLabelToScore(label: string): number {
  return LIKERT_LABEL_TO_SCORE[label] ?? 5;
}

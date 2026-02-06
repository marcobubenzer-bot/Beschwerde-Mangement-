import { describe, expect, it } from 'vitest';
import { likertScoreMap, isContactInfoValid } from './surveyUtils';

describe('surveyUtils', () => {
  it('maps likert options to scores', () => {
    expect(likertScoreMap['Sehr gut / sehr zufrieden']).toBe(4);
    expect(likertScoreMap['trifft nicht zu / keine Angabe']).toBeNull();
  });

  it('validates contact info only when required', () => {
    expect(isContactInfoValid(false)).toBe(true);
    expect(isContactInfoValid(true, 'Max Mustermann', '123', 'Adresse')).toBe(true);
    expect(isContactInfoValid(true, '', '123', 'Adresse')).toBe(false);
  });
});

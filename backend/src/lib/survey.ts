import { LikertOption } from '@prisma/client';

const aufnahmeartMap: Record<string, string> = {
  planned: 'GEPLANT',
  emergency: 'NOTFALL',
  transfer: 'VERLEGUNG',
  ambulant: 'AMBULANT',
};

export const mapAufnahmeart = (values: string[] = []): string[] => {
  const mapped = values.map((value) => {
    const key = value.trim().toLowerCase();
    return aufnahmeartMap[key] ?? value.trim().toUpperCase();
  });

  return [...new Set(mapped)];
};

export const scoreToOption = (score: number): LikertOption => {
  switch (score) {
    case 5:
      return LikertOption.SEHR_GUT;
    case 4:
      return LikertOption.GUT;
    case 3:
      return LikertOption.MITTEL;
    case 2:
      return LikertOption.SCHLECHT;
    case 1:
      return LikertOption.SEHR_SCHLECHT;
    default:
      throw new Error(`Unsupported score ${score}`);
  }
};

export const parseQuestionNo = (key: string): number | null => {
  const match = /^q(\d+)$/i.exec(key.trim());
  if (!match) {
    return null;
  }

  return Number(match[1]);
};

export type LikertOption =
  | 'Sehr gut / sehr zufrieden'
  | 'gut / eher zufrieden'
  | 'Ausreichend / weniger zufrieden'
  | 'Mangelhaft / unzufrieden'
  | 'trifft nicht zu / keine Angabe';

export type YesNoOption = 'Ja' | 'Nein' | 'keine Angabe';

export type AdmissionOption =
  | 'geplante Aufnahme / Einweisung'
  | 'Verlegung aus anderem Krankenhaus'
  | 'Notfall'
  | 'Kooperationspartner eines Zentrums';

export type ComplaintCategory = 'LOB' | 'ANREGUNG' | 'BESCHWERDE' | 'UNKLAR';
export type ComplaintStatus = 'OFFEN' | 'IN_BEARBEITUNG' | 'ERLEDIGT';

export interface SurveyResponse {
  id: string;
  createdAt: string;
  station?: string;
  zimmer?: string;
  aufnahmeart: AdmissionOption[];
  answers: Partial<Record<`q${number}`, LikertOption>>;
  q31?: YesNoOption;
  q32?: YesNoOption;
  q33?: number | null;
  freitext?: string;
  contactRequested: boolean;
  contactName?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
}

export interface SurveyComplaint {
  id: string;
  surveyResponseId: string;
  createdAt: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  assignedTo?: string | null;
  notes?: string | null;
}

export interface SurveyFilters {
  dateFrom?: string;
  dateTo?: string;
  station?: string;
  aufnahmeart?: AdmissionOption;
}

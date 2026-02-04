export type ReporterType = 'Patient' | 'Angehörige' | 'Mitarbeitende' | 'Sonstige';
export type ComplaintCategory =
  | 'Pflege'
  | 'Ärztlich'
  | 'Wartezeit'
  | 'Organisation'
  | 'Abrechnung'
  | 'Hygiene'
  | 'Kommunikation'
  | 'Sonstiges';
export type ComplaintPriority = 'Niedrig' | 'Mittel' | 'Hoch' | 'Kritisch';
export type ComplaintChannel = 'Telefon' | 'E-Mail' | 'Brief' | 'Persönlich' | 'Online';
export type ComplaintOrigin = 'report' | 'admin';
export type ComplaintStatus =
  | 'Neu'
  | 'In Prüfung'
  | 'Rückfrage'
  | 'In Bearbeitung'
  | 'Gelöst'
  | 'Abgelehnt';

export interface ComplaintNote {
  id: string;
  createdAt: string;
  author?: string;
  text: string;
}

export interface ComplaintAttachment {
  id: string;
  complaintId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
  blob: Blob;
}

export interface Complaint {
  id: string;
  caseNumber: string;
  createdAt: string;
  reporterType: ReporterType;
  reporterName?: string;
  contact?: string;
  location: string;
  department: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  channel: ComplaintChannel;
  origin?: ComplaintOrigin;
  description: string;
  involvedPeople?: string;
  consent: boolean;
  status: ComplaintStatus;
  owner?: string;
  dueDate?: string;
  measures?: string;
  tags: string[];
  attachmentIds: string[];
  notes: ComplaintNote[];
}

export interface ComplaintFilters {
  query: string;
  status: ComplaintStatus | 'Alle';
  category: ComplaintCategory | 'Alle';
  priority: ComplaintPriority | 'Alle';
  location: string;
  department: string;
  dateFrom?: string;
  dateTo?: string;
}

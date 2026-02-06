import { utils, writeFile } from 'xlsx';
import { surveyQuestions } from '../data/surveyQuestions';
import { SurveyComplaint, SurveyResponse } from '../types/survey';

const formatDate = (value: string) => new Date(value).toLocaleString('de-DE');

export const buildResponsesCsv = (responses: SurveyResponse[]) => {
  const headers = [
    'id',
    'createdAt',
    'station',
    'zimmer',
    'aufnahmeart',
    ...surveyQuestions.map((q) => q.id),
    'q31',
    'q32',
    'q33',
    'freitext',
    'contactRequested',
    'contactName',
    'contactPhone',
    'contactAddress',
  ];

  const rows = responses.map((response) => [
    response.id,
    formatDate(response.createdAt),
    response.station || '',
    response.zimmer || '',
    response.aufnahmeart.join('; '),
    ...surveyQuestions.map((q) => response.answers[q.id] || ''),
    response.q31 || '',
    response.q32 || '',
    response.q33 ?? '',
    response.freitext || '',
    response.contactRequested ? 'Ja' : 'Nein',
    response.contactName || '',
    response.contactPhone || '',
    response.contactAddress || '',
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
};

export const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportResponsesXlsx = (
  responses: SurveyResponse[],
  aggregates: Array<[string, number | null]>,
  complaints: SurveyComplaint[]
) => {
  const responseRows = responses.map((response) => ({
    id: response.id,
    createdAt: formatDate(response.createdAt),
    station: response.station || '',
    zimmer: response.zimmer || '',
    aufnahmeart: response.aufnahmeart.join('; '),
    ...surveyQuestions.reduce<Record<string, string>>((acc, q) => {
      acc[q.id] = response.answers[q.id] || '';
      return acc;
    }, {}),
    q31: response.q31 || '',
    q32: response.q32 || '',
    q33: response.q33 ?? '',
    freitext: response.freitext || '',
    contactRequested: response.contactRequested ? 'Ja' : 'Nein',
    contactName: response.contactName || '',
    contactPhone: response.contactPhone || '',
    contactAddress: response.contactAddress || '',
  }));

  const aggregateRows = aggregates.map(([question, avg]) => ({
    question,
    average: avg ?? '',
  }));

  const complaintRows = complaints.map((complaint) => ({
    id: complaint.id,
    surveyResponseId: complaint.surveyResponseId,
    createdAt: formatDate(complaint.createdAt),
    category: complaint.category,
    status: complaint.status,
    assignedTo: complaint.assignedTo || '',
    notes: complaint.notes || '',
  }));

  const wb = utils.book_new();
  const responsesSheet = utils.json_to_sheet(responseRows);
  const aggregateSheet = utils.json_to_sheet(aggregateRows);
  const complaintsSheet = utils.json_to_sheet(complaintRows);

  utils.book_append_sheet(wb, responsesSheet, 'Responses');
  utils.book_append_sheet(wb, aggregateSheet, 'Aggregates');
  utils.book_append_sheet(wb, complaintsSheet, 'Complaints');

  writeFile(wb, 'patientenbefragung_responses.xlsx');
};

export const exportComplaintsXlsx = (complaints: SurveyComplaint[]) => {
  const rows = complaints.map((complaint) => ({
    id: complaint.id,
    surveyResponseId: complaint.surveyResponseId,
    createdAt: formatDate(complaint.createdAt),
    category: complaint.category,
    status: complaint.status,
    assignedTo: complaint.assignedTo || '',
    notes: complaint.notes || '',
  }));

  const wb = utils.book_new();
  const sheet = utils.json_to_sheet(rows);
  utils.book_append_sheet(wb, sheet, 'Complaints');
  writeFile(wb, 'patientenbefragung_complaints.xlsx');
};

export const buildComplaintsCsv = (complaints: SurveyComplaint[]) => {
  const headers = ['id', 'surveyResponseId', 'createdAt', 'category', 'status', 'assignedTo', 'notes'];
  const rows = complaints.map((complaint) => [
    complaint.id,
    complaint.surveyResponseId,
    formatDate(complaint.createdAt),
    complaint.category,
    complaint.status,
    complaint.assignedTo || '',
    complaint.notes || '',
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
};

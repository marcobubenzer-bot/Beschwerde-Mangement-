import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Complaint } from '../types/complaint';
import { formatDate, formatDateTime } from './date';

export const exportComplaintPdf = (complaint: Complaint) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('KlinikBeschwerde – Fallblatt', 14, 20);
  doc.setFontSize(11);
  doc.text(`Vorgangsnummer: ${complaint.caseNumber}`, 14, 30);
  doc.text(`Erstellt am: ${formatDateTime(complaint.createdAt)}`, 14, 36);

  autoTable(doc, {
    startY: 42,
    head: [['Feld', 'Wert']],
    body: [
      ['Status', complaint.status],
      ['Priorität', complaint.priority],
      ['Kategorie', complaint.category],
      ['Kanal', complaint.channel],
      ['Melder-Typ', complaint.reporterType],
      ['Melder-Name', complaint.reporterName || '—'],
      ['Kontakt', complaint.contact || '—'],
      ['Standort', complaint.location],
      ['Abteilung/Station', complaint.department],
      ['Beteiligte Personen', complaint.involvedPeople || '—'],
      ['Verantwortlich', complaint.owner || '—'],
      ['Frist', complaint.dueDate ? formatDate(complaint.dueDate) : '—'],
      ['Schlagwörter', complaint.tags.length ? complaint.tags.join(', ') : '—'],
    ],
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120;
  doc.text('Beschreibung', 14, finalY + 10);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(complaint.description, 180), 14, finalY + 16);

  if (complaint.measures) {
    doc.setFontSize(11);
    doc.text('Maßnahmen / Notizen', 14, finalY + 40);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(complaint.measures, 180), 14, finalY + 46);
  }

  doc.save(`${complaint.caseNumber}_fallblatt.pdf`);
};

export const exportDashboardPdf = ({
  title,
  filters,
  kpis,
  tables,
}: {
  title: string;
  filters: string[];
  kpis: Array<{ label: string; value: number }>;
  tables: Array<{ title: string; head: string[]; body: Array<(string | number)[]> }>;
}) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(11);
  doc.text(`Erstellt am: ${formatDateTime(new Date().toISOString())}`, 14, 28);
  doc.text(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [['Kennzahl', 'Wert']],
    body: kpis.map((kpi) => [kpi.label, String(kpi.value)]),
  });

  let currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 60;

  tables.forEach((table) => {
    currentY += 12;
    doc.setFontSize(12);
    doc.text(table.title, 14, currentY);
    autoTable(doc, {
      startY: currentY + 4,
      head: [table.head],
      body: table.body,
    });
    currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || currentY + 40;
  });

  doc.save('KlinikBeschwerde_Dashboard.pdf');
};

export const exportListPdf = ({
  title,
  filters,
  complaints,
}: {
  title: string;
  filters: string[];
  complaints: Complaint[];
}) => {
  const doc = new jsPDF('landscape');
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFontSize(11);
  doc.text(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [['Vorgang', 'Status', 'Kategorie', 'Priorität', 'Standort', 'Abteilung', 'Datum']],
    body: complaints.map((complaint) => [
      complaint.caseNumber,
      complaint.status,
      complaint.category,
      complaint.priority,
      complaint.location,
      complaint.department,
      formatDate(complaint.createdAt),
    ]),
  });

  doc.save('KlinikBeschwerde_Vorgaenge.pdf');
};

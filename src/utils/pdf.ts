import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Complaint, ComplaintAttachment } from '../types/complaint';
import { formatDate, formatDateTime } from './date';

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const exportComplaintPdf = async (complaint: Complaint, attachments: ComplaintAttachment[]) => {
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

  const baseY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120;
  doc.text('Beschreibung', 14, baseY + 10);
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(complaint.description, 180), 14, baseY + 16);

  let currentY = baseY + 36;
  if (complaint.measures) {
    doc.setFontSize(11);
    doc.text('Maßnahmen / Notizen', 14, currentY);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(complaint.measures, 180), 14, currentY + 6);
    currentY += 26;
  }

  autoTable(doc, {
    startY: currentY + 6,
    head: [['Anlage', 'Typ', 'Größe (KB)']],
    body: attachments.length
      ? attachments.map((item) => [item.filename, item.mimeType, String(Math.round(item.size / 1024))])
      : [['Keine Anlagen', '—', '—']],
  });

  const imageAttachments = attachments.filter((item) => item.mimeType.startsWith('image/')).slice(0, 2);
  if (imageAttachments.length) {
    let imageY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || currentY + 40;
    doc.setFontSize(11);
    doc.text('Bildvorschau (MVP)', 14, imageY + 10);
    imageY += 16;
    for (const attachment of imageAttachments) {
      try {
        const dataUrl = await blobToDataUrl(attachment.blob);
        const format = attachment.mimeType.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(dataUrl, format, 14, imageY, 60, 40);
        doc.text(attachment.filename, 78, imageY + 6);
        imageY += 46;
      } catch {
        doc.text(`Bild ${attachment.filename} konnte nicht eingebettet werden.`, 14, imageY + 6);
        imageY += 12;
      }
    }
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

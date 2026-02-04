import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Complaint, ComplaintAttachment } from '../types/complaint';
import { getBranding } from '../storage/brandingRepository';
import { formatDate, formatDateTime } from './date';

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const addBrandingHeader = (doc: jsPDF, title: string) => {
  const branding = getBranding();
  let currentY = 20;
  if (branding.showBranding && branding.organizationName) {
    doc.setFontSize(12);
    doc.text(branding.organizationName, 14, 14);
    currentY = 24;
  }
  doc.setFontSize(18);
  doc.text(title, 14, currentY);
  return currentY;
};

export const exportComplaintPdf = async (complaint: Complaint, attachments: ComplaintAttachment[]) => {
  const doc = new jsPDF();
  const titleY = addBrandingHeader(doc, 'KlinikBeschwerde – Fallblatt');
  doc.setFontSize(11);
  doc.text(`Vorgangsnummer: ${complaint.caseNumber}`, 14, titleY + 10);
  doc.text(`Erstellt am: ${formatDateTime(complaint.createdAt)}`, 14, titleY + 16);

  autoTable(doc, {
    startY: titleY + 22,
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
  const titleY = addBrandingHeader(doc, title);
  doc.setFontSize(11);
  doc.text(`Erstellt am: ${formatDateTime(new Date().toISOString())}`, 14, titleY + 8);
  doc.text(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, 14, titleY + 14);

  autoTable(doc, {
    startY: titleY + 20,
    head: [['Kennzahl', 'Wert']],
    body: kpis.map((kpi) => [kpi.label, String(kpi.value)]),
  });

  let currentY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || titleY + 40;

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

const addListTable = (doc: jsPDF, complaints: Complaint[]) => {
  autoTable(doc, {
    startY: 32,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 26 },
      4: { cellWidth: 30 },
      5: { cellWidth: 50 },
    },
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
  const titleY = addBrandingHeader(doc, title);
  doc.setFontSize(11);
  doc.text(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, 14, titleY + 8);
  addListTable(doc, complaints);

  doc.save('KlinikBeschwerde_Vorgaenge.pdf');
};

export const exportDashboardWithListPdf = ({
  title,
  filters,
  kpis,
  dashboardCharts,
  detailTables,
  complaints,
  options,
}: {
  title: string;
  filters: string[];
  kpis: Array<{ label: string; value: number | string }>;
  dashboardCharts: Array<{ title: string; dataUrl?: string }>;
  detailTables: Array<{ title: string; head: string[]; body: Array<(string | number)[]> }>;
  complaints: Complaint[];
  options?: { includeDashboard?: boolean; includeList?: boolean; includeDetails?: boolean };
}) => {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const includeDashboard = options?.includeDashboard ?? true;
  const includeList = options?.includeList ?? true;
  const includeDetails = options?.includeDetails ?? false;

  const renderDashboardPage = (pageTitle: string, chartSlice: Array<{ title: string; dataUrl?: string }>) => {
    const titleY = addBrandingHeader(doc, pageTitle);
    doc.setFontSize(11);
    doc.text(`Exportiert am: ${formatDateTime(new Date().toISOString())}`, margin, titleY + 8);
    doc.text(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, margin, titleY + 14);

    const kpiY = titleY + 22;
    const kpiGap = 6;
    const kpiCount = kpis.length;
    const kpiWidth = (pageWidth - margin * 2 - kpiGap * (kpiCount - 1)) / kpiCount;
    const kpiHeight = 18;
    kpis.forEach((kpi, index) => {
      const x = margin + index * (kpiWidth + kpiGap);
      doc.setDrawColor(227, 231, 239);
      doc.setFillColor(245, 247, 252);
      doc.roundedRect(x, kpiY, kpiWidth, kpiHeight, 2, 2, 'F');
      doc.setFontSize(10);
      doc.text(kpi.label, x + 4, kpiY + 6);
      doc.setFontSize(12);
      doc.text(String(kpi.value), x + 4, kpiY + 13);
    });

    const chartY = kpiY + kpiHeight + 10;
    const chartGap = 8;
    const chartWidth = (pageWidth - margin * 2 - chartGap) / 2;
    const chartHeight = pageHeight - chartY - margin - 6;

    chartSlice.forEach((chart, index) => {
      const x = margin + index * (chartWidth + chartGap);
      doc.setFontSize(12);
      doc.text(chart.title, x, chartY);
      if (chart.dataUrl) {
        doc.addImage(chart.dataUrl, 'PNG', x, chartY + 4, chartWidth, chartHeight - 8, undefined, 'FAST');
      } else {
        doc.setFontSize(10);
        doc.text('Chart nicht verfügbar', x, chartY + 14);
      }
    });
  };

  if (includeDashboard) {
    renderDashboardPage(`${title} – Seite 1`, dashboardCharts.slice(0, 2));

    doc.addPage('landscape');
    renderDashboardPage(`${title} – Seite 2`, dashboardCharts.slice(2, 4));
  }

  if (includeList) {
    doc.addPage('landscape');
    const listTitleY = addBrandingHeader(doc, `${title} – Vorgangsliste`);
    doc.setFontSize(11);
    doc.text(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, margin, listTitleY + 8);
    addListTable(doc, complaints);
  }

  if (includeDetails) {
    doc.addPage('landscape');
    const detailsTitleY = addBrandingHeader(doc, `${title} – Detailtabellen`);
    let currentY = detailsTitleY + 10;
    detailTables.forEach((table) => {
      currentY += 8;
      doc.setFontSize(12);
      doc.text(table.title, margin, currentY);
      autoTable(doc, {
        startY: currentY + 4,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fontStyle: 'bold' },
        head: [table.head],
        body: table.body,
        margin: { left: margin, right: margin },
      });
      currentY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || currentY + 30;
      if (currentY > pageHeight - 40) {
        doc.addPage('landscape');
        currentY = margin;
      }
    });
  }

  doc.save('KlinikBeschwerde_Dashboard_und_Vorgaenge.pdf');
};

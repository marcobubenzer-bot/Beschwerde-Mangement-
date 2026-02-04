import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Complaint, ComplaintAttachment } from '../types/complaint';
import { getBranding } from '../storage/brandingRepository';
import { formatDate, formatDateTime } from './date';

const DEFAULT_MARGIN = 14;

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Header inkl. optionalem Branding + Titel.
 * Gibt die Y-Position zurück, ab der "Content" sicher starten kann.
 */
const addBrandingHeader = (doc: jsPDF, title: string, margin = DEFAULT_MARGIN) => {
  const branding = getBranding();

  // Branding oben links
  let y = 14;
  if (branding.showBranding && branding.organizationName) {
    doc.setFontSize(12);
    doc.text(branding.organizationName, margin, y);
    y += 10;
  }

  // Titel
  doc.setFontSize(18);
  doc.text(title, margin, y);

  // Content-Start
  return y;
};

// Rendert NUR die Liste (Tabelle), kein Header, damit man Seite flexibel aufbauen kann.
const addListTable = (doc: jsPDF, startY: number, complaints: Complaint[], margin = DEFAULT_MARGIN) => {
  autoTable(doc, {
    startY,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 30 }, // Vorgang
      1: { cellWidth: 28 }, // Status
      2: { cellWidth: 32 }, // Kategorie
      3: { cellWidth: 26 }, // Priorität
      4: { cellWidth: 30 }, // Standort
      5: { cellWidth: 50 }, // Abteilung
      6: { cellWidth: 22 }, // Datum
    },
    head: [['Vorgang', 'Status', 'Kategorie', 'Priorität', 'Standort', 'Abteilung', 'Datum']],
    body: complaints.map((c) => [
      c.caseNumber,
      c.status,
      c.category,
      c.priority,
      c.location,
      c.department,
      formatDate(c.createdAt),
    ]),
  });
};

const lastTableY = (doc: jsPDF, fallback: number) =>
  (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? fallback;

const safeText = (value?: string) => (value && value.trim().length ? value.trim() : '—');

export const exportComplaintPdf = async (complaint: Complaint, attachments: ComplaintAttachment[]) => {
  const doc = new jsPDF();
  const titleY = addBrandingHeader(doc, 'KlinikBeschwerde – Fallblatt');

  doc.setFontSize(11);
  doc.text(`Vorgangsnummer: ${complaint.caseNumber}`, DEFAULT_MARGIN, titleY + 10);
  doc.text(`Erstellt am: ${formatDateTime(complaint.createdAt)}`, DEFAULT_MARGIN, titleY + 16);

  autoTable(doc, {
    startY: titleY + 22,
    margin: { left: DEFAULT_MARGIN, right: DEFAULT_MARGIN },
    head: [['Feld', 'Wert']],
    body: [
      ['Status', complaint.status],
      ['Priorität', complaint.priority],
      ['Kategorie', complaint.category],
      ['Kanal', complaint.channel],
      ['Melder-Typ', complaint.reporterType],
      ['Melder-Name', safeText(complaint.reporterName)],
      ['Kontakt', safeText(complaint.contact)],
      ['Standort', complaint.location],
      ['Abteilung/Station', complaint.department],
      ['Beteiligte Personen', safeText(complaint.involvedPeople)],
      ['Verantwortlich', safeText(complaint.owner)],
      ['Frist', complaint.dueDate ? formatDate(complaint.dueDate) : '—'],
      ['Schlagwörter', complaint.tags?.length ? complaint.tags.join(', ') : '—'],
    ],
  });

  let currentY = lastTableY(doc, titleY + 120) + 10;

  // Beschreibung
  doc.setFontSize(11);
  doc.text('Beschreibung', DEFAULT_MARGIN, currentY);
  currentY += 6;

  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(complaint.description || '—', 180), DEFAULT_MARGIN, currentY);
  currentY += 18;

  // Maßnahmen / Notizen
  if (complaint.measures && complaint.measures.trim()) {
    doc.setFontSize(11);
    doc.text('Maßnahmen / Notizen', DEFAULT_MARGIN, currentY);
    currentY += 6;

    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(complaint.measures, 180), DEFAULT_MARGIN, currentY);
    currentY += 18;
  }

  // Anlagen-Tabelle
  autoTable(doc, {
    startY: currentY,
    margin: { left: DEFAULT_MARGIN, right: DEFAULT_MARGIN },
    head: [['Anlage', 'Typ', 'Größe (KB)']],
    body: attachments.length
      ? attachments.map((a) => [a.filename, a.mimeType, String(Math.round(a.size / 1024))])
      : [['Keine Anlagen', '—', '—']],
  });

  currentY = lastTableY(doc, currentY) + 8;

  // Bildvorschau (max 2)
  const imageAttachments = attachments
    .filter((a) => a.mimeType?.startsWith('image/') && a.blob)
    .slice(0, 2);

  if (imageAttachments.length) {
    doc.setFontSize(11);
    doc.text('Bildvorschau (MVP)', DEFAULT_MARGIN, currentY + 6);
    currentY += 12;

    for (const a of imageAttachments) {
      try {
        const dataUrl = await blobToDataUrl(a.blob);
        const format = a.mimeType.includes('png') ? 'PNG' : 'JPEG';

        // Falls zu wenig Platz: neue Seite
        if (currentY > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          currentY = DEFAULT_MARGIN;
        }

        doc.addImage(dataUrl, format, DEFAULT_MARGIN, currentY, 60, 40);
        doc.setFontSize(10);
        doc.text(a.filename, DEFAULT_MARGIN + 66, currentY + 6);
        currentY += 46;
      } catch {
        doc.setFontSize(10);
        doc.text(`Bild ${a.filename} konnte nicht eingebettet werden.`, DEFAULT_MARGIN, currentY + 6);
        currentY += 12;
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
  doc.text(`Erstellt am: ${formatDateTime(new Date().toISOString())}`, DEFAULT_MARGIN, titleY + 8);

  const filterText = `Filter: ${filters.length ? filters.join(', ') : 'Keine'}`;
  doc.setFontSize(10);
  doc.text(doc.splitTextToSize(filterText, 180), DEFAULT_MARGIN, titleY + 14);

  autoTable(doc, {
    startY: titleY + 22,
    margin: { left: DEFAULT_MARGIN, right: DEFAULT_MARGIN },
    head: [['Kennzahl', 'Wert']],
    body: kpis.map((kpi) => [kpi.label, String(kpi.value)]),
  });

  let currentY = lastTableY(doc, titleY + 40);

  tables.forEach((table) => {
    currentY += 12;
    doc.setFontSize(12);
    doc.text(table.title, DEFAULT_MARGIN, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      margin: { left: DEFAULT_MARGIN, right: DEFAULT_MARGIN },
      head: [table.head],
      body: table.body,
    });

    currentY = lastTableY(doc, currentY + 40);

    if (currentY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      currentY = DEFAULT_MARGIN;
    }
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
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = DEFAULT_MARGIN;

  const titleY = addBrandingHeader(doc, title, margin);

  doc.setFontSize(11);
  const filterText = `Filter: ${filters.length ? filters.join(', ') : 'Keine'}`;
  doc.text(doc.splitTextToSize(filterText, pageWidth - margin * 2), margin, titleY + 8);

  addListTable(doc, titleY + 14, complaints, margin);

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
  const margin = DEFAULT_MARGIN;

  const includeDashboard = options?.includeDashboard ?? true;
  const includeList = options?.includeList ?? true;
  const includeDetails = options?.includeDetails ?? false;

  // Proportional einpassen (contain) -> keine Verzerrung
  const addImageContain = (document: jsPDF, dataUrl: string, x: number, y: number, width: number, height: number) => {
    const props = document.getImageProperties(dataUrl);
    const scale = Math.min(width / props.width, height / props.height);
    const drawWidth = props.width * scale;
    const drawHeight = props.height * scale;
    const offsetX = x + (width - drawWidth) / 2;
    const offsetY = y + (height - drawHeight) / 2;
    document.addImage(dataUrl, 'PNG', offsetX, offsetY, drawWidth, drawHeight, undefined, 'FAST');
  };

  const renderDashboardPage = (pageTitle: string, chartSlice: Array<{ title: string; dataUrl?: string }>) => {
    const titleY = addBrandingHeader(doc, pageTitle, margin);

    doc.setFontSize(11);
    doc.text(`Exportiert am: ${formatDateTime(new Date().toISOString())}`, margin, titleY + 8);
    doc.text(doc.splitTextToSize(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, pageWidth - margin * 2), margin, titleY + 14);

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

      // Card Look
      const cardPadding = 8;
      doc.setDrawColor(227, 231, 239);
      doc.setFillColor(246, 248, 252);
      doc.roundedRect(x, chartY, chartWidth, chartHeight, 3, 3, 'FD');

      doc.setFontSize(12);
      doc.text(chart.title, x + cardPadding, chartY + 10);

      const imageX = x + cardPadding;
      const imageY = chartY + 14;
      const imageWidth = chartWidth - cardPadding * 2;
      const imageHeight = chartHeight - cardPadding * 2 - 6;

      if (chart.dataUrl) {
        addImageContain(doc, chart.dataUrl, imageX, imageY, imageWidth, imageHeight);
      } else {
        doc.setFontSize(10);
        doc.text('Chart nicht verfügbar', imageX, imageY + 12);
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
    const listTitleY = addBrandingHeader(doc, `${title} – Vorgangsliste`, margin);

    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(`Filter: ${filters.length ? filters.join(', ') : 'Keine'}`, pageWidth - margin * 2), margin, listTitleY + 8);

    addListTable(doc, listTitleY + 14, complaints, margin);
  }

  if (includeDetails) {
    doc.addPage('landscape');
    const detailsTitleY = addBrandingHeader(doc, `${title} – Detailtabellen`, margin);
    let currentY = detailsTitleY + 10;

    detailTables.forEach((table) => {
      currentY += 8;

      // Seitenumbruch, wenn Überschrift+Tabelle nicht mehr passt (grob)
      if (currentY > pageHeight - 40) {
        doc.addPage('landscape');
        currentY = margin;
      }

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

      currentY = lastTableY(doc, currentY + 30);

      if (currentY > pageHeight - 40) {
        doc.addPage('landscape');
        currentY = margin;
      }
    });
  }

  doc.save('KlinikBeschwerde_Dashboard_und_Vorgaenge.pdf');
};

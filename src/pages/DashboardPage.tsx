import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import FiltersPanel from '../components/FiltersPanel';
import KpiCard from '../components/KpiCard';
import { complaintRepository } from '../storage/indexedDbComplaintRepository';
import { loadSettings } from '../storage/settingsRepository';
import { Complaint, ComplaintFilters } from '../types/complaint';
import { applyFilters } from '../utils/filters';
import { countBy, groupByMonth, topDepartments } from '../utils/stats';
import { exportDashboardWithListPdf } from '../utils/pdf';

const initialFilters: ComplaintFilters = {
  query: '',
  status: 'Alle',
  category: 'Alle',
  priority: 'Alle',
  location: 'Alle',
  department: 'Alle',
};

const DashboardPage = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters);
  const settings = useMemo(() => loadSettings(), []);
  const [exporting, setExporting] = useState(false);

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeDashboard: true,
    includeList: true,
    includeDetails: false,
  });

  const monthlyChartRef = useRef<HTMLDivElement | null>(null);
  const categoryChartRef = useRef<HTMLDivElement | null>(null);
  const statusChartRef = useRef<HTMLDivElement | null>(null);
  const departmentChartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    complaintRepository.list().then(setComplaints);
  }, []);

  const filtered = useMemo(() => applyFilters(complaints, filters), [complaints, filters]);

  const kpis = useMemo(() => {
    const byStatus = countBy(filtered, 'status');
    return [
      { label: 'Gesamt', value: filtered.length },
      { label: 'Neu', value: byStatus['Neu'] || 0 },
      { label: 'In Bearbeitung', value: byStatus['In Bearbeitung'] || 0 },
      { label: 'Gelöst', value: byStatus['Gelöst'] || 0 },
      { label: 'Kritisch', value: countBy(filtered, 'priority')['Kritisch'] || 0 },
    ];
  }, [filtered]);

  const monthly = useMemo(() => {
    const grouped = groupByMonth(filtered);
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const counts = countBy(filtered, 'category');
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const statusData = useMemo(() => {
    const counts = countBy(filtered, 'status');
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const topDepartmentsData = useMemo(() => topDepartments(filtered), [filtered]);

  const channelData = useMemo(() => {
    const counts = countBy(filtered, 'channel');
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const reporterTypeData = useMemo(() => {
    const counts = filtered.reduce<Record<string, number>>((acc, complaint) => {
      const label =
        complaint.origin === 'admin'
          ? 'Verwaltung'
          : complaint.reporterType === 'Mitarbeitende'
            ? 'Mitarbeit'
            : complaint.reporterType === 'Sonstige'
              ? 'Sonstige'
              : 'Partien';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const topCategories = useMemo(() => {
    const counts = countBy(filtered, 'category');
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const locationData = useMemo(() => {
    const counts = countBy(filtered, 'location');
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const processingStats = useMemo(() => {
    const durations = filtered
      .filter((item) => item.status === 'Gelöst' || item.status === 'Abgelehnt')
      .map((item) => {
        if (!item.dueDate) return null;
        const created = new Date(item.createdAt).getTime();
        const due = new Date(item.dueDate).getTime();
        const diffDays = Math.round((due - created) / (1000 * 60 * 60 * 24));
        return Number.isFinite(diffDays) && diffDays > 0 ? diffDays : null;
      })
      .filter((value): value is number => value !== null);

    if (!durations.length) return { average: 'Nicht verfügbar', median: 'Nicht verfügbar' };

    const avg = Math.round(durations.reduce((sum, item) => sum + item, 0) / durations.length);
    const sorted = [...durations].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    return { average: `${avg} Tage`, median: `${median} Tage` };
  }, [filtered]);

  const activeFilters = useMemo(() => {
    const labels: string[] = [];
    if (filters.status !== 'Alle') labels.push(`Status: ${filters.status}`);
    if (filters.category !== 'Alle') labels.push(`Kategorie: ${filters.category}`);
    if (filters.priority !== 'Alle') labels.push(`Priorität: ${filters.priority}`);
    if (filters.location) labels.push(`Standort: ${filters.location}`);
    if (filters.department) labels.push(`Abteilung: ${filters.department}`);
    if (filters.dateFrom) labels.push(`Von: ${filters.dateFrom}`);
    if (filters.dateTo) labels.push(`Bis: ${filters.dateTo}`);
    if (filters.query) labels.push(`Suche: ${filters.query}`);
    return labels;
  }, [filters]);

  const getChartImage = async (ref: RefObject<HTMLDivElement>) => {
    const container = ref.current;
    if (!container) return undefined;

    const svg = container.querySelector('svg');
    if (!svg) return undefined;

    const serializer = new XMLSerializer();
    const svgMarkup = serializer.serializeToString(svg);
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

    const image = new Image();
    image.src = encoded;
    await image.decode();

    const bounds = svg.getBoundingClientRect();

    // Export in höherer Auflösung (scharf im PDF)
    const scale = 4;
    const width = Math.max(bounds.width, 320);
    const height = Math.max(bounds.height, 220);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/png');
  };

  const handlePdfExport = async () => {
    setExporting(true);

    try {
      const chartImages = await Promise.all([
        getChartImage(monthlyChartRef),
        getChartImage(categoryChartRef),
        getChartImage(statusChartRef),
        getChartImage(departmentChartRef),
      ]);

      exportDashboardWithListPdf({
        title: 'KlinikBeschwerde – Dashboard',
        filters: activeFilters,
        kpis: [
          ...kpis.map((item) => ({ label: item.label, value: Number(item.value) })),
          { label: 'Ø Bearbeitungszeit', value: processingStats.average },
        ],
        dashboardCharts: [
          { title: 'Beschwerden pro Monat', dataUrl: chartImages[0] },
          { title: 'Kategorien-Verteilung', dataUrl: chartImages[1] },
          { title: 'Status-Verteilung', dataUrl: chartImages[2] },
          { title: 'Top-Abteilungen', dataUrl: chartImages[3] },
        ],
        detailTables: [
          { title: 'Aufteilung nach Kanal', head: ['Kanal', 'Anzahl'], body: channelData.map((i) => [i.name, i.total]) },
          {
            title: 'Aufteilung nach Melde-Typ',
            head: ['Typ', 'Anzahl'],
            body: reporterTypeData.map((i) => [i.name, i.total]),
          },
          { title: 'Status-Verteilung', head: ['Status', 'Anzahl'], body: statusData.map((i) => [i.name, i.total]) },
          { title: 'Top Kategorien', head: ['Kategorie', 'Anzahl'], body: topCategories.map((i) => [i.name, i.total]) },
          { title: 'Beschwerden pro Monat', head: ['Monat', 'Anzahl'], body: monthly.map((i) => [i.name, i.total]) },
          { title: 'Standorte', head: ['Standort', 'Anzahl'], body: locationData.map((i) => [i.name, i.total]) },
          {
            title: 'Top-Abteilungen',
            head: ['Abteilung', 'Anzahl'],
            body: topDepartmentsData.map((i) => [i.name, i.total]),
          },
          { title: 'Bearbeitungszeit', head: ['Durchschnitt', 'Median'], body: [[processingStats.average, processingStats.median]] },
        ],
        complaints: filtered,
        options: {
          includeDashboard: exportOptions.includeDashboard,
          includeList: exportOptions.includeList,
          includeDetails: exportOptions.includeDetails,
        },
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Überblick über Beschwerden, Trends und Schwerpunkte.</p>
        </div>
        <div className="header-actions">
          <button className="button primary" onClick={() => setShowExportDialog(true)} disabled={exporting}>
            {exporting ? 'PDF wird erstellt...' : 'Dashboard als PDF'}
          </button>
        </div>
      </header>

      <FiltersPanel filters={filters} settings={settings} onChange={setFilters} />

      {showExportDialog && (
        <div className="modal-backdrop" role="presentation">
          <div className="card modal" role="dialog" aria-modal="true" aria-labelledby="pdf-export-title">
            <h3 id="pdf-export-title">PDF-Export</h3>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={exportOptions.includeDashboard}
                onChange={(event) => setExportOptions((prev) => ({ ...prev, includeDashboard: event.target.checked }))}
              />
              Dashboard (Seite 1–2)
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={exportOptions.includeList}
                onChange={(event) => setExportOptions((prev) => ({ ...prev, includeList: event.target.checked }))}
              />
              Vorgangsliste (Seite 3)
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={exportOptions.includeDetails}
                onChange={(event) => setExportOptions((prev) => ({ ...prev, includeDetails: event.target.checked }))}
              />
              Detailtabellen (Seite 4+)
            </label>

            <div className="form-actions">
              <button type="button" className="button ghost" onClick={() => setShowExportDialog(false)}>
                Abbrechen
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => {
                  setShowExportDialog(false);
                  void handlePdfExport();
                }}
              >
                Export starten
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} highlight={kpi.label === 'Kritisch'} />
        ))}
      </div>

      <div className="grid-2">
        <div className="card chart-card" ref={monthlyChartRef}>
          <h3>Beschwerden pro Monat</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#6A6AF4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card" ref={categoryChartRef}>
          <h3>Kategorien-Verteilung</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={categoryData} dataKey="total" nameKey="name" outerRadius={90} fill="#79C6F9" />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        <div className="card chart-card" ref={statusChartRef}>
          <h3>Status-Verteilung</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="total" nameKey="name" outerRadius={90} fill="#F4B400" />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card" ref={departmentChartRef}>
          <h3>Top-Abteilungen</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topDepartmentsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#34C38F" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;

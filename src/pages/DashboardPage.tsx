import { useEffect, useMemo, useState } from 'react';
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
import { exportDashboardPdf } from '../utils/pdf';

const initialFilters: ComplaintFilters = {
  query: '',
  status: 'Alle',
  category: 'Alle',
  priority: 'Alle',
  location: '',
  department: '',
};

const DashboardPage = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters);
  const settings = useMemo(() => loadSettings(), []);

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

  const activeFilters = useMemo(() => {
    const filterLabels: string[] = [];
    if (filters.status !== 'Alle') filterLabels.push(`Status: ${filters.status}`);
    if (filters.category !== 'Alle') filterLabels.push(`Kategorie: ${filters.category}`);
    if (filters.priority !== 'Alle') filterLabels.push(`Priorität: ${filters.priority}`);
    if (filters.location) filterLabels.push(`Standort: ${filters.location}`);
    if (filters.department) filterLabels.push(`Abteilung: ${filters.department}`);
    if (filters.dateFrom) filterLabels.push(`Von: ${filters.dateFrom}`);
    if (filters.dateTo) filterLabels.push(`Bis: ${filters.dateTo}`);
    if (filters.query) filterLabels.push(`Suche: ${filters.query}`);
    return filterLabels;
  }, [filters]);

  const handlePdfExport = () => {
    exportDashboardPdf({
      title: 'KlinikBeschwerde – Dashboard',
      filters: activeFilters,
      kpis: kpis.map((item) => ({ label: item.label, value: Number(item.value) })),
      tables: [
        {
          title: 'Beschwerden pro Monat',
          head: ['Monat', 'Anzahl'],
          body: monthly.map((item) => [item.name, item.total]),
        },
        {
          title: 'Kategorien',
          head: ['Kategorie', 'Anzahl'],
          body: categoryData.map((item) => [item.name, item.total]),
        },
        {
          title: 'Top-Abteilungen',
          head: ['Abteilung', 'Anzahl'],
          body: topDepartmentsData.map((item) => [item.name, item.total]),
        },
      ],
    });
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Überblick über Beschwerden, Trends und Schwerpunkte.</p>
        </div>
        <div className="header-actions">
          <button className="button primary" onClick={handlePdfExport}>
            Dashboard als PDF
          </button>
        </div>
      </header>

      <FiltersPanel filters={filters} categories={settings.categories} onChange={setFilters} />

      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} highlight={kpi.label === 'Kritisch'} />
        ))}
      </div>

      <div className="grid-2">
        <div className="card chart-card">
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
        <div className="card chart-card">
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
        <div className="card chart-card">
          <h3>Status-Verteilung</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="total" nameKey="name" outerRadius={90} fill="#F4B400" />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
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

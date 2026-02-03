import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ComplaintTable from '../components/ComplaintTable';
import FiltersPanel from '../components/FiltersPanel';
import { complaintRepository } from '../storage/indexedDbComplaintRepository';
import { loadSettings } from '../storage/settingsRepository';
import { Complaint, ComplaintFilters } from '../types/complaint';
import { applyFilters } from '../utils/filters';
import { exportListPdf } from '../utils/pdf';

const initialFilters: ComplaintFilters = {
  query: '',
  status: 'Alle',
  category: 'Alle',
  priority: 'Alle',
  location: '',
  department: '',
};

const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters);
  const settings = useMemo(() => loadSettings(), []);

  const loadData = async () => {
    const data = await complaintRepository.list();
    setComplaints(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => applyFilters(complaints, filters), [complaints, filters]);

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

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Vorgänge</h2>
          <p>Filtern, priorisieren und Details ansehen.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="button ghost"
            onClick={() =>
              exportListPdf({ title: 'KlinikBeschwerde – Vorgangsliste', filters: activeFilters, complaints: filtered })
            }
          >
            Liste als PDF
          </button>
        </div>
      </header>

      <FiltersPanel filters={filters} categories={settings.categories} onChange={setFilters} />

      <ComplaintTable complaints={filtered} onSelect={(complaint) => navigate(`/admin/complaints/${complaint.id}`)} />
    </section>
  );
};

export default ComplaintsPage;

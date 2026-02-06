import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { surveyRepository } from '../storage/surveyRepository';
import { SurveyComplaint } from '../types/survey';
import { buildComplaintsCsv, downloadCsv, exportComplaintsXlsx } from '../utils/exporters';

const categories: SurveyComplaint['category'][] = ['LOB', 'ANREGUNG', 'BESCHWERDE', 'UNKLAR'];
const statuses: SurveyComplaint['status'][] = ['OFFEN', 'IN_BEARBEITUNG', 'ERLEDIGT'];

const SurveyComplaintsPage = () => {
  const [complaints, setComplaints] = useState<SurveyComplaint[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    surveyRepository.listComplaints().then(setComplaints);
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      if (categoryFilter && item.category !== categoryFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [complaints, categoryFilter, statusFilter]);

  const handleUpdate = async (complaint: SurveyComplaint, updates: Partial<SurveyComplaint>) => {
    const updated = { ...complaint, ...updates };
    await surveyRepository.updateComplaint(updated);
    setComplaints((prev) => prev.map((item) => (item.id === complaint.id ? updated : item)));
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Beschwerden & Lob</h2>
          <p>Freitexte mit Status- und Kategoriepflege.</p>
        </div>
        <div className="header-actions">
          <button className="button ghost" onClick={() => downloadCsv('patientenbefragung_complaints.csv', buildComplaintsCsv(filtered))}>
            CSV Export
          </button>
          <button className="button primary" onClick={() => exportComplaintsXlsx(filtered)}>
            XLSX Export
          </button>
        </div>
      </header>

      <div className="card">
        <h3>Filter</h3>
        <div className="form-grid">
          <label className="field">
            <span>Kategorie</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">Alle</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Alle</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Response-ID</th>
              <th>Kategorie</th>
              <th>Status</th>
              <th>Zuständig</th>
              <th>Notizen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((complaint) => (
              <tr key={complaint.id}>
                <td>{new Date(complaint.createdAt).toLocaleDateString('de-DE')}</td>
                <td>
                  <Link className="link" to={`/admin/responses/${complaint.surveyResponseId}`}>
                    {complaint.surveyResponseId}
                  </Link>
                </td>
                <td>
                  <select
                    value={complaint.category}
                    onChange={(event) => handleUpdate(complaint, { category: event.target.value as SurveyComplaint['category'] })}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={complaint.status}
                    onChange={(event) => handleUpdate(complaint, { status: event.target.value as SurveyComplaint['status'] })}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={complaint.assignedTo || ''}
                    onChange={(event) => handleUpdate(complaint, { assignedTo: event.target.value })}
                    placeholder="Name"
                  />
                </td>
                <td>
                  <input
                    value={complaint.notes || ''}
                    onChange={(event) => handleUpdate(complaint, { notes: event.target.value })}
                    placeholder="Notiz"
                  />
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="empty-state">
                  Keine Beschwerden/Lob gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SurveyComplaintsPage;

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { admissionOptions, surveyQuestions } from '../data/surveyQuestions';
import { surveyRepository } from '../storage/surveyRepository';
import { SurveyComplaint, SurveyFilters, SurveyResponse } from '../types/survey';
import { buildResponsesCsv, downloadCsv, exportResponsesXlsx } from '../utils/exporters';
import { applySurveyFilters, calculateAverageForQuestion } from '../utils/surveyUtils';

const SurveyResponsesPage = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [complaints, setComplaints] = useState<SurveyComplaint[]>([]);
  const [filters, setFilters] = useState<SurveyFilters>({});

  useEffect(() => {
    surveyRepository.listResponses().then(setResponses);
    surveyRepository.listComplaints().then(setComplaints);
  }, []);

  const filtered = useMemo(() => applySurveyFilters(responses, filters), [responses, filters]);
  const filteredComplaintIds = useMemo(() => new Set(filtered.map((response) => response.id)), [filtered]);
  const filteredComplaints = useMemo(
    () => complaints.filter((complaint) => filteredComplaintIds.has(complaint.surveyResponseId)),
    [complaints, filteredComplaintIds]
  );

  const aggregates = useMemo(() => {
    return surveyQuestions.map((question) => [question.id, calculateAverageForQuestion(filtered, question.id)] as const);
  }, [filtered]);

  const handleCsvExport = () => {
    downloadCsv('patientenbefragung_responses.csv', buildResponsesCsv(filtered));
  };

  const handleXlsxExport = () => {
    exportResponsesXlsx(filtered, aggregates, filteredComplaints);
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Einreichungen</h2>
          <p>Alle Antworten der Patientenbefragung.</p>
        </div>
        <div className="header-actions">
          <button className="button ghost" onClick={handleCsvExport}>
            CSV Export
          </button>
          <button className="button primary" onClick={handleXlsxExport}>
            XLSX Export
          </button>
        </div>
      </header>

      <div className="card">
        <h3>Filter</h3>
        <div className="form-grid">
          <label className="field">
            <span>Von</span>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value || undefined }))}
            />
          </label>
          <label className="field">
            <span>Bis</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value || undefined }))}
            />
          </label>
          <label className="field">
            <span>Station</span>
            <input
              value={filters.station || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, station: event.target.value || undefined }))}
            />
          </label>
          <label className="field">
            <span>Aufnahmeart</span>
            <select
              value={filters.aufnahmeart || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, aufnahmeart: event.target.value || undefined }))}
            >
              <option value="">Alle</option>
              {admissionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              <th>Station</th>
              <th>Zimmer</th>
              <th>Gesamtnote</th>
              <th>Kontakt</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((response) => (
              <tr key={response.id}>
                <td>{new Date(response.createdAt).toLocaleDateString('de-DE')}</td>
                <td>{response.station || '-'}</td>
                <td>{response.zimmer || '-'}</td>
                <td>{response.q33 ?? '-'}</td>
                <td>{response.contactRequested ? 'Ja' : 'Nein'}</td>
                <td>
                  <Link to={`/admin/responses/${response.id}`} className="link">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="empty-state">
                  Keine Einreichungen gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SurveyResponsesPage;

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { surveyQuestions } from '../data/surveyQuestions';
import { surveyRepository } from '../storage/surveyRepository';
import { SurveyFilters, SurveyResponse } from '../types/survey';
import { applySurveyFilters, calculateAverageForQuestion } from '../utils/surveyUtils';

const SurveyDashboardPage = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filters, setFilters] = useState<SurveyFilters>({});

  useEffect(() => {
    surveyRepository.listResponses().then(setResponses);
  }, []);

  const filtered = useMemo(() => applySurveyFilters(responses, filters), [responses, filters]);

  const totals = useMemo(() => {
    const now = Date.now();
    const last7 = filtered.filter((item) => now - new Date(item.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
    const last30 = filtered.filter((item) => now - new Date(item.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000).length;
    return { total: filtered.length, last7, last30 };
  }, [filtered]);

  const averages = useMemo(() => {
    return surveyQuestions.map((question) => ({
      id: question.id,
      label: question.label,
      average: calculateAverageForQuestion(filtered, question.id),
    }));
  }, [filtered]);

  const lowestAverages = useMemo(() => {
    return averages
      .filter((item) => item.average !== null)
      .sort((a, b) => (a.average ?? 0) - (b.average ?? 0))
      .slice(0, 5)
      .map((item) => ({
        name: `Q${item.id.replace('q', '')}`,
        value: item.average ?? 0,
      }));
  }, [averages]);

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Überblick über die Patientenbefragung.</p>
        </div>
      </header>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <p>Gesamtantworten</p>
          <strong>{totals.total}</strong>
        </div>
        <div className="card kpi-card">
          <p>Letzte 7 Tage</p>
          <strong>{totals.last7}</strong>
        </div>
        <div className="card kpi-card">
          <p>Letzte 30 Tage</p>
          <strong>{totals.last30}</strong>
        </div>
      </div>

      <div className="card chart-card">
        <h3>Schwächste Fragen (Ø Score)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={lowestAverages} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 4]} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Bar dataKey="value" fill="#F6B352" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card table-card">
        <h3>Durchschnittswerte pro Frage</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Frage</th>
              <th>Ø Score</th>
            </tr>
          </thead>
          <tbody>
            {averages.map((item) => (
              <tr key={item.id}>
                <td>{item.label}</td>
                <td>{item.average ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <input
              value={filters.aufnahmeart || ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, aufnahmeart: event.target.value || undefined }))}
              placeholder="z.B. Notfall"
            />
          </label>
        </div>
      </div>
    </section>
  );
};

export default SurveyDashboardPage;

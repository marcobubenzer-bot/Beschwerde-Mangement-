import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiFetch } from '../api/client';

type StatsOverall = {
  weightedAvgScore: number | null;
  totalAnswers: number;
  totalResponsesWithLikert: number;
  meanOfResponseAverages: number | null;
};

type StatsQuestion = {
  questionNo: number;
  avgScore: number | null;
  countAnswers: number;
};

type StatsQueryLog = {
  id: string;
  createdAt: string;
  method: string;
  path: string;
  station: string | null;
  aufnahmeart: string[];
  statusCode: number;
  durationMs: number;
};

type FiltersState = {
  from: string;
  to: string;
  station: string;
  aufnahmeart: string[];
};

const AUFNAHMEART_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'ambulant', label: 'Ambulant' },
];

const formatNumber = (value: number | null, digits = 2) => (value === null ? '-' : value.toFixed(digits));

const toIsoRange = (filters: FiltersState) => {
  const from = filters.from ? new Date(`${filters.from}T00:00:00.000Z`).toISOString() : undefined;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999Z`).toISOString() : undefined;
  return { from, to };
};

const buildQuery = (filters: FiltersState) => {
  const params = new URLSearchParams();
  const { from, to } = toIsoRange(filters);

  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (filters.station.trim()) params.set('station', filters.station.trim());
  filters.aufnahmeart.forEach((value) => params.append('aufnahmeart', value));

  return params.toString();
};

const StatsDashboardPage = () => {
  const [filters, setFilters] = useState<FiltersState>({
    from: '',
    to: '',
    station: '',
    aufnahmeart: [],
  });
  const [overall, setOverall] = useState<StatsOverall | null>(null);
  const [questions, setQuestions] = useState<StatsQuestion[]>([]);
  const [queryLogs, setQueryLogs] = useState<StatsQueryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = buildQuery(filters);
        const suffix = query ? `?${query}` : '';
        const [overallResponse, questionsResponse, logsResponse] = await Promise.all([
          apiFetch<StatsOverall>(`/stats/overall${suffix}`),
          apiFetch<StatsQuestion[]>(`/stats/questions${suffix}`),
          apiFetch<StatsQueryLog[]>(`/stats/query-logs${suffix}`),
        ]);
        setOverall(overallResponse);
        setQuestions(questionsResponse);
        setQueryLogs(logsResponse);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unbekannter Fehler beim Laden.');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [filters]);

  const questionChartData = useMemo(
    () =>
      questions.map((item) => ({
        ...item,
        label: `Q${item.questionNo}`,
      })),
    [questions],
  );

  const ranked = useMemo(
    () => [...questionChartData].filter((item) => item.avgScore !== null).sort((a, b) => (a.avgScore ?? 0) - (b.avgScore ?? 0)),
    [questionChartData],
  );

  const bottom5 = ranked.slice(0, 5);
  const top5 = [...ranked].reverse().slice(0, 5);

  const updateAufnahmeart = (value: string, selected: boolean) => {
    setFilters((prev) => ({
      ...prev,
      aufnahmeart: selected ? [...prev.aufnahmeart, value] : prev.aufnahmeart.filter((entry) => entry !== value),
    }));
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Live-Auswertung der Befragungsdaten aus dem Backend.</p>
        </div>
      </header>

      <div className="card">
        <div className="stats-filter-grid">
          <label>
            Von
            <input type="date" value={filters.from} onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))} />
          </label>
          <label>
            Bis
            <input type="date" value={filters.to} onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))} />
          </label>
          <label>
            Station
            <input
              type="text"
              placeholder="z.B. Kardiologie"
              value={filters.station}
              onChange={(event) => setFilters((prev) => ({ ...prev, station: event.target.value }))}
            />
          </label>
          <fieldset className="aufnahmeart-fieldset">
            <legend>Aufnahmeart</legend>
            <div className="aufnahmeart-list">
              {AUFNAHMEART_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox">
                  <input
                    type="checkbox"
                    checked={filters.aufnahmeart.includes(option.value)}
                    onChange={(event) => updateAufnahmeart(option.value, event.target.checked)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {loading && <div className="card">Lade Dashboard-Daten...</div>}
      {error && <div className="card form-error">Fehler beim Laden: {error}</div>}

      {overall && !loading && !error && (
        <>
          <div className="kpi-grid">
            <div className="card kpi-card">
              <p>weightedAvgScore</p>
              <strong>{formatNumber(overall.weightedAvgScore)}</strong>
            </div>
            <div className="card kpi-card">
              <p>totalAnswers</p>
              <strong>{overall.totalAnswers}</strong>
            </div>
            <div className="card kpi-card">
              <p>totalResponsesWithLikert</p>
              <strong>{overall.totalResponsesWithLikert}</strong>
            </div>
            <div className="card kpi-card">
              <p>meanOfResponseAverages</p>
              <strong>{formatNumber(overall.meanOfResponseAverages)}</strong>
            </div>
          </div>

          <div className="card chart-card stats-chart-card">
            <h3>Fragenanalyse (Ø Score + Anzahl Antworten)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={questionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={2} />
                <YAxis yAxisId="score" domain={[0, 5]} />
                <YAxis yAxisId="count" orientation="right" />
                <Tooltip />
                <Bar yAxisId="score" dataKey="avgScore" fill="#2563eb" name="Ø Score" />
                <Line yAxisId="count" type="monotone" dataKey="countAnswers" stroke="#f97316" dot={false} name="Antworten" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-2">
            <div className="card chart-card stats-small-chart-card">
              <h3>Bottom 5 Fragen</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bottom5} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="label" width={56} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card chart-card stats-small-chart-card">
              <h3>Top 5 Fragen</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top5} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis type="category" dataKey="label" width={56} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#16a34a">
                    {top5.map((entry) => (
                      <Cell key={entry.label} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card table-card">
            <h3>Letzte Auswertungs-Abfragen</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Zeitpunkt</th>
                  <th>Pfad</th>
                  <th>Status</th>
                  <th>Dauer (ms)</th>
                  <th>Station</th>
                  <th>Aufnahmeart</th>
                </tr>
              </thead>
              <tbody>
                {queryLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.path}</td>
                    <td>{log.statusCode}</td>
                    <td>{log.durationMs}</td>
                    <td>{log.station ?? '-'}</td>
                    <td>{log.aufnahmeart.length ? log.aufnahmeart.join(', ') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default StatsDashboardPage;

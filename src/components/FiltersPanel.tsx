import { ComplaintFilters, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types/complaint';

interface FiltersPanelProps {
  filters: ComplaintFilters;
  categories: string[];
  onChange: (filters: ComplaintFilters) => void;
}

const statusOptions: Array<ComplaintStatus | 'Alle'> = [
  'Alle',
  'Neu',
  'In Prüfung',
  'Rückfrage',
  'In Bearbeitung',
  'Gelöst',
  'Abgelehnt',
];
const priorityOptions: Array<ComplaintPriority | 'Alle'> = [
  'Alle',
  'Niedrig',
  'Mittel',
  'Hoch',
  'Kritisch',
];

const FiltersPanel = ({ filters, categories, onChange }: FiltersPanelProps) => {
  return (
    <div className="card filters">
      <div className="filters-grid">
        <label>
          Suche
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Vorgangsnummer, Text, Schlagwort"
          />
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as ComplaintStatus | 'Alle' })}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kategorie
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({ ...filters, category: event.target.value as ComplaintCategory | 'Alle' })
            }
          >
            <option value="Alle">Alle</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priorität
          <select
            value={filters.priority}
            onChange={(event) =>
              onChange({ ...filters, priority: event.target.value as ComplaintPriority | 'Alle' })
            }
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label>
          Standort
          <input
            type="text"
            value={filters.location}
            onChange={(event) => onChange({ ...filters, location: event.target.value })}
            placeholder="z. B. Hauptstandort"
          />
        </label>
        <label>
          Abteilung
          <input
            type="text"
            value={filters.department}
            onChange={(event) => onChange({ ...filters, department: event.target.value })}
            placeholder="z. B. Notaufnahme"
          />
        </label>
        <label>
          Zeitraum von
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(event) => onChange({ ...filters, dateFrom: event.target.value || undefined })}
          />
        </label>
        <label>
          Zeitraum bis
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(event) => onChange({ ...filters, dateTo: event.target.value || undefined })}
          />
        </label>
      </div>
      <button
        className="button ghost"
        type="button"
        onClick={() =>
          onChange({
            query: '',
            status: 'Alle',
            category: 'Alle',
            priority: 'Alle',
            location: '',
            department: '',
            dateFrom: undefined,
            dateTo: undefined,
          })
        }
      >
        Filter zurücksetzen
      </button>
    </div>
  );
};

export default FiltersPanel;

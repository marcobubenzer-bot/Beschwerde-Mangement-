import { useEffect } from 'react';
import { ComplaintFilters, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types/complaint';
import { SettingsData, getSectionValues } from '../storage/settingsRepository';

interface FiltersPanelProps {
  filters: ComplaintFilters;
  settings: SettingsData;
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

const FiltersPanel = ({ filters, settings, onChange }: FiltersPanelProps) => {
  const locationOptions = getSectionValues(settings, 'locations');
  const departmentOptions = getSectionValues(settings, 'departments');
  const categoryOptions = getSectionValues(settings, 'categories');

  useEffect(() => {
    if (filters.location !== 'Alle' && !locationOptions.includes(filters.location)) {
      onChange({ ...filters, location: 'Alle' });
    }
    if (filters.department !== 'Alle' && !departmentOptions.includes(filters.department)) {
      onChange({ ...filters, department: 'Alle' });
    }
    if (filters.category !== 'Alle' && !categoryOptions.includes(filters.category)) {
      onChange({ ...filters, category: 'Alle' });
    }
  }, [categoryOptions, departmentOptions, filters, locationOptions, onChange]);

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
            {categoryOptions.map((category) => (
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
          <select value={filters.location} onChange={(event) => onChange({ ...filters, location: event.target.value })}>
            <option value="Alle">Alle</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label>
          Abteilung
          <select
            value={filters.department}
            onChange={(event) => onChange({ ...filters, department: event.target.value })}
          >
            <option value="Alle">Alle</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
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
              location: 'Alle',
              department: 'Alle',
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

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import TagInput from '../components/TagInput';
import { complaintRepository } from '../storage/localStorageComplaintRepository';
import { loadSettings } from '../storage/settingsRepository';
import { generateCaseNumber } from '../services/caseNumberService';
import { Complaint, ComplaintAttachment } from '../types/complaint';

const NewComplaintPage = () => {
  const navigate = useNavigate();
  const settings = useMemo(() => loadSettings(), []);

  const [form, setForm] = useState<Complaint>({
    id: uuidv4(),
    caseNumber: generateCaseNumber(),
    createdAt: new Date().toISOString(),
    reporterType: 'Patient',
    reporterName: '',
    contact: '',
    location: settings.locations[0] ?? '',
    department: settings.departments[0] ?? '',
    category: (settings.categories[0] as Complaint['category']) ?? 'Pflege',
    priority: 'Mittel',
    channel: 'Telefon',
    description: '',
    involvedPeople: '',
    consent: false,
    status: 'Neu',
    owner: '',
    dueDate: '',
    measures: '',
    tags: [],
    attachments: [],
    notes: [],
  });

  const [error, setError] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      location: prev.location || settings.locations[0] || '',
      department: prev.department || settings.departments[0] || '',
      category: (prev.category || settings.categories[0]) as Complaint['category'],
    }));
  }, [settings]);

  const handleAttachmentAdd = () => {
    const label = prompt('Dateiname / Hinweis zur Anlage');
    if (!label) return;
    const attachment: ComplaintAttachment = { id: uuidv4(), label };
    setForm((prev) => ({ ...prev, attachments: [...prev.attachments, attachment] }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.description.trim()) {
      setError('Bitte beschreiben Sie die Beschwerde.');
      return;
    }
    if (!form.consent) {
      setError('Bitte bestätigen Sie die Datenschutz-Einwilligung.');
      return;
    }
    setError('');
    const complaint: Complaint = {
      ...form,
      reporterName: form.reporterName?.trim() || undefined,
      contact: form.contact?.trim() || undefined,
      involvedPeople: form.involvedPeople?.trim() || undefined,
      owner: form.owner?.trim() || undefined,
      dueDate: form.dueDate || undefined,
      measures: form.measures?.trim() || undefined,
    };
    await complaintRepository.create(complaint);
    navigate(`/confirmation/${complaint.id}`);
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Neue Beschwerde</h2>
          <p>Alle Pflichtfelder sind markiert. Freundliche Hinweise helfen beim Ausfüllen.</p>
        </div>
        <div className="case-number">Vorgangsnummer: {form.caseNumber}</div>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="card form-section">
          <h3>Melder:in</h3>
          <div className="grid-2">
            <label>
              Melder-Typ *
              <select
                value={form.reporterType}
                onChange={(event) => setForm({ ...form, reporterType: event.target.value as Complaint['reporterType'] })}
              >
                <option value="Patient">Patient</option>
                <option value="Angehörige">Angehörige</option>
                <option value="Mitarbeitende">Mitarbeitende</option>
                <option value="Sonstige">Sonstige</option>
              </select>
            </label>
            <label>
              Name (optional)
              <input
                value={form.reporterName}
                onChange={(event) => setForm({ ...form, reporterName: event.target.value })}
                placeholder="Optionaler Name"
              />
            </label>
            <label>
              Kontakt (optional)
              <input
                value={form.contact}
                onChange={(event) => setForm({ ...form, contact: event.target.value })}
                placeholder="Telefon oder E-Mail"
              />
            </label>
          </div>
        </div>

        <div className="card form-section">
          <h3>Ort & Kategorie</h3>
          <div className="grid-2">
            <label>
              Standort *
              <input
                list="locations"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
              <datalist id="locations">
                {settings.locations.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
            <label>
              Abteilung/Station *
              <input
                list="departments"
                value={form.department}
                onChange={(event) => setForm({ ...form, department: event.target.value })}
              />
              <datalist id="departments">
                {settings.departments.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
            <label>
              Kategorie *
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value as Complaint['category'] })}
              >
                {settings.categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kanal *
              <select
                value={form.channel}
                onChange={(event) => setForm({ ...form, channel: event.target.value as Complaint['channel'] })}
              >
                <option value="Telefon">Telefon</option>
                <option value="E-Mail">E-Mail</option>
                <option value="Brief">Brief</option>
                <option value="Persönlich">Persönlich</option>
                <option value="Online">Online</option>
              </select>
            </label>
          </div>
        </div>

        <div className="card form-section">
          <h3>Inhalt</h3>
          <label>
            Beschreibung *
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Was ist passiert? Wann? Wer ist betroffen?"
              rows={5}
            />
          </label>
          <div className="grid-2">
            <label>
              Beteiligte Personen (optional)
              <input
                value={form.involvedPeople}
                onChange={(event) => setForm({ ...form, involvedPeople: event.target.value })}
              />
            </label>
            <label>
              Priorität *
              <select
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: event.target.value as Complaint['priority'] })}
              >
                <option value="Niedrig">Niedrig</option>
                <option value="Mittel">Mittel</option>
                <option value="Hoch">Hoch</option>
                <option value="Kritisch">Kritisch</option>
              </select>
            </label>
          </div>
          <TagInput
            label="Schlagwörter"
            tags={form.tags}
            onChange={(tags) => setForm({ ...form, tags })}
            placeholder="z. B. Wartezeit, Service"
          />
          <div className="attachment">
            <button type="button" className="button ghost" onClick={handleAttachmentAdd}>
              Anlage hinzufügen
            </button>
            {form.attachments.length > 0 && (
              <ul>
                {form.attachments.map((attachment) => (
                  <li key={attachment.id}>{attachment.label}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card form-section">
          <h3>Bearbeitung</h3>
          <div className="grid-2">
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as Complaint['status'] })}
              >
                <option value="Neu">Neu</option>
                <option value="In Prüfung">In Prüfung</option>
                <option value="Rückfrage">Rückfrage</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Gelöst">Gelöst</option>
                <option value="Abgelehnt">Abgelehnt</option>
              </select>
            </label>
            <label>
              Verantwortliche Person (optional)
              <input
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
              />
            </label>
            <label>
              Frist (optional)
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              />
            </label>
          </div>
          <label>
            Maßnahmen / Notizen (optional)
            <textarea
              value={form.measures}
              onChange={(event) => setForm({ ...form, measures: event.target.value })}
              rows={4}
            />
          </label>
        </div>

        <div className="card form-section">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => setForm({ ...form, consent: event.target.checked })}
            />
            <span>Ich bestätige die Datenschutz-Einwilligung.</span>
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="button primary">
            Beschwerde speichern
          </button>
          <button
            type="button"
            className="button ghost"
            onClick={() => setForm({ ...form, description: '', measures: '', tags: [], attachments: [] })}
          >
            Formular leeren
          </button>
        </div>
      </form>
    </section>
  );
};

export default NewComplaintPage;

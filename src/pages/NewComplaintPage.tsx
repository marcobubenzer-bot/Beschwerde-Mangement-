import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import TagInput from '../components/TagInput';
import { complaintRepository } from '../storage/indexedDbComplaintRepository';
import { attachmentRepository } from '../storage/attachmentRepository';
import { loadSettings } from '../storage/settingsRepository';
import { generateCaseNumber } from '../services/caseNumberService';
import { Complaint, ComplaintAttachment } from '../types/complaint';

interface NewComplaintPageProps {
  mode: 'report' | 'admin';
}

interface AttachmentDraft {
  id: string;
  file: File;
  previewUrl: string;
}

const reporterTypeMap = {
  partien: 'Patient',
  mitarbeit: 'Mitarbeitende',
  sonstige: 'Sonstige',
} as const;

const getReporterTypeFromQuery = (value: string | null): Complaint['reporterType'] => {
  if (!value) return 'Patient';
  return reporterTypeMap[value as keyof typeof reporterTypeMap] ?? 'Patient';
};

const NewComplaintPage = ({ mode }: NewComplaintPageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const settings = useMemo(() => loadSettings(), []);
  const isAdmin = mode === 'admin';
  const initialReporterType = useMemo(
    () => (isAdmin ? 'Patient' : getReporterTypeFromQuery(searchParams.get('type'))),
    [isAdmin, searchParams]
  );

  const [form, setForm] = useState<Complaint>({
    id: uuidv4(),
    caseNumber: generateCaseNumber(),
    createdAt: new Date().toISOString(),
    reporterType: initialReporterType,
    reporterName: '',
    contact: '',
    location: settings.locations[0] ?? '',
    department: settings.departments[0] ?? '',
    category: (settings.categories[0] as Complaint['category']) ?? 'Pflege',
    priority: 'Mittel',
    channel: isAdmin ? 'Telefon' : 'Online',
    origin: isAdmin ? 'admin' : 'report',
    description: '',
    involvedPeople: '',
    consent: false,
    status: 'Neu',
    owner: '',
    dueDate: '',
    measures: '',
    tags: [],
    attachmentIds: [],
    notes: [],
  });

  const [drafts, setDrafts] = useState<AttachmentDraft[]>([]);
  const draftsRef = useRef<AttachmentDraft[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      location: prev.location || settings.locations[0] || '',
      department: prev.department || settings.departments[0] || '',
      category: (prev.category || settings.categories[0]) as Complaint['category'],
      reporterType: prev.reporterType || initialReporterType,
      channel: isAdmin ? prev.channel : 'Online',
      origin: isAdmin ? 'admin' : 'report',
    }));
  }, [initialReporterType, isAdmin, settings]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    return () => {
      draftsRef.current.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const nextDrafts = Array.from(event.target.files).map((file) => ({
      id: uuidv4(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setDrafts((prev) => [...prev, ...nextDrafts]);
    event.target.value = '';
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const persistAttachments = async (complaintId: string) => {
    const storedIds: string[] = [];
    for (const draft of drafts) {
      const attachment: ComplaintAttachment = {
        id: draft.id,
        complaintId,
        filename: draft.file.name,
        mimeType: draft.file.type,
        size: draft.file.size,
        createdAt: new Date().toISOString(),
        blob: draft.file,
      };
      await attachmentRepository.create(attachment);
      storedIds.push(draft.id);
    }
    return storedIds;
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
    const attachmentIds = await persistAttachments(form.id);
    const complaint: Complaint = {
      ...form,
      channel: isAdmin ? form.channel : 'Online',
      origin: isAdmin ? 'admin' : 'report',
      reporterName: form.reporterName?.trim() || undefined,
      contact: form.contact?.trim() || undefined,
      involvedPeople: form.involvedPeople?.trim() || undefined,
      owner: form.owner?.trim() || undefined,
      dueDate: form.dueDate || undefined,
      measures: form.measures?.trim() || undefined,
      attachmentIds,
    };
    await complaintRepository.create(complaint);
    navigate(mode === 'report' ? `/report/confirmation/${complaint.id}` : `/admin/confirmation/${complaint.id}`);
  };

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>{isAdmin ? 'Neue Beschwerde' : 'Beschwerde einreichen'}</h2>
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reporterType: event.target.value as Complaint['reporterType'] }))
                }
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
                onChange={(event) => setForm((prev) => ({ ...prev, reporterName: event.target.value }))}
                placeholder="Optionaler Name"
              />
            </label>
            <label>
              Kontakt (optional)
              <input
                value={form.contact}
                onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
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
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
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
                onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
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
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category: event.target.value as Complaint['category'] }))
                }
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
              {isAdmin ? (
                <select
                  value={form.channel}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, channel: event.target.value as Complaint['channel'] }))
                  }
                >
                  <option value="Telefon">Telefon</option>
                  <option value="E-Mail">E-Mail</option>
                  <option value="Brief">Brief</option>
                  <option value="Persönlich">Persönlich</option>
                  <option value="Online">Online</option>
                </select>
              ) : (
                <div className="static-field">
                  <strong>Online</strong>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="card form-section">
          <h3>Inhalt</h3>
          <label>
            Beschreibung *
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Was ist passiert? Wann? Wer ist betroffen?"
              rows={5}
            />
          </label>
          <div className="grid-2">
            <label>
              Beteiligte Personen (optional)
              <input
                value={form.involvedPeople}
                onChange={(event) => setForm((prev) => ({ ...prev, involvedPeople: event.target.value }))}
              />
            </label>
            <label>
              Priorität *
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, priority: event.target.value as Complaint['priority'] }))
                }
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
            onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
            placeholder="z. B. Wartezeit, Service"
          />
          <div className="attachment">
            <label>
              Anlagen hinzufügen (Bilder)
              <input type="file" accept="image/png, image/jpeg, image/webp" multiple onChange={handleFileChange} />
            </label>
            {drafts.length > 0 && (
              <div className="attachment-grid">
                {drafts.map((draft) => (
                  <div key={draft.id} className="attachment-card">
                    <img src={draft.previewUrl} alt={draft.file.name} />
                    <div>
                      <p>{draft.file.name}</p>
                      <span className="muted">{Math.round(draft.file.size / 1024)} KB</span>
                    </div>
                    <button type="button" className="button ghost" onClick={() => removeDraft(draft.id)}>
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="card form-section">
            <h3>Bearbeitung</h3>
            <div className="grid-2">
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as Complaint['status'] }))
                  }
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
                  onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
                />
              </label>
              <label>
                Frist (optional)
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
              </label>
            </div>
            <label>
              Maßnahmen / Notizen (optional)
              <textarea
                value={form.measures}
                onChange={(event) => setForm((prev) => ({ ...prev, measures: event.target.value }))}
                rows={4}
              />
            </label>
          </div>
        )}

        <div className="card form-section">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(event) => setForm((prev) => ({ ...prev, consent: event.target.checked }))}
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
            onClick={() => {
              drafts.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
              setDrafts([]);
              setForm((prev) => ({ ...prev, description: '', measures: '', tags: [], attachmentIds: [] }));
            }}
          >
            Formular leeren
          </button>
        </div>
      </form>
    </section>
  );
};

export default NewComplaintPage;

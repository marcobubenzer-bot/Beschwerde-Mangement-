import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { complaintRepository } from '../storage/localStorageComplaintRepository';
import { Complaint, ComplaintStatus } from '../types/complaint';
import { exportComplaintPdf } from '../utils/pdf';
import { formatDate, formatDateTime } from '../utils/date';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!id) return;
    complaintRepository.getById(id).then((data) => setComplaint(data ?? null));
  }, [id]);

  const updateComplaint = async (updates: Partial<Complaint>) => {
    if (!complaint) return;
    const updated = { ...complaint, ...updates };
    setComplaint(updated);
    await complaintRepository.update(updated);
  };

  const handleAddNote = async () => {
    if (!complaint || !note.trim()) return;
    const updatedNotes = [
      { id: uuidv4(), createdAt: new Date().toISOString(), text: note.trim() },
      ...complaint.notes,
    ];
    await updateComplaint({ notes: updatedNotes });
    setNote('');
  };

  if (!complaint) {
    return (
      <div className="card">
        <h2>Vorgang nicht gefunden</h2>
        <Link to="/complaints" className="button ghost">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>{complaint.caseNumber}</h2>
          <p>Erstellt am {formatDateTime(complaint.createdAt)}</p>
        </div>
        <div className="header-actions">
          <button className="button ghost" onClick={() => exportComplaintPdf(complaint)}>
            PDF Fallblatt
          </button>
          <button className="button ghost" onClick={() => navigate('/complaints')}>
            Zurück
          </button>
        </div>
      </header>

      <div className="grid-2">
        <div className="card">
          <h3>Übersicht</h3>
          <ul className="detail-list">
            <li>
              <span>Status</span>
              <select
                value={complaint.status}
                onChange={(event) => updateComplaint({ status: event.target.value as ComplaintStatus })}
              >
                <option value="Neu">Neu</option>
                <option value="In Prüfung">In Prüfung</option>
                <option value="Rückfrage">Rückfrage</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Gelöst">Gelöst</option>
                <option value="Abgelehnt">Abgelehnt</option>
              </select>
            </li>
            <li>
              <span>Priorität</span>
              <strong>{complaint.priority}</strong>
            </li>
            <li>
              <span>Kategorie</span>
              <strong>{complaint.category}</strong>
            </li>
            <li>
              <span>Standort</span>
              <strong>{complaint.location}</strong>
            </li>
            <li>
              <span>Abteilung</span>
              <strong>{complaint.department}</strong>
            </li>
            <li>
              <span>Frist</span>
              <strong>{complaint.dueDate ? formatDate(complaint.dueDate) : '—'}</strong>
            </li>
          </ul>
        </div>
        <div className="card">
          <h3>Melder:in</h3>
          <ul className="detail-list">
            <li>
              <span>Typ</span>
              <strong>{complaint.reporterType}</strong>
            </li>
            <li>
              <span>Name</span>
              <strong>{complaint.reporterName || '—'}</strong>
            </li>
            <li>
              <span>Kontakt</span>
              <strong>{complaint.contact || '—'}</strong>
            </li>
          </ul>
          <h3>Beschreibung</h3>
          <p>{complaint.description}</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Maßnahmen & Notizen</h3>
          <textarea
            value={complaint.measures || ''}
            onChange={(event) => updateComplaint({ measures: event.target.value })}
            rows={4}
            placeholder="Laufende Maßnahmen und Entscheidungen"
          />
          <div className="note-input">
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Neue Notiz hinzufügen"
            />
            <button className="button ghost" type="button" onClick={handleAddNote}>
              Notiz speichern
            </button>
          </div>
          <div className="note-list">
            {complaint.notes.map((item) => (
              <div key={item.id} className="note">
                <span>{formatDateTime(item.createdAt)}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Weitere Angaben</h3>
          <ul className="detail-list">
            <li>
              <span>Kanal</span>
              <strong>{complaint.channel}</strong>
            </li>
            <li>
              <span>Beteiligte Personen</span>
              <strong>{complaint.involvedPeople || '—'}</strong>
            </li>
            <li>
              <span>Verantwortlich</span>
              <strong>{complaint.owner || '—'}</strong>
            </li>
            <li>
              <span>Schlagwörter</span>
              <strong>{complaint.tags.length ? complaint.tags.join(', ') : '—'}</strong>
            </li>
            <li>
              <span>Anlagen</span>
              <strong>
                {complaint.attachments.length
                  ? complaint.attachments.map((attachment) => attachment.label).join(', ')
                  : '—'}
              </strong>
            </li>
            <li>
              <span>Datenschutz-Einwilligung</span>
              <strong>{complaint.consent ? 'Ja' : 'Nein'}</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ComplaintDetailPage;

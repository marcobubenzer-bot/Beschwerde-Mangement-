import { useMemo, useRef, useState } from 'react';
import { complaintRepository } from '../storage/indexedDbComplaintRepository';
import { attachmentRepository } from '../storage/attachmentRepository';
import { loadSettings, saveSettings } from '../storage/settingsRepository';
import { createSampleComplaints } from '../utils/sampleData';
import { Complaint } from '../types/complaint';
import { getAdminPin, setAdminPin } from '../services/authService';

const SettingsPage = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [settings, setSettings] = useState(loadSettings());
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState(getAdminPin());

  const updateList = (field: 'locations' | 'departments' | 'categories', value: string) => {
    const items = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    const next = { ...settings, [field]: items };
    setSettings(next);
    saveSettings(next);
  };

  const exportJson = async () => {
    const complaints = await complaintRepository.list();
    const attachments = await attachmentRepository.listAll();
    const exportAttachments = attachments.map(({ blob, ...rest }) => rest);
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      complaints,
      attachments: exportAttachments,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'klinikbeschwerde_backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    const text = await file.text();
    const parsed = JSON.parse(text) as { settings?: typeof settings; complaints?: Complaint[] };
    if (parsed.settings) {
      setSettings(parsed.settings);
      saveSettings(parsed.settings);
    }
    if (parsed.complaints) {
      await complaintRepository.clear();
      await attachmentRepository.clear();
      for (const complaint of parsed.complaints) {
        await complaintRepository.create(complaint);
      }
    }
    setMessage('Import abgeschlossen.');
    setBusy(false);
  };

  const handleClearAll = async () => {
    const confirmed = confirm('Wirklich alle Beschwerden löschen? Dieser Schritt kann nicht rückgängig gemacht werden.');
    if (!confirmed) return;
    await complaintRepository.clear();
    await attachmentRepository.clear();
    setMessage('Alle Beschwerden wurden gelöscht.');
  };

  const handleSampleData = async () => {
    await complaintRepository.clear();
    await attachmentRepository.clear();
    const samples = createSampleComplaints();
    for (const sample of samples) {
      await complaintRepository.create(sample);
    }
    setMessage('Beispieldaten wurden erstellt.');
  };

  const handlePinSave = () => {
    setAdminPin(pin);
    setMessage('Admin-PIN gespeichert.');
  };

  const hints = useMemo(
    () => [
      'Tipp: Listenwerte pro Zeile eingeben.',
      'Export/Import ermöglicht ein schnelles Backup ohne Server.',
      'Anlagen werden in der App gespeichert und müssen separat gesichert werden.',
    ],
    []
  );

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>Einstellungen</h2>
          <p>Listenwerte verwalten und Daten sichern.</p>
        </div>
      </header>

      <div className="grid-2">
        <div className="card">
          <h3>Dropdown-Werte</h3>
          <label>
            Standorte (je Zeile)
            <textarea
              value={settings.locations.join('\n')}
              rows={5}
              onChange={(event) => updateList('locations', event.target.value)}
            />
          </label>
          <label>
            Abteilungen / Stationen (je Zeile)
            <textarea
              value={settings.departments.join('\n')}
              rows={5}
              onChange={(event) => updateList('departments', event.target.value)}
            />
          </label>
          <label>
            Kategorien (je Zeile)
            <textarea
              value={settings.categories.join('\n')}
              rows={5}
              onChange={(event) => updateList('categories', event.target.value)}
            />
          </label>
        </div>
        <div className="card">
          <h3>Datenverwaltung</h3>
          <div className="button-stack">
            <button className="button primary" type="button" onClick={exportJson}>
              Export JSON
            </button>
            <button
              className="button ghost"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              Import JSON
            </button>
            <button className="button ghost" type="button" onClick={handleSampleData}>
              Beispieldaten erstellen
            </button>
            <button className="button danger" type="button" onClick={handleClearAll}>
              Alles löschen
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => importJson(event.target.files?.[0])}
          />
          {message && <p className="success">{message}</p>}
          <ul className="hint-list">
            {hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <h3>Admin-PIN</h3>
        <div className="pin-row">
          <input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            aria-label="Admin-PIN"
          />
          <button className="button ghost" type="button" onClick={handlePinSave}>
            PIN speichern
          </button>
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;

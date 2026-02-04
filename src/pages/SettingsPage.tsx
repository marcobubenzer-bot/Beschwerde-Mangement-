import { useEffect, useMemo, useRef, useState } from 'react';
import { complaintRepository } from '../storage/indexedDbComplaintRepository';
import { attachmentRepository } from '../storage/attachmentRepository';
import { DropdownSection, loadSettings, saveSettings } from '../storage/settingsRepository';
import { createSampleComplaints } from '../utils/sampleData';
import { Complaint } from '../types/complaint';
import { setAdminPin } from '../services/authService';
import { useBranding } from '../context/BrandingContext';
import { defaultBranding } from '../storage/brandingRepository';
import { isValidHexColor, isValidSvgString } from '../utils/branding';

const SettingsPage = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [settings, setSettings] = useState(loadSettings());
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState('');
  const { branding, saveBranding, resetBranding } = useBranding();
  const [brandingDraft, setBrandingDraft] = useState(branding);
  const [brandingMessage, setBrandingMessage] = useState('');
  const [brandingWarning, setBrandingWarning] = useState('');

  useEffect(() => {
    setBrandingDraft(branding);
  }, [branding]);

  const normalizeValues = (value: string) => {
    const items = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  };

  const updateSection = (id: string, updates: Partial<DropdownSection>) => {
    const nextSections = settings.dropdownSections.map((section) =>
      section.id === id ? { ...section, ...updates } : section
    );
    const next = { ...settings, dropdownSections: nextSections };
    setSettings(next);
    saveSettings(next);
  };

  const addSection = () => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `section-${Date.now()}`;
    const nextSections = [
      ...settings.dropdownSections,
      { id, label: 'Neuer Bereich', values: [] as string[] },
    ];
    const next = { ...settings, dropdownSections: nextSections };
    setSettings(next);
    saveSettings(next);
  };

  const removeSection = (id: string) => {
    const confirmed = confirm('Bereich wirklich löschen?');
    if (!confirmed) return;
    const nextSections = settings.dropdownSections.filter((section) => section.id !== id);
    const next = { ...settings, dropdownSections: nextSections };
    setSettings(next);
    saveSettings(next);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = settings.dropdownSections.findIndex((section) => section.id === id);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.dropdownSections.length) return;
    const nextSections = [...settings.dropdownSections];
    const [removed] = nextSections.splice(index, 1);
    nextSections.splice(targetIndex, 0, removed);
    const next = { ...settings, dropdownSections: nextSections };
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
    if (!pin.trim()) {
      setMessage('Bitte eine neue Admin-PIN eingeben.');
      return;
    }
    setAdminPin(pin);
    setPin('');
    setMessage('Admin-PIN gespeichert.');
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    const allowedTypes = ['image/svg+xml', 'text/plain', 'application/xml', 'text/xml'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.svg')) {
      setBrandingWarning('Bitte nur SVG-Dateien hochladen.');
      return;
    }
    const text = await file.text();
    setBrandingDraft((current) => ({ ...current, logoSvg: text }));
    if (!isValidSvgString(text)) {
      setBrandingWarning('Das hochgeladene SVG ist ungültig.');
    } else {
      setBrandingWarning('');
    }
  };

  const handleBrandingSave = () => {
    const next = {
      ...brandingDraft,
      organizationName: brandingDraft.organizationName.trim(),
      primaryColor: isValidHexColor(brandingDraft.primaryColor) ? brandingDraft.primaryColor : defaultBranding.primaryColor,
      accentColor: isValidHexColor(brandingDraft.accentColor) ? brandingDraft.accentColor : defaultBranding.accentColor,
    };
    if (next.showBranding && next.logoSvg && !isValidSvgString(next.logoSvg)) {
      setBrandingWarning('Branding ist aktiv, aber das SVG-Logo ist ungültig.');
    } else {
      setBrandingWarning('');
    }
    saveBranding(next);
    setBrandingMessage('Branding gespeichert.');
  };

  const handleBrandingReset = () => {
    resetBranding();
    setBrandingDraft(defaultBranding);
    setBrandingWarning('');
    setBrandingMessage('Branding auf Standard zurückgesetzt.');
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
          <div className="button-stack">
            <button className="button ghost" type="button" onClick={addSection}>
              + Bereich hinzufügen
            </button>
          </div>
          <div className="stack">
            {settings.dropdownSections.map((section, index) => (
              <div key={section.id} className="card nested-card">
                <div className="section-header">
                  <input
                    type="text"
                    value={section.label}
                    onChange={(event) => updateSection(section.id, { label: event.target.value })}
                    aria-label="Bereichsname"
                  />
                  <div className="section-actions">
                    <button
                      type="button"
                      className="button ghost"
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="button ghost"
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === settings.dropdownSections.length - 1}
                    >
                      ↓
                    </button>
                    <button type="button" className="button danger" onClick={() => removeSection(section.id)}>
                      Löschen
                    </button>
                  </div>
                </div>
                <label>
                  Werte (je Zeile)
                  <textarea
                    value={section.values.join('\n')}
                    rows={5}
                    onChange={(event) =>
                      updateSection(section.id, { values: normalizeValues(event.target.value) })
                    }
                  />
                </label>
              </div>
            ))}
          </div>
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
          <span className="muted">Aktuelle PIN wird nicht angezeigt.</span>
          <button className="button ghost" type="button" onClick={handlePinSave}>
            PIN speichern
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Branding</h3>
        <div className="branding-grid">
          <label>
            Organisation / Krankenhausname
            <input
              type="text"
              value={brandingDraft.organizationName}
              onChange={(event) => setBrandingDraft((current) => ({ ...current, organizationName: event.target.value }))}
              placeholder="z. B. Klinikum Beispielstadt"
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={brandingDraft.showBranding}
              onChange={(event) => setBrandingDraft((current) => ({ ...current, showBranding: event.target.checked }))}
            />
            Branding aktivieren
          </label>
        </div>
        <div className="branding-grid">
          <label>
            Primary Color
            <div className="color-row">
              <input
                type="color"
                value={isValidHexColor(brandingDraft.primaryColor) ? brandingDraft.primaryColor : defaultBranding.primaryColor}
                onChange={(event) => setBrandingDraft((current) => ({ ...current, primaryColor: event.target.value }))}
                aria-label="Primary Color"
              />
              <input
                type="text"
                value={brandingDraft.primaryColor}
                onChange={(event) => setBrandingDraft((current) => ({ ...current, primaryColor: event.target.value }))}
                placeholder="#6a6af4"
              />
            </div>
          </label>
          <label>
            Accent Color
            <div className="color-row">
              <input
                type="color"
                value={isValidHexColor(brandingDraft.accentColor) ? brandingDraft.accentColor : defaultBranding.accentColor}
                onChange={(event) => setBrandingDraft((current) => ({ ...current, accentColor: event.target.value }))}
                aria-label="Accent Color"
              />
              <input
                type="text"
                value={brandingDraft.accentColor}
                onChange={(event) => setBrandingDraft((current) => ({ ...current, accentColor: event.target.value }))}
                placeholder="#1f2a44"
              />
            </div>
          </label>
        </div>
        <div className="branding-grid">
          <label>
            Logo (SVG Upload)
            <input
              type="file"
              accept="image/svg+xml,text/plain,application/xml,text/xml"
              onChange={(event) => handleLogoUpload(event.target.files?.[0])}
            />
          </label>
          <label>
            SVG Code einfügen
            <textarea
              rows={6}
              value={brandingDraft.logoSvg}
              onChange={(event) => setBrandingDraft((current) => ({ ...current, logoSvg: event.target.value }))}
              placeholder="<svg>...</svg>"
            />
          </label>
        </div>
        <div className="branding-preview">
          <p className="muted">Logo-Vorschau</p>
          {brandingDraft.logoSvg && isValidSvgString(brandingDraft.logoSvg) ? (
            <div
              className="branding-preview-box"
              dangerouslySetInnerHTML={{ __html: brandingDraft.logoSvg }}
              aria-hidden="true"
            />
          ) : (
            <p className="muted">Kein gültiges SVG hinterlegt.</p>
          )}
        </div>
        {brandingWarning && <p className="form-warning">{brandingWarning}</p>}
        {brandingMessage && <p className="success">{brandingMessage}</p>}
        <div className="form-actions">
          <button className="button primary" type="button" onClick={handleBrandingSave}>
            Branding speichern
          </button>
          <button className="button ghost" type="button" onClick={handleBrandingReset}>
            Auf Standard zurücksetzen
          </button>
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;

import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type DropdownSectionEditorProps = {
  sectionTitle: string;
  values: string[];
  onChange: (values: string[]) => void;
};

const normalizeValues = (values: string[]) => {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const DropdownSectionEditor = ({ sectionTitle, values, onChange }: DropdownSectionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValues, setDraftValues] = useState<string[]>(values);
  const [error, setError] = useState('');
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!isEditing) {
      setDraftValues(values);
    }
  }, [isEditing, values]);

  useEffect(() => {
    if (focusIndex === null) return;
    inputRefs.current[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex]);

  const listValues = useMemo(() => (isEditing ? draftValues : values), [draftValues, isEditing, values]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setError('');
  };

  const handleAddValue = () => {
    setDraftValues((prev) => {
      setFocusIndex(prev.length);
      return [...prev, ''];
    });
  };

  const handleSave = () => {
    if (draftValues.some((value) => !value.trim())) {
      setError('Bitte leere Einträge entfernen.');
      return;
    }
    const normalized = normalizeValues(draftValues);
    if (!normalized.length) {
      setError('Bitte mindestens einen Wert hinterlegen.');
      return;
    }
    const duplicates = draftValues
      .map((value) => value.trim())
      .filter(Boolean)
      .reduce<Record<string, number>>((acc, value) => {
        const key = value.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
    if (Object.values(duplicates).some((count) => count > 1)) {
      setError('Duplikate gefunden. Bitte eindeutige Werte verwenden.');
      return;
    }
    setError('');
    onChange(normalized);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftValues(values);
    setError('');
    setIsEditing(false);
  };

  return (
    <div className="card nested-card">
      <div className="section-header">
        <div>
          <h4>{sectionTitle}</h4>
          <p className="muted">Werte verwalten</p>
        </div>
        <div className="section-actions">
          {!isEditing ? (
            <IconButton label="Bearbeiten" onClick={handleStartEditing}>
              <Pencil size={18} aria-hidden="true" />
            </IconButton>
          ) : (
            <>
              <IconButton label="Wert hinzufügen" onClick={handleAddValue}>
                <Plus size={18} aria-hidden="true" />
              </IconButton>
              <IconButton label="Speichern" onClick={handleSave}>
                <Check size={18} aria-hidden="true" />
              </IconButton>
              <IconButton label="Abbrechen" onClick={handleCancel}>
                <X size={18} aria-hidden="true" />
              </IconButton>
            </>
          )}
        </div>
      </div>
      <div className="value-list">
        {listValues.length === 0 && <p className="muted">Keine Werte vorhanden.</p>}
        {listValues.map((value, index) => (
          <div key={`${sectionTitle}-${index}`} className="value-row">
            {isEditing ? (
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={value}
                onChange={(event) => {
                  setError('');
                  setDraftValues((prev) => prev.map((item, idx) => (idx === index ? event.target.value : item)));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddValue();
                  }
                  if (event.key === 'Backspace' && !value && draftValues.length > 1) {
                    event.preventDefault();
                    setDraftValues((prev) => prev.filter((_, idx) => idx !== index));
                  }
                }}
                aria-label={`Wert ${index + 1}`}
              />
            ) : (
              <span>{value}</span>
            )}
            {isEditing && (
              <IconButton
                label="Wert löschen"
                onClick={() => setDraftValues((prev) => prev.filter((_, idx) => idx !== index))}
              >
                <Trash2 size={18} aria-hidden="true" />
              </IconButton>
            )}
          </div>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

const IconButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button type="button" className="icon-button" onClick={onClick} aria-label={label} title={label}>
    {children}
  </button>
);

export default DropdownSectionEditor;

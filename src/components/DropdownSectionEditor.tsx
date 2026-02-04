import { useEffect, useMemo, useRef, useState } from 'react';

type DropdownSectionEditorProps = {
  sectionTitle: string;
  values: string[];
  onSave: (values: string[]) => void;
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

const DropdownSectionEditor = ({ sectionTitle, values, onSave }: DropdownSectionEditorProps) => {
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

  const handleAddValue = () => {
    setDraftValues((prev) => {
      setFocusIndex(prev.length);
      return [...prev, ''];
    });
  };

  const handleSave = () => {
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
    onSave(normalized);
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
            <IconButton label="Bearbeiten" onClick={() => setIsEditing(true)}>
              <PencilIcon />
            </IconButton>
          ) : (
            <>
              <IconButton label="Wert hinzufügen" onClick={handleAddValue}>
                <PlusIcon />
              </IconButton>
              <IconButton label="Speichern" onClick={handleSave}>
                <CheckIcon />
              </IconButton>
              <IconButton label="Abbrechen" onClick={handleCancel}>
                <XIcon />
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
                onChange={(event) =>
                  setDraftValues((prev) => prev.map((item, idx) => (idx === index ? event.target.value : item)))
                }
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
                <TrashIcon />
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
  children: React.ReactNode;
}) => (
  <button type="button" className="icon-button" onClick={onClick} aria-label={label} title={label}>
    {children}
  </button>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 7h12M9 7V5h6v2M9 10v7M15 10v7M7 7l1 12h8l1-12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 20l4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20zM14 6l4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M6 6l12 12M18 6l-12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default DropdownSectionEditor;

export type DropdownSection = { id: string; label: string; values: string[] };

export interface SettingsData {
  dropdownSections: DropdownSection[];
  locations?: string[];
  departments?: string[];
  categories?: string[];
}

const SETTINGS_KEY = 'klinikbeschwerde_settings';

const defaultSettings: SettingsData = {
  dropdownSections: [
    { id: 'locations', label: 'Standorte', values: ['Hauptstandort', 'Außenstelle', 'MVZ'] },
    {
      id: 'departments',
      label: 'Abteilungen / Stationen',
      values: ['Notaufnahme', 'Innere Medizin', 'Chirurgie', 'Intensivstation', 'Radiologie'],
    },
    {
      id: 'categories',
      label: 'Kategorien',
      values: [
        'Pflege',
        'Ärztlich',
        'Wartezeit',
        'Organisation',
        'Abrechnung',
        'Hygiene',
        'Kommunikation',
        'Sonstiges',
      ],
    },
  ],
};

const normalizeValues = (values: string[]) => {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
};

const normalizeSections = (sections: DropdownSection[]) =>
  sections.map((section) => ({
    ...section,
    label: section.label.trim(),
    values: normalizeValues(section.values ?? []),
  }));

export const getSectionValues = (settings: SettingsData, id: string): string[] => {
  const section = settings.dropdownSections?.find((item) => item.id === id);
  return section?.values ?? [];
};

export const loadSettings = (): SettingsData => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as SettingsData;
    if (parsed.dropdownSections?.length) {
      return { dropdownSections: normalizeSections(parsed.dropdownSections) };
    }
    const locations = normalizeValues(parsed.locations ?? defaultSettings.dropdownSections[0].values);
    const departments = normalizeValues(parsed.departments ?? defaultSettings.dropdownSections[1].values);
    const categories = normalizeValues(parsed.categories ?? defaultSettings.dropdownSections[2].values);
    return {
      dropdownSections: [
        { id: 'locations', label: 'Standorte', values: locations },
        { id: 'departments', label: 'Abteilungen / Stationen', values: departments },
        { id: 'categories', label: 'Kategorien', values: categories },
      ],
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: SettingsData) => {
  const normalized = {
    ...settings,
    dropdownSections: normalizeSections(settings.dropdownSections ?? []),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
};

export const resetSettings = () => {
  saveSettings(defaultSettings);
};

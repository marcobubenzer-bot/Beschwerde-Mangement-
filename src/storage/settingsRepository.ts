export interface SettingsData {
  locations: string[];
  departments: string[];
  categories: string[];
}

const SETTINGS_KEY = 'klinikbeschwerde_settings';

const defaultSettings: SettingsData = {
  locations: ['Hauptstandort', 'Außenstelle', 'MVZ'],
  departments: ['Notaufnahme', 'Innere Medizin', 'Chirurgie', 'Intensivstation', 'Radiologie'],
  categories: [
    'Pflege',
    'Ärztlich',
    'Wartezeit',
    'Organisation',
    'Abrechnung',
    'Hygiene',
    'Kommunikation',
    'Sonstiges',
  ],
};

export const loadSettings = (): SettingsData => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as SettingsData;
    return {
      locations: parsed.locations?.length ? parsed.locations : defaultSettings.locations,
      departments: parsed.departments?.length ? parsed.departments : defaultSettings.departments,
      categories: parsed.categories?.length ? parsed.categories : defaultSettings.categories,
    };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: SettingsData) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const resetSettings = () => {
  saveSettings(defaultSettings);
};

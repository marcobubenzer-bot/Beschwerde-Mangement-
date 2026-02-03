import { v4 as uuidv4 } from 'uuid';
import { Complaint } from '../types/complaint';
import { generateCaseNumber } from '../services/caseNumberService';

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const categories = [
  'Pflege',
  'Ärztlich',
  'Wartezeit',
  'Organisation',
  'Abrechnung',
  'Hygiene',
  'Kommunikation',
  'Sonstiges',
] as const;
const priorities = ['Niedrig', 'Mittel', 'Hoch', 'Kritisch'] as const;
const statuses = ['Neu', 'In Prüfung', 'In Bearbeitung', 'Gelöst', 'Rückfrage'] as const;
const channels = ['Telefon', 'E-Mail', 'Brief', 'Persönlich', 'Online'] as const;
const reporters = ['Patient', 'Angehörige', 'Mitarbeitende', 'Sonstige'] as const;
const locations = ['Hauptstandort', 'Außenstelle', 'MVZ'];
const departments = ['Notaufnahme', 'Innere Medizin', 'Chirurgie', 'Radiologie', 'Pflege'];

export const createSampleComplaints = (count = 8): Complaint[] => {
  const now = new Date();
  return Array.from({ length: count }).map((_, index) => {
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - index * 4);
    return {
      id: uuidv4(),
      caseNumber: generateCaseNumber(),
      createdAt: createdAt.toISOString(),
      reporterType: pick([...reporters]),
      reporterName: `Person ${index + 1}`,
      contact: `person${index + 1}@mail.de`,
      location: pick(locations),
      department: pick(departments),
      category: pick([...categories]),
      priority: pick([...priorities]),
      channel: pick([...channels]),
      description: 'Beschwerde über Wartezeiten und Informationsfluss. Bitte prüfen und Rückmeldung geben.',
      involvedPeople: 'Team Station B',
      consent: true,
      status: pick([...statuses]),
      owner: 'QM-Team',
      dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      measures: 'Erste Analyse durchgeführt. Gespräch mit Stationsleitung geplant.',
      tags: ['Patientenzufriedenheit', 'Prozess'],
      attachmentIds: [],
      notes: [
        {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          text: 'Meldung aufgenommen und priorisiert.',
        },
      ],
    };
  });
};

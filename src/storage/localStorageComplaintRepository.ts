import { Complaint } from '../types/complaint';
import { ComplaintRepository } from './complaintRepository';

const STORAGE_KEY = 'klinikbeschwerde_complaints';

const load = (): Complaint[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Complaint[];
  } catch {
    return [];
  }
};

const save = (items: Complaint[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export class LocalStorageComplaintRepository implements ComplaintRepository {
  async list(): Promise<Complaint[]> {
    return load();
  }

  async getById(id: string): Promise<Complaint | undefined> {
    return load().find((item) => item.id === id);
  }

  async create(complaint: Complaint): Promise<void> {
    const items = load();
    items.unshift(complaint);
    save(items);
  }

  async update(complaint: Complaint): Promise<void> {
    const items = load().map((item) => (item.id === complaint.id ? complaint : item));
    save(items);
  }

  async remove(id: string): Promise<void> {
    const items = load().filter((item) => item.id !== id);
    save(items);
  }

  async clear(): Promise<void> {
    save([]);
  }
}

export const complaintRepository = new LocalStorageComplaintRepository();

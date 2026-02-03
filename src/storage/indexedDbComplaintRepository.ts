import { Complaint } from '../types/complaint';
import { ComplaintRepository } from './complaintRepository';
import { requestToPromise, runTransaction } from './indexedDb';

export class IndexedDbComplaintRepository implements ComplaintRepository {
  async list(): Promise<Complaint[]> {
    return runTransaction('complaints', 'readonly', async (store) => {
      const request = store.getAll();
      const items = await requestToPromise<Complaint[]>(request);
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  }

  async getById(id: string): Promise<Complaint | undefined> {
    return runTransaction('complaints', 'readonly', async (store) => {
      const request = store.get(id);
      return requestToPromise<Complaint | undefined>(request);
    });
  }

  async create(complaint: Complaint): Promise<void> {
    await runTransaction('complaints', 'readwrite', async (store) => {
      await requestToPromise(store.add(complaint));
    });
  }

  async update(complaint: Complaint): Promise<void> {
    await runTransaction('complaints', 'readwrite', async (store) => {
      await requestToPromise(store.put(complaint));
    });
  }

  async remove(id: string): Promise<void> {
    await runTransaction('complaints', 'readwrite', async (store) => {
      await requestToPromise(store.delete(id));
    });
  }

  async clear(): Promise<void> {
    await runTransaction('complaints', 'readwrite', async (store) => {
      await requestToPromise(store.clear());
    });
  }
}

export const complaintRepository = new IndexedDbComplaintRepository();

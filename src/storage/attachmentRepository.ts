import { ComplaintAttachment } from '../types/complaint';
import { requestToPromise, runTransaction } from './indexedDb';

export interface AttachmentRepository {
  listAll(): Promise<ComplaintAttachment[]>;
  listByIds(ids: string[]): Promise<ComplaintAttachment[]>;
  create(attachment: ComplaintAttachment): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

export class IndexedDbAttachmentRepository implements AttachmentRepository {
  async listAll(): Promise<ComplaintAttachment[]> {
    return runTransaction('attachments', 'readonly', async (store) => {
      const request = store.getAll();
      return requestToPromise<ComplaintAttachment[]>(request);
    });
  }

  async listByIds(ids: string[]): Promise<ComplaintAttachment[]> {
    if (!ids.length) return [];
    return runTransaction('attachments', 'readonly', async (store) => {
      const items = await Promise.all(
        ids.map((id) => requestToPromise<ComplaintAttachment | undefined>(store.get(id)))
      );
      return items.filter((item): item is ComplaintAttachment => Boolean(item));
    });
  }

  async create(attachment: ComplaintAttachment): Promise<void> {
    await runTransaction('attachments', 'readwrite', async (store) => {
      await requestToPromise(store.add(attachment));
    });
  }

  async remove(id: string): Promise<void> {
    await runTransaction('attachments', 'readwrite', async (store) => {
      await requestToPromise(store.delete(id));
    });
  }

  async clear(): Promise<void> {
    await runTransaction('attachments', 'readwrite', async (store) => {
      await requestToPromise(store.clear());
    });
  }
}

export const attachmentRepository = new IndexedDbAttachmentRepository();

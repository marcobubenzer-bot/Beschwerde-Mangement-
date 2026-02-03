import { Complaint } from '../types/complaint';

export interface ComplaintRepository {
  list(): Promise<Complaint[]>;
  getById(id: string): Promise<Complaint | undefined>;
  create(complaint: Complaint): Promise<void>;
  update(complaint: Complaint): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

import { Complaint } from '../types/complaint';
import { toMonthKey } from './date';

export const countBy = (complaints: Complaint[], key: keyof Complaint) => {
  return complaints.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key] ?? 'Unbekannt');
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
};

export const groupByMonth = (complaints: Complaint[]) => {
  return complaints.reduce<Record<string, number>>((acc, item) => {
    const key = toMonthKey(item.createdAt);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
};

export const topDepartments = (complaints: Complaint[], limit = 5) => {
  const counts = countBy(complaints, 'department');
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, total]) => ({ name, total }));
};

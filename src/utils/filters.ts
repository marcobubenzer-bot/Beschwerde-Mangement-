import { Complaint, ComplaintFilters } from '../types/complaint';

export const applyFilters = (complaints: Complaint[], filters: ComplaintFilters) => {
  return complaints.filter((complaint) => {
    if (filters.status !== 'Alle' && complaint.status !== filters.status) return false;
    if (filters.category !== 'Alle' && complaint.category !== filters.category) return false;
    if (filters.priority !== 'Alle' && complaint.priority !== filters.priority) return false;
    if (filters.location && !complaint.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (
      filters.department &&
      !complaint.department.toLowerCase().includes(filters.department.toLowerCase())
    ) {
      return false;
    }
    if (filters.dateFrom && new Date(complaint.createdAt) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(complaint.createdAt) > new Date(filters.dateTo)) return false;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const blob = [
        complaint.caseNumber,
        complaint.description,
        complaint.reporterName,
        complaint.location,
        complaint.department,
        complaint.category,
        complaint.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!blob.includes(query)) return false;
    }
    return true;
  });
};

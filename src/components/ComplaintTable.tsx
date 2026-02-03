import { Complaint } from '../types/complaint';
import { formatDate } from '../utils/date';

interface ComplaintTableProps {
  complaints: Complaint[];
  onSelect: (complaint: Complaint) => void;
}

const ComplaintTable = ({ complaints, onSelect }: ComplaintTableProps) => {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Vorgang</th>
            <th>Status</th>
            <th>Kategorie</th>
            <th>Priorität</th>
            <th>Standort</th>
            <th>Abteilung</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id} onClick={() => onSelect(complaint)}>
              <td>
                <strong>{complaint.caseNumber}</strong>
                <span className="muted">{complaint.reporterType}</span>
              </td>
              <td>
                <span className={`status-chip status-${complaint.status.replace(/\s/g, '-').toLowerCase()}`}>
                  {complaint.status}
                </span>
              </td>
              <td>{complaint.category}</td>
              <td>{complaint.priority}</td>
              <td>{complaint.location}</td>
              <td>{complaint.department}</td>
              <td>{formatDate(complaint.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!complaints.length && <p className="empty-state">Noch keine Beschwerden in dieser Ansicht.</p>}
    </div>
  );
};

export default ComplaintTable;

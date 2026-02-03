import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { complaintRepository } from '../storage/indexedDbComplaintRepository';
import { attachmentRepository } from '../storage/attachmentRepository';
import { Complaint, ComplaintAttachment } from '../types/complaint';
import { exportComplaintPdf } from '../utils/pdf';
import { formatDateTime } from '../utils/date';

const ConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const isAdminView = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!id) return;
    complaintRepository.getById(id).then((data) => {
      if (!data) {
        setComplaint(null);
        return;
      }
      setComplaint(data);
      attachmentRepository.listByIds(data.attachmentIds).then(setAttachments);
    });
  }, [id]);

  if (!complaint) {
    return (
      <div className="card">
        <h2>Vorgang nicht gefunden</h2>
        <Link to="/report" className="button ghost">
          Zurück zum Formular
        </Link>
      </div>
    );
  }

  return (
    <section>
      <div className="card confirmation">
        <h2>Beschwerde erfasst</h2>
        <p>Vielen Dank! Die Beschwerde wurde gespeichert.</p>
        <div className="confirmation-box">
          <div>
            <span className="muted">Vorgangsnummer</span>
            <h3>{complaint.caseNumber}</h3>
          </div>
          <div>
            <span className="muted">Erstellt am</span>
            <h4>{formatDateTime(complaint.createdAt)}</h4>
          </div>
          <button className="button primary" onClick={() => void exportComplaintPdf(complaint, attachments)}>
            PDF Fallblatt exportieren
          </button>
        </div>
        <div className="confirmation-actions">
          <Link to="/report" className="button ghost">
            Neue Beschwerde
          </Link>
          {isAdminView && (
            <Link to="/admin/complaints" className="button ghost">
              Zur Vorgangsliste
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConfirmationPage;

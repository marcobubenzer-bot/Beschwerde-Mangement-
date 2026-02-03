import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { complaintRepository } from '../storage/localStorageComplaintRepository';
import { Complaint } from '../types/complaint';
import { exportComplaintPdf } from '../utils/pdf';
import { formatDateTime } from '../utils/date';

const ConfirmationPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (!id) return;
    complaintRepository.getById(id).then((data) => setComplaint(data ?? null));
  }, [id]);

  if (!complaint) {
    return (
      <div className="card">
        <h2>Vorgang nicht gefunden</h2>
        <Link to="/complaints" className="button ghost">
          Zurück zur Übersicht
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
          <button className="button primary" onClick={() => exportComplaintPdf(complaint)}>
            PDF Fallblatt exportieren
          </button>
        </div>
        <div className="confirmation-actions">
          <Link to="/new" className="button ghost">
            Neue Beschwerde
          </Link>
          <Link to="/complaints" className="button ghost">
            Zur Vorgangsliste
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ConfirmationPage;

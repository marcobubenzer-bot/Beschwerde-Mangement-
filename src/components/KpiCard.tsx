interface KpiCardProps {
  label: string;
  value: number | string;
  highlight?: boolean;
}

const KpiCard = ({ label, value, highlight }: KpiCardProps) => {
  return (
    <div className={`card kpi ${highlight ? 'kpi-highlight' : ''}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
};

export default KpiCard;

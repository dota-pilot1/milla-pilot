export default function Progress({ value, label }) {
  return (
    <div className="progress" aria-label={label} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <span className="progress__bar" style={{ width: `${value}%` }} />
    </div>
  );
}

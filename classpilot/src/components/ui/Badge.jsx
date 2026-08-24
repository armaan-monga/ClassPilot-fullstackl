export default function Badge({ children, className = "" }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

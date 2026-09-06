export default function Card({ children, className = "", solid = false, as: As = "div", ...props }) {
  return (
    <As className={`${solid ? "glass-card-solid" : "glass-card"} p-6 ${className}`} {...props}>
      {children}
    </As>
  );
}

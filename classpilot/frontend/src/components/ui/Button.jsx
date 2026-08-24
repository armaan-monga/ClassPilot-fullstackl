const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
};

export default function Button({
  children,
  variant = "primary",
  icon: Icon,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        Icon && <Icon size={17} strokeWidth={2.4} />
      )}
      {children}
    </button>
  );
}

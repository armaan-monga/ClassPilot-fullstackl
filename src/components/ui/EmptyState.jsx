export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-iris-200/70 bg-iris-50/40 px-6 py-14 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
          <Icon size={26} className="text-iris-500" strokeWidth={1.8} />
        </div>
      )}
      <h4 className="font-display text-lg font-semibold text-ink">{title}</h4>
      {description && <p className="max-w-sm text-sm text-ink/55">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

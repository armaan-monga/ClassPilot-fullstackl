import { Clock, CalendarX } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function TodaysClasses({ classes = [] }) {
  if (!classes.length) {
    return <EmptyState icon={CalendarX} title="No classes today" description="Enjoy the day off!" />;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {classes.map((c) => (
        <div key={c._id} className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-white px-3.5 py-3">
          <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.colorTag }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{c.batchName}</p>
            <p className="text-xs text-ink/50">{c.class}</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-ink/60">
            <Clock size={13} />
            {c.timing || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

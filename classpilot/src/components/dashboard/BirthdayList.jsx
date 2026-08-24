import { Cake } from "lucide-react";
import { initials } from "../../utils/formatters";
import EmptyState from "../ui/EmptyState";

export default function BirthdayList({ birthdays = [] }) {
  if (!birthdays.length) {
    return <EmptyState icon={Cake} title="No birthdays soon" description="Nothing in the next 30 days." />;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {birthdays.map((b, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-blossom-50/60 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blossom-500 text-xs font-bold text-white">
            {initials(b.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{b.name}</p>
            <p className="text-xs text-ink/50">
              {b.daysAway === 0 ? "Today! 🎉" : b.daysAway === 1 ? "Tomorrow" : `In ${b.daysAway} days`}
            </p>
          </div>
          <Cake size={16} className="text-blossom-400" />
        </div>
      ))}
    </div>
  );
}

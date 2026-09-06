import { IndianRupee, UserPlus, Activity } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import { formatDate } from "../../utils/formatters";

const ICONS = {
  payment: { icon: IndianRupee, bg: "bg-meadow-100 text-meadow-600" },
  student_added: { icon: UserPlus, bg: "bg-petrol-100 text-petrol-600" },
};

export default function ActivityFeed({ activity = [] }) {
  if (!activity.length) {
    return <EmptyState icon={Activity} title="No activity yet" description="Actions will show up here as you use ClassPilot." />;
  }

  return (
    <div className="flex flex-col gap-1">
      {activity.map((a, i) => {
        const conf = ICONS[a.type] || ICONS.student_added;
        const Icon = conf.icon;
        return (
          <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink/[0.02]">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${conf.bg}`}>
              <Icon size={14} />
            </div>
            <p className="flex-1 truncate text-sm text-ink/80">{a.text}</p>
            <span className="shrink-0 text-xs text-ink/40">{formatDate(a.date)}</span>
          </div>
        );
      })}
    </div>
  );
}

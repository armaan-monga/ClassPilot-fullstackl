import { initials } from "../../utils/formatters";

const STATUSES = [
  { value: "Present", color: "bg-meadow-500", soft: "bg-meadow-100 text-meadow-700" },
  { value: "Absent", color: "bg-blossom-500", soft: "bg-blossom-100 text-blossom-700" },
  { value: "Leave", color: "bg-tangerine-500", soft: "bg-tangerine-100 text-tangerine-700" },
];

export default function AttendanceGrid({ records, onChange }) {
  return (
    <div className="divide-y divide-ink/5">
      {records.map((r) => (
        <div key={r.student} className="flex flex-wrap items-center gap-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-iris-500 text-xs font-bold text-white">
            {initials(r.fullName)}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{r.fullName}</p>
          <div className="flex gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange(r.student, s.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  r.status === s.value ? `${s.color} text-white` : `${s.soft} opacity-60 hover:opacity-100`
                }`}
              >
                {s.value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

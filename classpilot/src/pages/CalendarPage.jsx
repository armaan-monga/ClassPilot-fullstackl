import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Cake, IndianRupee, Clock } from "lucide-react";
import { getBatches } from "../services/batches";
import { getFees } from "../services/fees";
import { getStudents } from "../services/students";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import { MONTH_NAMES, WEEKDAYS } from "../utils/constants";
import { formatCurrency } from "../utils/formatters";

const FULL_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [batches, setBatches] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const month = cursor.getMonth();
  const year = cursor.getFullYear();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getBatches(),
      getFees({ month: month + 1, year, limit: 500 }),
      getStudents({ limit: 500 }),
    ])
      .then(([b, f, s]) => {
        setBatches(b.data.data);
        setFees(f.data.data);
        setStudents(s.data.data);
      })
      .finally(() => setLoading(false));
  }, [month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const dayInfo = useMemo(() => {
    const map = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const weekdayName = FULL_WEEKDAYS[new Date(year, month, d).getDay()];
      const classesToday = batches.filter((b) => b.days?.includes(weekdayName));
      const feesToday = fees.filter((f) => new Date(f.dueDate).getDate() === d);
      const birthdaysToday = students.filter((s) => {
        if (!s.dateOfBirth) return false;
        const dob = new Date(s.dateOfBirth);
        return dob.getDate() === d && dob.getMonth() === month;
      });
      map[d] = { classes: classesToday, fees: feesToday, birthdays: birthdaysToday };
    }
    return map;
  }, [batches, fees, students, daysInMonth, month, year]);

  const today = new Date();
  const isToday = (d) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

  const selected = selectedDay ? dayInfo[selectedDay] : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Calendar</h1>
          <p className="text-sm text-ink/50">Classes, fee due dates, and birthdays — all in one view.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-xl border border-ink/10 p-2 hover:bg-white"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="w-36 text-center font-display text-sm font-bold text-ink">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-xl border border-ink/10 p-2 hover:bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading calendar..." />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="!p-4 lg:col-span-2">
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase tracking-wide text-ink/35">
              {WEEKDAYS.concat().map((d) => <div key={d}>{d.slice(0, 2)}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Offset so Monday-first grid aligns; firstDayOfWeek is Sun-based (0=Sun) */}
              {Array.from({ length: (firstDayOfWeek + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const info = dayInfo[d];
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`flex h-20 flex-col items-start gap-1 rounded-xl border p-1.5 text-left transition-colors ${
                      selectedDay === d
                        ? "border-iris-400 bg-iris-50"
                        : isToday(d)
                        ? "border-iris-200 bg-white"
                        : "border-ink/5 bg-white hover:border-iris-200"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday(d) ? "text-iris-600" : "text-ink/60"}`}>{d}</span>
                    <div className="flex flex-wrap gap-0.5">
                      {info.classes.slice(0, 4).map((b, i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: b.colorTag }} />
                      ))}
                      {info.fees.length > 0 && <IndianRupee size={9} className="text-tangerine-500" />}
                      {info.birthdays.length > 0 && <Cake size={9} className="text-blossom-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 font-display text-sm font-bold text-ink">
              {selectedDay ? `${MONTH_NAMES[month]} ${selectedDay}, ${year}` : "Select a day"}
            </h3>
            {!selected ? (
              <p className="text-sm text-ink/45">Tap any date to see what's happening.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {selected.classes.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink/35">Classes</p>
                    {selected.classes.map((b) => (
                      <div key={b._id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-ink/[0.02] px-3 py-2 text-sm">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.colorTag }} />
                        <span className="flex-1 font-medium text-ink">{b.batchName}</span>
                        <span className="flex items-center gap-1 text-xs text-ink/45"><Clock size={11} /> {b.timing}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selected.fees.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink/35">Fee Due</p>
                    {selected.fees.map((f) => (
                      <div key={f._id} className="mb-1.5 flex items-center justify-between rounded-xl bg-tangerine-50 px-3 py-2 text-sm">
                        <span className="font-medium text-ink">{f.student?.fullName}</span>
                        <span className="font-mono text-xs text-tangerine-700">{formatCurrency(f.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selected.birthdays.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink/35">Birthdays 🎂</p>
                    {selected.birthdays.map((s) => (
                      <div key={s._id} className="mb-1.5 flex items-center gap-2 rounded-xl bg-blossom-50 px-3 py-2 text-sm">
                        <Cake size={14} className="text-blossom-500" />
                        <span className="font-medium text-ink">{s.fullName}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selected.classes.length === 0 && selected.fees.length === 0 && selected.birthdays.length === 0 && (
                  <p className="text-sm text-ink/45">Nothing scheduled this day.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

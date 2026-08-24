import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Phone, School, MapPin, Pencil, CalendarCheck2, IndianRupee } from "lucide-react";
import { getStudent } from "../api/students";
import { getBatches } from "../api/batches";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import StudentFormModal from "../components/students/StudentFormModal";
import { initials, formatCurrency, formatDate } from "../utils/formatters";
import { FEE_STATUS_STYLES, MONTH_NAMES } from "../utils/constants";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getStudent(id)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getBatches().then((res) => setBatches(res.data.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader label="Loading student..." />;
  if (!data) return null;

  const { student, fees, attendancePercentage } = data;

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-iris-500 text-xl font-bold text-white shadow-glow">
            {initials(student.fullName)}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{student.fullName}</h1>
            <p className="text-sm text-ink/50">{student.class}</p>
            <span
              className="pill mt-1"
              style={{ backgroundColor: `${student.batch?.colorTag}1A`, color: student.batch?.colorTag }}
            >
              {student.batch?.batchName}
            </span>
          </div>
        </div>
        <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
          Edit Details
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="mb-3 font-display text-sm font-bold text-ink">Contact Info</h3>
          <div className="flex flex-col gap-2.5 text-sm text-ink/70">
            <p className="flex items-center gap-2"><Phone size={14} className="text-ink/35" /> {student.phone || "—"}</p>
            <p className="flex items-center gap-2"><School size={14} className="text-ink/35" /> {student.schoolName || "—"}</p>
            <p className="flex items-center gap-2"><MapPin size={14} className="text-ink/35" /> {student.address || "—"}</p>
          </div>
          <div className="mt-4 border-t border-ink/5 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Parent</p>
            <p className="mt-1 text-sm font-medium text-ink">{student.parentName || "—"}</p>
            <p className="text-sm text-ink/60">{student.parentPhone || "—"}</p>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink/40">
            <CalendarCheck2 size={13} /> Attendance
          </p>
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle cx="56" cy="56" r="46" stroke="#F1EEFE" strokeWidth="11" fill="none" />
              <circle
                cx="56" cy="56" r="46" stroke="#3DB88B" strokeWidth="11" fill="none"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - attendancePercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-display text-xl font-bold text-ink">{attendancePercentage}%</span>
          </div>
        </Card>

        <Card>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink/40">
            <IndianRupee size={13} /> Fee Summary
          </p>
          <p className="font-display text-2xl font-bold text-ink">{formatCurrency(student.monthlyFee)}</p>
          <p className="text-xs text-ink/45">per month</p>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="pill bg-meadow-100 text-meadow-700">
              {fees.filter((f) => f.status === "Paid").length} paid
            </span>
            <span className="pill bg-tangerine-100 text-tangerine-700">
              {fees.filter((f) => f.status !== "Paid").length} pending
            </span>
          </div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <h3 className="px-5 pt-5 pb-2 font-display text-sm font-bold text-ink">Fee History</h3>
        {fees.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink/45">No fee records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-ink/5 bg-ink/[0.02] text-left text-xs font-bold uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-2.5">Month</th>
                  <th className="px-5 py-2.5">Amount</th>
                  <th className="px-5 py-2.5">Due Date</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f._id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-2.5 font-medium text-ink">
                      {MONTH_NAMES[f.month - 1]} {f.year}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-ink/70">{formatCurrency(f.amount)}</td>
                    <td className="px-5 py-2.5 text-ink/60">{formatDate(f.dueDate)}</td>
                    <td className="px-5 py-2.5">
                      <span className={`pill ${FEE_STATUS_STYLES[f.status]}`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <StudentFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={load}
        batches={batches}
        student={student}
      />
    </div>
  );
}

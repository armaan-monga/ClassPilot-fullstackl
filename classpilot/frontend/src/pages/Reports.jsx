import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileText, FileSpreadsheet, TrendingUp, Users, CalendarCheck2, IndianRupee } from "lucide-react";
import { getFees } from "../api/fees";
import { getStudents } from "../api/students";
import { getBatches } from "../api/batches";
import { getDashboardStats } from "../api/dashboard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Loader from "../components/ui/Loader";
import { formatCurrency, formatDate } from "../utils/formatters";
import { MONTH_NAMES } from "../utils/constants";
import { exportToExcel } from "../utils/exportExcel";
import { exportToPdf } from "../utils/exportPdf";

const REPORT_TYPES = [
  { value: "collection", label: "Monthly Collection Report" },
  { value: "pending", label: "Pending Fees Report" },
  { value: "students", label: "Student Report" },
  { value: "batches", label: "Batch Report" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("collection");
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getFees({ limit: 500 }),
      getStudents({ limit: 500 }),
      getBatches(),
      getDashboardStats(),
    ])
      .then(([feesRes, studentsRes, batchesRes, statsRes]) => {
        setFees(feesRes.data.data);
        setStudents(studentsRes.data.data);
        setBatches(batchesRes.data.data);
        setStats(statsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const buildRows = () => {
    if (reportType === "collection") {
      return fees
        .filter((f) => f.status === "Paid")
        .map((f) => [
          f.student?.fullName,
          `${MONTH_NAMES[f.month - 1]} ${f.year}`,
          formatCurrency(f.amount),
          f.paymentMode || "—",
          formatDate(f.paidDate),
        ]);
    }
    if (reportType === "pending") {
      return fees
        .filter((f) => f.status !== "Paid")
        .map((f) => [
          f.student?.fullName,
          `${MONTH_NAMES[f.month - 1]} ${f.year}`,
          formatCurrency(f.amount + (f.lateFee || 0) - f.paidAmount),
          f.status,
          formatDate(f.dueDate),
        ]);
    }
    if (reportType === "students") {
      return students.map((s) => [s.fullName, s.batch?.batchName, s.class, s.phone, formatCurrency(s.monthlyFee), s.status]);
    }
    return batches.map((b) => [b.batchName, b.class, `${b.currentStudents}/${b.maxStudents}`, formatCurrency(b.monthlyFee), b.timing]);
  };

  const columnsFor = {
    collection: ["Student", "Month", "Amount", "Mode", "Paid On"],
    pending: ["Student", "Month", "Amount Due", "Status", "Due Date"],
    students: ["Name", "Batch", "Class", "Phone", "Monthly Fee", "Status"],
    batches: ["Batch", "Class", "Students", "Monthly Fee", "Timing"],
  };

  const handleExportPdf = () => {
    const rows = buildRows();
    if (rows.length === 0) return toast.error("Nothing to export");
    exportToPdf(REPORT_TYPES.find((r) => r.value === reportType).label, columnsFor[reportType], rows, reportType);
  };

  const handleExportExcel = () => {
    const rows = buildRows();
    if (rows.length === 0) return toast.error("Nothing to export");
    const objRows = rows.map((r) => Object.fromEntries(columnsFor[reportType].map((c, i) => [c, r[i]])));
    exportToExcel(objRows, reportType);
  };

  if (loading) return <Loader label="Crunching your numbers..." />;

  const rows = buildRows();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Reports</h1>
        <p className="text-sm text-ink/50">See the big picture, then export whatever you need.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="!p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/45"><IndianRupee size={13} /> Total Revenue</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{formatCurrency(stats?.totalRevenue)}</p>
        </Card>
        <Card className="!p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/45"><TrendingUp size={13} /> This Month</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{formatCurrency(stats?.collectionThisMonth)}</p>
        </Card>
        <Card className="!p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/45"><Users size={13} /> Students</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{stats?.totalStudents}</p>
        </Card>
        <Card className="!p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/45"><CalendarCheck2 size={13} /> Attendance</p>
          <p className="mt-1 font-display text-xl font-bold text-ink">{stats?.attendancePercentage}%</p>
        </Card>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Select label="Report" value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-64">
            {REPORT_TYPES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Button variant="secondary" icon={FileText} onClick={handleExportPdf}>
              Export PDF
            </Button>
            <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExportExcel}>
              Export Excel
            </Button>
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/45">No data for this report yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/5 bg-ink/[0.02] text-left text-xs font-bold uppercase tracking-wide text-ink/40">
                  {columnsFor[reportType].map((c) => (
                    <th key={c} className="px-5 py-3">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-ink/5 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-5 py-2.5 text-ink/75">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

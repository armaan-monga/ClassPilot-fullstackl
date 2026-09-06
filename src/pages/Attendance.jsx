import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { CalendarCheck, Save, Users } from "lucide-react";
import { getBatches } from "../services/batches";
import { getAttendanceByBatchDate, markAttendance } from "../services/attendance";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import AttendanceGrid from "../components/attendance/AttendanceGrid";
import { toISODate } from "../utils/formatters";

export default function Attendance() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBatches().then((res) => {
      setBatches(res.data.data);
      if (res.data.data.length > 0) setBatchId(res.data.data[0]._id);
    });
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      const res = await getAttendanceByBatchDate(batchId, date);
      setRecords(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [batchId, date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const handleChange = (studentId, status) => {
    setRecords((prev) => prev.map((r) => (r.student === studentId ? { ...r, status } : r)));
  };

  const markAll = (status) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await markAttendance({
        batchId,
        date,
        records: records.map((r) => ({ studentId: r.student, status: r.status === "Not Marked" ? "Present" : r.status })),
      });
      toast.success("Attendance saved");
      loadAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Attendance</h1>
        <p className="text-sm text-ink/50">Mark today's class, or catch up on a past date.</p>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Batch" value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-56">
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName} ({b.class})
              </option>
            ))}
          </Select>
          <div>
            <label className="label-text">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-44" />
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={() => markAll("Present")}>
              Mark All Present
            </Button>
            <Button icon={Save} onClick={handleSave} loading={saving} disabled={records.length === 0}>
              Save Attendance
            </Button>
          </div>
        </div>
      </Card>

      {!batchId ? (
        <EmptyState icon={Users} title="Create a batch first" description="You'll need at least one batch with students to mark attendance." />
      ) : loading ? (
        <Loader label="Loading students..." />
      ) : records.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No students in this batch" description="Add students to this batch to start marking attendance." />
      ) : (
        <Card>
          <AttendanceGrid records={records} onChange={handleChange} />
        </Card>
      )}
    </div>
  );
}

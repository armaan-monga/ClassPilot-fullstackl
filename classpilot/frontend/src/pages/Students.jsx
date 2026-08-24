import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Search, Pencil, Trash2, ArrowRightLeft, Users, Phone } from "lucide-react";
import { getStudents, deleteStudent } from "../api/students";
import { getBatches } from "../api/batches";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import StudentFormModal from "../components/students/StudentFormModal";
import MoveBatchModal from "../components/students/MoveBatchModal";
import { initials, formatCurrency } from "../utils/formatters";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [movingStudent, setMovingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getStudents({
          search: search || undefined,
          batch: batchFilter || undefined,
          status: statusFilter || undefined,
          page,
          limit: 20,
        });
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    },
    [search, batchFilter, statusFilter]
  );

  useEffect(() => {
    getBatches().then((res) => setBatches(res.data.data));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadStudents(1), 300);
    return () => clearTimeout(timeout);
  }, [loadStudents]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudent(deletingStudent._id);
      toast.success("Student removed");
      setDeletingStudent(null);
      loadStudents(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete student");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Students</h1>
          <p className="text-sm text-ink/50">{pagination.total ?? students.length} students total</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingStudent(null);
            setFormOpen(true);
          }}
        >
          Add Student
        </Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, parent..."
              className="input-field pl-10"
            />
          </div>
          <Select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="w-48">
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Hold">On Hold</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Loader label="Loading students..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Try adjusting your filters, or add your first student to get started."
          action={
            <Button icon={Plus} onClick={() => setFormOpen(true)}>
              Add Student
            </Button>
          }
        />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/5 bg-ink/[0.02] text-left text-xs font-bold uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Batch</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Monthly Fee</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-ink/5 last:border-0 hover:bg-iris-50/40">
                    <td className="px-5 py-3">
                      <Link to={`/students/${s._id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-iris-500 text-xs font-bold text-white">
                          {initials(s.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{s.fullName}</p>
                          <p className="truncate text-xs text-ink/45">{s.class}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="pill"
                        style={{ backgroundColor: `${s.batch?.colorTag}1A`, color: s.batch?.colorTag }}
                      >
                        {s.batch?.batchName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink/70">
                      <span className="flex items-center gap-1.5"><Phone size={12} /> {s.phone || "—"}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-ink/80">{formatCurrency(s.monthlyFee)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`pill ${
                          s.status === "Active"
                            ? "bg-meadow-100 text-meadow-700"
                            : s.status === "On Hold"
                            ? "bg-tangerine-100 text-tangerine-700"
                            : "bg-ink/5 text-ink/50"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setMovingStudent(s)}
                          className="rounded-lg p-2 text-ink/40 hover:bg-sky-50 hover:text-sky-600"
                          title="Move batch"
                        >
                          <ArrowRightLeft size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(s);
                            setFormOpen(true);
                          }}
                          className="rounded-lg p-2 text-ink/40 hover:bg-iris-50 hover:text-iris-600"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(s)}
                          className="rounded-lg p-2 text-ink/40 hover:bg-blossom-50 hover:text-blossom-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-ink/5 py-3">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => loadStudents(p)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold ${
                    p === pagination.page ? "bg-iris-500 text-white" : "text-ink/50 hover:bg-ink/5"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      <StudentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => loadStudents(pagination.page)}
        batches={batches}
        student={editingStudent}
      />
      <MoveBatchModal
        open={Boolean(movingStudent)}
        onClose={() => setMovingStudent(null)}
        onMoved={() => loadStudents(pagination.page)}
        student={movingStudent}
        batches={batches}
      />
      <ConfirmDialog
        open={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete student?"
        description={`This will permanently remove ${deletingStudent?.fullName} and their fee/attendance history.`}
      />
    </div>
  );
}

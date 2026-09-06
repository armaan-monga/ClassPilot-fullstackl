import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, Pencil, Phone } from "lucide-react";
import { getBatch } from "../services/batches";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import BatchFormModal from "../components/batches/BatchFormModal";
import { formatCurrency, initials } from "../utils/formatters";

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getBatch(id)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loader label="Loading batch..." />;
  if (!data) return null;

  const { batch, students } = data;

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate(-1)}
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <Card className="relative overflow-hidden">
        <span className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: batch.colorTag }} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">{batch.batchName}</h1>
            <p className="text-sm text-ink/50">{batch.class} · {batch.subject || "General"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {batch.days?.map((d) => (
                <span key={d} className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink/50">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
            Edit Batch
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink/5 pt-4 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-xs text-ink/45"><Clock size={12} /> Timing</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{batch.timing || "—"}</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 text-xs text-ink/45"><Users size={12} /> Students</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{students.length}/{batch.maxStudents}</p>
          </div>
          <div>
            <p className="text-xs text-ink/45">Monthly Fee</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">{formatCurrency(batch.monthlyFee)}</p>
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <h3 className="px-5 pt-5 pb-3 font-display text-sm font-bold text-ink">Students in this Batch</h3>
        {students.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState icon={Users} title="No students yet" description="Add students to this batch from the Students page." />
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {students.map((s) => (
              <Link
                key={s._id}
                to={`/students/${s._id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-petrol-50/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-petrol-500 text-xs font-bold text-white">
                  {initials(s.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{s.fullName}</p>
                  <p className="flex items-center gap-1 text-xs text-ink/45"><Phone size={11} /> {s.phone || "—"}</p>
                </div>
                <span className="text-xs font-mono text-ink/50">{formatCurrency(s.monthlyFee)}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <BatchFormModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} batch={batch} />
    </div>
  );
}

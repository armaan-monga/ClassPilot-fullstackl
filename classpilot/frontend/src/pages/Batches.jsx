import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Search, Layers } from "lucide-react";
import { getBatches, deleteBatch } from "../api/batches";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import BatchCard from "../components/batches/BatchCard";
import BatchFormModal from "../components/batches/BatchFormModal";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [deletingBatch, setDeletingBatch] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBatches({ search: search || undefined });
      setBatches(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBatch(deletingBatch._id);
      toast.success("Batch deleted");
      setDeletingBatch(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete batch");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Batches</h1>
          <p className="text-sm text-ink/50">{batches.length} batches running</p>
        </div>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingBatch(null);
            setFormOpen(true);
          }}
        >
          Create Batch
        </Button>
      </div>

      <Card className="!p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches by name, class, subject..."
            className="input-field pl-10"
          />
        </div>
      </Card>

      {loading ? (
        <Loader label="Loading batches..." />
      ) : batches.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No batches yet"
          description="Create your first batch — e.g. Class 10 Morning Batch — to start adding students."
          action={
            <Button icon={Plus} onClick={() => setFormOpen(true)}>
              Create Batch
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <BatchCard
              key={b._id}
              batch={b}
              onEdit={(batch) => {
                setEditingBatch(batch);
                setFormOpen(true);
              }}
              onDelete={setDeletingBatch}
            />
          ))}
        </div>
      )}

      <BatchFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} batch={editingBatch} />
      <ConfirmDialog
        open={Boolean(deletingBatch)}
        onClose={() => setDeletingBatch(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete batch?"
        description={`"${deletingBatch?.batchName}" will be permanently deleted. This only works if no students are assigned to it.`}
      />
    </div>
  );
}

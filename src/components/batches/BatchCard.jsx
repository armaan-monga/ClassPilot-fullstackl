import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Clock, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

export default function BatchCard({ batch, onEdit, onDelete }) {
  const fillPercent = Math.min(100, Math.round((batch.currentStudents / (batch.maxStudents || 1)) * 100));

  return (
    <motion.div
      className="glass-card relative overflow-hidden p-5"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: batch.colorTag }} />

      <div className="mb-3 flex items-start justify-between">
        <Link to={`/batches/${batch._id}`} className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-ink">{batch.batchName}</h3>
          <p className="text-xs text-ink/50">{batch.class} · {batch.subject || "General"}</p>
        </Link>
        <div className="flex shrink-0 gap-1">
          <button onClick={() => onEdit(batch)} className="rounded-lg p-1.5 text-ink/35 hover:bg-petrol-50 hover:text-petrol-600">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(batch)} className="rounded-lg p-1.5 text-ink/35 hover:bg-oxblood-50 hover:text-oxblood-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 text-xs text-ink/55">
        <span className="flex items-center gap-1"><Clock size={12} /> {batch.timing || "No timing set"}</span>
      </div>

      {batch.days?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {batch.days.map((d) => (
            <span key={d} className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[10px] font-semibold text-ink/50">
              {d}
            </span>
          ))}
        </div>
      )}

      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-ink/60">
        <span className="flex items-center gap-1"><Users size={12} /> {batch.currentStudents}/{batch.maxStudents}</span>
        <span>{formatCurrency(batch.monthlyFee)}/mo</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
        <div className="h-full rounded-full" style={{ width: `${fillPercent}%`, backgroundColor: batch.colorTag }} />
      </div>

      <Link
        to={`/batches/${batch._id}`}
        className="mt-4 block rounded-xl bg-ink/[0.03] py-2 text-center text-xs font-semibold text-ink/60 hover:bg-ink/5"
      >
        View Batch
      </Link>
    </motion.div>
  );
}

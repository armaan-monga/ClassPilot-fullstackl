import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { generateMonthlyFees } from "../../services/fees";
import { MONTH_NAMES } from "../../utils/constants";

export default function GenerateFeesModal({ open, onClose, onGenerated, batches }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateMonthlyFees({ month, year, batchId: batchId || undefined });
      toast.success(res.data.message);
      onGenerated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't generate fees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Monthly Fees" width="max-w-sm">
      <p className="mb-4 text-sm text-ink/55">
        Creates a fee record for every active student (skips any that already exist).
      </p>
      <div className="flex flex-col gap-4">
        <Select label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </Select>
        <Select label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <Select label="Batch (optional)" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.batchName}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={handleGenerate} loading={loading} className="mt-5 w-full">
        Generate Fees
      </Button>
    </Modal>
  );
}

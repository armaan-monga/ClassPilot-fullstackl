import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Wallet, IndianRupee, Send } from "lucide-react";
import toast from "react-hot-toast";
import { getFees } from "../services/fees";
import { getBatches } from "../services/batches";
import { sendAllPendingReminders } from "../services/notifications";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import PaymentModal from "../components/fees/PaymentModal";
import GenerateFeesModal from "../components/fees/GenerateFeesModal";
import { formatCurrency, formatDate } from "../utils/formatters";
import { MONTH_NAMES } from "../utils/constants";

export default function Fees() {
  const { teacher } = useAuth();
  const [fees, setFees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedFee, setSelectedFee] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFees({
        status: statusFilter || undefined,
        month: monthFilter || undefined,
        limit: 50,
      });
      setFees(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, monthFilter]);

  useEffect(() => {
    load();
    getBatches().then((res) => setBatches(res.data.data));
  }, [load]);

  const handleSendAll = async () => {
    setSendingAll(true);
    try {
      const res = await sendAllPendingReminders(["WhatsApp"]);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send reminders");
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Fees</h1>
          <p className="text-sm text-ink/50">Track collections, chase pending fees, generate receipts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Send} onClick={handleSendAll} loading={sendingAll}>
            Send All Pending Reminders
          </Button>
          <Button icon={Plus} onClick={() => setGenerateOpen(true)}>
            Generate Monthly Fees
          </Button>
        </div>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Overdue">Overdue</option>
          </Select>
          <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-44">
            <option value="">All Months</option>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Loader label="Loading fees..." />
      ) : fees.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No fee records found"
          description="Generate monthly fees for your students to start tracking collections."
          action={
            <Button icon={Plus} onClick={() => setGenerateOpen(true)}>
              Generate Monthly Fees
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
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f._id} className="border-b border-ink/5 last:border-0 hover:bg-iris-50/40">
                    <td className="px-5 py-3">
                      <Link to={`/students/${f.student?._id}`} className="font-semibold text-ink hover:text-iris-600">
                        {f.student?.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="pill" style={{ backgroundColor: `${f.batch?.colorTag}1A`, color: f.batch?.colorTag }}>
                        {f.batch?.batchName}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{MONTH_NAMES[f.month - 1]} {f.year}</td>
                    <td className="px-5 py-3 font-mono text-ink/80">{formatCurrency(f.amount + (f.lateFee || 0))}</td>
                    <td className="px-5 py-3 text-ink/60">{formatDate(f.dueDate)}</td>
                    <td className="px-5 py-3"><FeeStatusBadge status={f.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {f.status === "Paid" ? (
                        <span className="text-xs font-semibold text-meadow-600">Settled</span>
                      ) : (
                        <button
                          onClick={() => setSelectedFee(f)}
                          className="inline-flex items-center gap-1 rounded-xl bg-iris-50 px-3 py-1.5 text-xs font-semibold text-iris-600 hover:bg-iris-100"
                        >
                          <IndianRupee size={12} /> Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PaymentModal
        open={Boolean(selectedFee)}
        onClose={() => setSelectedFee(null)}
        onUpdated={load}
        fee={selectedFee}
        instituteName={teacher?.instituteName}
        currency={teacher?.currency}
      />
      <GenerateFeesModal open={generateOpen} onClose={() => setGenerateOpen(false)} onGenerated={load} batches={batches} />
    </div>
  );
}

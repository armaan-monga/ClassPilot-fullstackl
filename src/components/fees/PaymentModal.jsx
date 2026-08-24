import { useState } from "react";
import toast from "react-hot-toast";
import { IndianRupee, Bell } from "lucide-react";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { markFeePaid, recordPartialPayment } from "../../services/fees";
import { sendReminder } from "../../services/notifications";
import { generateFeeReceipt } from "../../utils/exportPdf";
import { formatCurrency } from "../../utils/formatters";
import { MONTH_NAMES } from "../../utils/constants";

export default function PaymentModal({ open, onClose, onUpdated, fee, instituteName, currency }) {
  const [mode, setMode] = useState("full");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [partialAmount, setPartialAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  if (!fee) return null;

  const remaining = fee.amount + (fee.lateFee || 0) - fee.paidAmount;
  const monthLabel = `${MONTH_NAMES[fee.month - 1]} ${fee.year}`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (mode === "full") {
        await markFeePaid(fee._id, paymentMode);
        toast.success("Marked as paid");
        generateFeeReceipt({
          instituteName,
          studentName: fee.student?.fullName,
          monthLabel,
          amount: remaining,
          paidDate: new Date(),
          paymentMode,
          receiptNumber: `RCPT-${fee._id.slice(-6)}`,
          currency,
        });
      } else {
        const amt = Number(partialAmount);
        if (!amt || amt <= 0) {
          toast.error("Enter a valid amount");
          setLoading(false);
          return;
        }
        await recordPartialPayment(fee._id, { amount: amt, paymentMode });
        toast.success("Payment recorded");
      }
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't process payment");
    } finally {
      setLoading(false);
    }
  };

  const handleReminder = async (channel) => {
    setSendingReminder(true);
    try {
      await sendReminder(fee._id, [channel]);
      toast.success(`${channel} reminder sent`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`${fee.student?.fullName} — ${monthLabel}`} width="max-w-md">
      <div className="mb-4 rounded-2xl bg-iris-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-iris-600/70">Amount Due</p>
        <p className="font-display text-2xl font-bold text-iris-700">{formatCurrency(remaining, currency)}</p>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setMode("full")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === "full" ? "bg-iris-500 text-white" : "bg-ink/5 text-ink/60"}`}
        >
          Pay in Full
        </button>
        <button
          onClick={() => setMode("partial")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold ${mode === "partial" ? "bg-iris-500 text-white" : "bg-ink/5 text-ink/60"}`}
        >
          Partial Payment
        </button>
      </div>

      {mode === "partial" && (
        <Input
          label="Amount Received (₹)"
          type="number"
          max={remaining}
          value={partialAmount}
          onChange={(e) => setPartialAmount(e.target.value)}
          className="mb-4"
        />
      )}

      <Select label="Payment Mode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="mb-5">
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Bank">Bank Transfer</option>
      </Select>

      <Button icon={IndianRupee} onClick={handleConfirm} loading={loading} className="w-full">
        {mode === "full" ? "Mark as Paid" : "Record Payment"}
      </Button>

      <div className="mt-5 border-t border-ink/5 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">Send a Reminder Instead</p>
        <div className="flex gap-2">
          {["WhatsApp", "SMS", "Email"].map((channel) => (
            <Button
              key={channel}
              variant="secondary"
              icon={Bell}
              loading={sendingReminder}
              onClick={() => handleReminder(channel)}
              className="flex-1 !px-2 text-xs"
            >
              {channel}
            </Button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
